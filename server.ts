import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

import mammoth from "mammoth";

const app = express();
const PORT = 3000;

// Enable JSON and URL-encoded bodies with higher limits to support large documents and digitized materials
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Helper to initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in settings or environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Resilient helper to execute model generation with exponential backoff and transparent multi-model list of candidates
async function generateContentWithRetry(ai: any, params: {
  model: string;
  contents: any;
  config?: any;
}, maxRetriesPerModel = 3, initialDelay = 1500) {
  // Construct dynamic fallback path based on the starting model
  const candidateModels = [params.model];
  if (params.model !== "gemini-3.6-flash-lite") {
    candidateModels.push("gemini-3.6-flash-lite");
  }
  if (params.model !== "gemini-flash-latest" && !candidateModels.includes("gemini-flash-latest")) {
    candidateModels.push("gemini-flash-latest");
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    let delay = initialDelay;
    console.log(`[AI-Routing] Attempting request using model: ${model}`);

    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const callParams = {
          ...params,
          model: model
        };
        return await ai.models.generateContent(callParams);
      } catch (error: any) {
        lastError = error;
        const errorStr = String(error?.message || error).toLowerCase();
        console.error(`Gemini API call failed on model ${model} (Attempt ${attempt}/${maxRetriesPerModel}). Error:`, error?.message || error);

        const isRetryable = errorStr.includes("503") || 
                            errorStr.includes("unavailable") || 
                            errorStr.includes("429") || 
                            errorStr.includes("quota") || 
                            errorStr.includes("rate limit") || 
                            errorStr.includes("exhausted") ||
                            errorStr.includes("high demand") ||
                            errorStr.includes("resource_exhausted");

        if (isRetryable && attempt < maxRetriesPerModel) {
          console.warn(`Retryable error on ${model}. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5; // smoother exponential backoff
        } else {
          // Break inner loop to switch candidate model immediately or propagate non-retryable error
          if (!isRetryable) {
            throw error; // If it's a structural error (e.g. invalid request format), throw immediately
          }
          break; // Try next fallback model
        }
      }
    }
  }

  throw lastError || new Error("Hệ thống AI đang quá tải tạm thời. Thầy cô vui lòng thử lại sau một lát.");
}

// Ensure error handling
const handleRouteError = (res: any, error: any) => {
  console.error("Route Error:", error);
  let errorMsg = error?.message || "Đã xảy ra lỗi không xác định.";
  
  const errorStr = (typeof error === 'object' && error !== null) ? JSON.stringify(error) : String(error);
  const combinedText = (errorMsg + " " + errorStr).toLowerCase();

  if (combinedText.includes("503") || combinedText.includes("unavailable") || combinedText.includes("high demand")) {
    errorMsg = "Máy chủ AI của Google đang bị quá tải tạm thời (Lỗi 503: High Demand / Service Unavailable). Thầy cô vui lòng đợi khoảng 5 - 10 giây rồi nhấn nút 'Chạy ngay với Gemini' một lần nữa để tiếp tục!";
  } else if (combinedText.includes("429") || combinedText.includes("quota exceeded") || combinedText.includes("rate limit") || combinedText.includes("exhausted")) {
    errorMsg = "Tài khoản hoặc hệ thống đã đạt giới hạn cuộc gọi miễn phí trong ngày (Lỗi 429: Rate Limit / Quota Exceeded). Để tiếp tục sử dụng không giới hạn và mượt mà nhất, Thầy/Cô có thể dễ dàng thiết lập mã khóa API Key chính chủ của mình trong phần 'Cài đặt' của ứng dụng đề thi để có hạn mức cao hơn nhiều!";
  } else if (combinedText.includes("403") || combinedText.includes("api key") || combinedText.includes("invalid key") || combinedText.includes("forbidden")) {
    errorMsg = "Khóa API Key của Gemini không hợp lệ hoặc không có quyền truy cập. Thầy cô vui lòng kiểm tra lại phần thiết lập API Key trong cài đặt ứng dụng.";
  }
  
  res.status(500).json({ error: errorMsg });
};

// API: Generate questions based on topics and specifications
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { topic, subject, grade, count = 1, level, type = "TracNghiem" } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `Bạn là Chuyên gia Khảo thí STEM. Nhiệm vụ: Soạn ${count} câu hỏi môn ${subject} lớp ${grade}, chủ đề "${topic}".

    QUY TẮC ĐỊNH DẠNG (SỐNG CÒN):
    1. TOÁN HỌC: Inline dùng \\( ... \\), Block dùng \\[ ... \\]. Tuyệt đối không dùng $.
    2. HÓA HỌC: Luôn dùng \\ce{...}. Ví dụ: \\ce{Fe + CuSO4 -> FeSO4 + Cu}.
    3. HÌNH HỌC/ĐỒ THỊ: Nếu nội dung cần hình vẽ, hãy chèn mã SVG trong thẻ [FIGURE type="svg"]...[/FIGURE].
    4. CẤU TRÚC: Phải trả về JSON mảng đối tượng.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.6-flash",
      contents: `Soạn ${count} câu hỏi ${type === "TracNghiem" ? "Trắc nghiệm" : "Tự luận"} mức độ ${level || "NB"} về ${topic}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              noiDung: { type: Type.STRING },
              dangCau: { type: Type.STRING, enum: ["TracNghiem", "TuLuan"] },
              mucDo: { type: Type.STRING, enum: ["NB", "TH", "VD", "VDC"] },
              luaChon: { 
                type: Type.OBJECT, 
                properties: { 
                  A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } 
                }
              },
              dapAn: { type: Type.STRING },
              giaiThichCham: { type: Type.STRING },
              chuanKTKN: { type: Type.STRING }
            },
            required: ["noiDung", "dangCau", "mucDo", "dapAn", "giaiThichCham", "chuanKTKN"]
          }
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse generate-questions response text:", response.text);
      res.json([]);
    }
  } catch (error) {
    handleRouteError(res, error);
  }
});

// API: Extract questions from PDF/Image documents
app.post("/api/extract-questions-from-doc", async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: "Thiếu dữ liệu tài liệu dạng base64." });
    }
    const ai = getGeminiClient();

    const prompt = `Bạn là chuyên gia số hóa đề thi. Hãy trích xuất toàn bộ các câu hỏi từ tài liệu này thành định dạng JSON.
    Yêu cầu:
    1. Giữ nguyên nội dung, chuyển các công thức toán/lý/hóa sang LaTeX chuẩn (\\( ... \\) và \\ce{...}).
    2. Nếu có hình vẽ, hãy cố gắng mô tả lại bằng mã SVG đơn giản trong thẻ [FIGURE type="svg"].
    3. Phân loại mức độ (NB, TH, VD, VDC) dựa trên nội dung.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        { inlineData: { data: base64Data, mimeType: mimeType || "application/pdf" } },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              noiDung: { type: Type.STRING },
              dangCau: { type: Type.STRING, enum: ["TracNghiem", "TuLuan"] },
              mucDo: { type: Type.STRING },
              luaChon: { 
                type: Type.OBJECT, 
                properties: { A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } }
              },
              dapAn: { type: Type.STRING },
              giaiThichCham: { type: Type.STRING },
              chuanKTKN: { type: Type.STRING },
              monHoc: { type: Type.STRING },
              lop: { type: Type.STRING },
              chuDe: { type: Type.STRING }
            },
            required: ["noiDung", "dangCau", "dapAn"]
          }
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse extract-questions response text:", response.text);
      res.json([]);
    }
  } catch (error) {
    handleRouteError(res, error);
  }
});

