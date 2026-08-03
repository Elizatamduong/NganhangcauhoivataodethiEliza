import { MucDo } from "../types";

export const aiService = {
  /**
   * Sinh câu hỏi mới từ Prompt bằng backend API (sử dụng cụm xử lý retry/fallback)
   */
  async generateQuestions(
    topic: string,
    subject: string,
    grade: string,
    count: number = 1,
    level?: MucDo,
    type: string = "TracNghiem"
  ) {
    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, subject, grade, count, level, type }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Gặp lỗi khi tạo câu hỏi từ AI.");
    }
    return await res.json();
  },

  /**
   * Trích xuất câu hỏi từ tài liệu bằng backend API
   */
  async extractQuestionsFromDoc(base64Data: string, mimeType: string) {
    const res = await fetch("/api/extract-questions-from-doc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Gặp lỗi khi trích xuất câu hỏi từ tài liệu.");
    }
    return await res.json();
  },

  /**
   * Trích xuất ma trận từ tài liệu/hình ảnh bằng backend API
   */
  async extractMatrixFromImage(base64Data: string, mimeType: string) {
    const res = await fetch("/api/extract-matrix-from-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Gặp lỗi khi phân tích ma trận từ ảnh.");
    }
    return await res.json();
  },

  /**
   * Gợi ý ma trận thông minh bằng backend API
   */
  async suggestSmartMatrix(topics: string[], totalQuestions: number, subject: string, inventoryStr: string) {
    const res = await fetch("/api/suggest-smart-matrix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topics, totalQuestions, subject, inventoryStr }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Gặp lỗi khi gợi ý ma trận thông minh.");
    }
    return await res.json();
  }
};