// API: Extract matrices from Image documents
app.post("/api/extract-matrix-from-image", async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: "Thiếu dữ liệu hình ảnh dạng base64." });
    }
    const ai = getGeminiClient();

    const prompt = `Bạn là chuyên gia phân tích ma trận đề thi. Hãy trích xuất cấu trúc ma trận đề thi từ tài liệu/hình ảnh này thành định dạng JSON.
    Yêu cầu:
    1. Trả về mảng các đối tượng, mỗi đối tượng đại diện cho một chủ đề kiến thức.
    2. Mỗi đối tượng gồm: topic (tên chủ đề), NB (số câu nhận biết), TH (số câu thông hiểu), VD (số câu vận dụng), VDC (số câu vận dụng cao).
    3. Nếu giá trị nào không có, hãy để là 0.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        { inlineData: { data: base64Data, mimeType: mimeType || "image/png" } },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              NB: { type: Type.NUMBER },
              TH: { type: Type.NUMBER },
              VD: { type: Type.NUMBER },
              VDC: { type: Type.NUMBER }
            },
            required: ["topic", "NB", "TH", "VD", "VDC"]
          }
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse extract-matrix response text:", response.text);
      res.json([]);
    }
  } catch (error) {
    handleRouteError(res, error);
  }
});

// API: Suggest matrix structures based on topics and available resources
app.post("/api/suggest-smart-matrix", async (req, res) => {
  try {
    const { topics, totalQuestions, subject, inventoryStr } = req.body;
    const ai = getGeminiClient();

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Gợi ý ma trận ${totalQuestions} câu cho môn ${subject}. Các chủ đề: ${topics ? topics.join(', ') : ""}. Kho hiện có: ${inventoryStr || ""}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              NB: { type: Type.NUMBER },
              TH: { type: Type.NUMBER },
              VD: { type: Type.NUMBER },
              VDC: { type: Type.NUMBER }
            },
            required: ["topic", "NB", "TH", "VD", "VDC"]
          }
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse suggest-matrix response text:", response.text);
      res.json([]);
    }
  } catch (error) {
    handleRouteError(res, error);
  }
});

// API: Document digitization support for PDF, Word (.docx), TXT, and Images
app.post("/api/extract-text", async (req, res) => {
  try {
    const { base64, mimeType, fileName } = req.body;
    if (!base64) {
      return res.status(400).json({ error: "Không tìm thấy nội dung tệp ở dạng base64." });
    }

    // 1. If it's a Word document (.docx)
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName?.endsWith(".docx")) {
      const buffer = Buffer.from(base64, "base64");
      const result = await mammoth.extractRawText({ buffer });
      return res.json({ text: result.value });
    }

    // 2. If it's a plain text file (.txt)
    if (mimeType === "text/plain" || fileName?.endsWith(".txt")) {
      const decoded = Buffer.from(base64, "base64").toString("utf-8");
      return res.json({ text: decoded });
    }

    // 3. For PDF or Images, we let Gemini process with multimodal capability
    const ai = getGeminiClient();
    let currentMimeType = mimeType || "application/pdf";
    if (fileName?.endsWith(".pdf")) {
      currentMimeType = "application/pdf";
    } else if (fileName?.endsWith(".png")) {
      currentMimeType = "image/png";
    } else if (fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg")) {
      currentMimeType = "image/jpeg";
    } else if (fileName?.endsWith(".webp")) {
      currentMimeType = "image/webp";
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64,
            mimeType: currentMimeType
          }
        },
        "Hãy trích xuất và số hóa toàn bộ nội dung văn bản cốt lõi trong tài liệu này một cách chính xác nhất và đầy đủ tất cả các dòng, chương mục. Với công thức toán, hãy giữ nguyên và chuyển sang định dạng LaTeX chuẩn (bọc trong \\( ... \\) hoặc \\[ ... \\] đối với toán dòng và toán khối). Chỉ trả về nội dung văn bản được số hóa, không thêm vào lời giải thích hay lời bàn của bạn."
      ],
    });

    res.json({ text: response.text });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// API: Advanced AI Digitization with bounding box figure detection and single-dollar LaTeX formulas
app.post("/api/detect-figures", async (req, res) => {
  try {
    const { base64, mimeType } = req.body;
    if (!base64) {
      return res.status(400).json({ error: "Thiếu dữ liệu ảnh dạng base64." });
    }

    const ai = getGeminiClient();
    const currentMimeType = mimeType || "image/jpeg";

    const systemPrompt = `Bạn là chuyên gia số hóa đề thi chuyên sâu. Hãy phân tích hình ảnh đề thi được cung cấp và thực hiện các nhiệm vụ sau:
1. Phát hiện tất cả các biểu đồ, đồ thị, sơ đồ, hình vẽ minh họa hoặc hình vẽ hình học hiện diện trên trang.
2. Với mỗi hình phát hiện được, hãy khoanh vùng và trả về tọa độ bounding box chuẩn hóa trong khoảng [0, 1000] dưới dạng [ymin, xmin, ymax, xmax].
3. KHÔNG trích xuất bất cứ chữ hay văn bản nào nằm TRÊN hoặc BÊN TRONG các hình vẽ/biểu đồ này. Hãy thay thế hình vẽ bằng nhãn định vị trí dạng "[IMAGE_PLACEHOLDER_x]" (với x là chỉ số bắt đầu từ 0) tương ứng trong nội dung số hóa.
4. Trích xuất toàn bộ văn bản và câu hỏi còn lại trên trang một cách đầy đủ và chính xác nhất.
5. ĐẶC BIỆT: Tất cả công thức toán học và biểu thức phải được nhận diện và trả về dưới dạng LaTeX đặt trong cặp dấu $ kép kín (ví dụ: $E=mc^2$ hoặc $h(x) = ax^2 + bx + c$). Tuyệt đối không được dùng và bọc trong các thẻ như \\( ... \\) hay \\[ ... \\]. Hãy luôn sử dụng dấu $ để bọc công thức toán.

Bắt buộc trả về đúng định dạng JSON được chỉ định.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64,
            mimeType: currentMimeType
          }
        },
        { text: systemPrompt }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            figures: {
              type: Type.ARRAY,
              description: "Danh sách các hình vẽ, biểu đồ hoặc sơ đồ được phát hiện",
              items: {
                type: Type.OBJECT,
                properties: {
                  box_2d: {
                    type: Type.ARRAY,
                    description: "Tọa độ bounding box chuẩn hóa [ymin, xmin, ymax, xmax] từ 0 đến 1000",
                    items: { type: Type.INTEGER }
                  },
                  label: {
                    type: Type.STRING,
                    description: "Mô tả ngắn gọn về hình vẽ, ví dụ 'Hình học parabol' hoặc 'Sơ đồ nhiệt hóa'"
                  }
                },
                required: ["box_2d", "label"]
              }
            },
            transcribed_text: {
              type: Type.STRING,
              description: "Nội dung văn bản thi được số hóa đầy đủ, chứa các nhãn [IMAGE_PLACEHOLDER_x] tương ứng tại vị trí của hình vẽ, và các công thức bọc bằng $"
            }
          },
          required: ["figures", "transcribed_text"]
        }
      }
    });

    try {
      const resultObj = JSON.parse(response.text || "{}");
      res.json(resultObj);
    } catch (parseErr) {
      console.error("Lỗi parse kết quả detect figures:", response.text);
      res.status(500).json({ error: "Không thể phân tích dữ liệu JSON phản hồi từ mô hình AI." });
    }
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Step 1: Analysing Source and Form
app.post("/api/generate/step1", async (req, res) => {
  try {
    const { lesson, cv7991, sampleExam, matrix, prompt } = req.body;
    const ai = getGeminiClient();

    const textPrompt = `
Dưới đây là các tài liệu nguồn giáo viên cung cấp:

=== Tài liệu dạy học / SGK hoặc Giáo án ===
${lesson || "(Chưa cung cấp)"}

=== Quy định / Công văn 7991 / 7791 ===
${cv7991 || "(Chưa cung cấp)"}

=== Đề kiểm tra mẫu ===
${sampleExam || "(Chưa cung cấp)"}

=== Ma trận đề mẫu (nếu có) ===
${matrix || "(Chưa cung cấp)"}

---
YÊU CẦU: Hãy phân tích các tài liệu nguồn trên và thực hiện lệnh phân tích sau:
${prompt}
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ result: response.text });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Step 2: Create Matrix and Specifications
app.post("/api/generate/step2", async (req, res) => {
  try {
    const { lesson, cv7991, sampleExam, matrix, step1Result, prompt } = req.body;
    const ai = getGeminiClient();

    const textPrompt = `
Dưới đây là các tài liệu nguồn:
- Tài liệu dạy học / SGK: ${lesson ? "Đã đính kèm" : "Chưa cung cấp"}
- Công văn 7991: ${cv7991 ? "Đã đính kèm" : "Chưa cung cấp"}
- Đề mẫu: ${sampleExam ? "Đã đính kèm" : "Chưa cung cấp"}

Và kết quả của BƯỚC 1 (Phân tích nguồn và nhận dạng Form câu hỏi):
${step1Result || "(Không có kết quả Bước 1)"}

---
YÊU CẦU: Hãy tạo ma trận đề kiểm tra định kì và bản đặc tả đề kiểm tra định kì theo yêu cầu sau:
${prompt}

Hãy trình bày rõ ràng dưới dạng các bảng markdown có tiêu đề rõ ràng, cấu trúc cột chuẩn theo Công văn 7991 như đề xuất.
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ result: response.text });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Step 3: Create Original Exam (Đề kiểm tra gốc)
app.post("/api/generate/step3", async (req, res) => {
  try {
    const { lesson, cv7991, sampleExam, matrix, step1Result, step2Result, prompt } = req.body;
    const ai = getGeminiClient();

    const textPrompt = `
Dưới đây là các tài liệu nguồn:
- Tài liệu SGK / Tổ hợp: ${lesson ? "Đã đính kèm" : "Chưa cung cấp"}
- Đề kiểm tra mẫu: ${sampleExam ? "Đã đính kèm" : "Chưa cung cấp"}

Tham khảo:
- Kết quả Phân tích Bước 1:
${step1Result || "(Không có)"}

- Ma trận & Bản đặc tả Bước 2:
${step2Result || "(Không có)"}

---
YÊU CẦU ĐỀ BÀI: Hãy tạo Đề kiểm tra định kì hoàn chỉnh gồm đề cho học sinh, đáp án và hướng dẫn chấm riêng biệt (như mô tả trong câu lệnh):
${prompt}

Chú ý: Công thức toán và phương trình hóa học phải trình bày chuẩn LaTeX:
- Toán inline: \\( ... \\), block: \\[ ... \\]
- Hóa học: \\ce{...}
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({ result: response.text });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Step 5: Create Equivalent Exams (Mã đề tương đương)
app.post("/api/generate/step5", async (req, res) => {
  try {
    const { lesson, cv7991, sampleExam, step1Result, step2Result, step3Result, prompt } = req.body;
    const ai = getGeminiClient();

    const textPrompt = `
Dựa vào Đề gốc từ Bước 3 và các tài liệu nguồn, hãy thực hiện câu lệnh tạo mã đề biến thể (101, 102, 103, 104) tương đương:

=== ĐỀ GỐC (BƯỚC 3) ===
${step3Result || "(Không có đề gốc)"}

=== THAM KHẢO MA TRẬN & ĐẶC TẢ ===
${step2Result || "(Không có)"}

---
YÊU CẦU: Hãy tạo 4 mã đề tương đương và bảng đối chiếu các mã đề như mô tả dưới đây:
${prompt}

Chú ý: Công thức toán và phương trình hóa học phải dùng chuẩn LaTeX:
- Toán inline: \\( ... \\), block: \\[ ... \\]
- Hóa học: \\ce{...}
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({ result: response.text });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// Custom error handling middleware for handling payload too large gracefully and returning JSON
app.use((err: any, req: any, res: any, next: any) => {
  if (err) {
    console.error("Express Uncaught Payload/Server Error:", err);
    if (err.status === 413 || err.statusCode === 413 || err.type === "entity.too.large") {
      return res.status(413).json({
        error: "Dung lượng tài liệu quá lớn so với giới hạn xử lý. Hãy chia nhỏ tài liệu hoặc tối ưu hóa kích thước tệp trước khi tải lên!"
      });
    }
    return res.status(err.status || err.statusCode || 500).json({
      error: err.message || "Đã xảy ra lỗi hệ thống khi xử lý dữ liệu."
    });
  }
  next();
});

// Serve frontend with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support single page application fallback
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} with NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
