import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Sparkles, 
  HelpCircle,
  FolderLock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye
} from 'lucide-react';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  PageBreak 
} from 'docx';
import ContentRenderer from '../components/ContentRenderer';

// Math text-run parsing helper for subscript and superscript (e.g., ^2, _n)
const createTextRunsFromMath = (
  text: string, 
  isItalic: boolean, 
  defaultSize: number, 
  isBold: boolean = false
): TextRun[] => {
  const runs: TextRun[] = [];
  let currentText = "";
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '^') {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, font: "Times New Roman", size: defaultSize, italics: isItalic, bold: isBold }));
        currentText = "";
      }
      i++;
      if (i < text.length) {
        let superContent = "";
        if (text[i] === '{') {
          i++;
          while (i < text.length && text[i] !== '}') {
            superContent += text[i];
            i++;
          }
        } else {
          superContent = text[i];
        }
        runs.push(new TextRun({ text: superContent, font: "Times New Roman", size: defaultSize, italics: isItalic, bold: isBold, superScript: true }));
      }
    } else if (text[i] === '_') {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, font: "Times New Roman", size: defaultSize, italics: isItalic, bold: isBold }));
        currentText = "";
      }
      i++;
      if (i < text.length) {
        let subContent = "";
        if (text[i] === '{') {
          i++;
          while (i < text.length && text[i] !== '}') {
            subContent += text[i];
            i++;
          }
        } else {
          subContent = text[i];
        }
        runs.push(new TextRun({ text: subContent, font: "Times New Roman", size: defaultSize, italics: isItalic, bold: isBold, subScript: true }));
      }
    } else {
      currentText += text[i];
    }
  }
  
  if (currentText) {
    runs.push(new TextRun({ text: currentText, font: "Times New Roman", size: defaultSize, italics: isItalic, bold: isBold }));
  }
  
  return runs;
};

// Parser of combined Markdown formatting & inline LaTeX wrappers
const parseFormattedText = (
  text: string, 
  defaultSize: number = 28, 
  forceBold: boolean = false
): TextRun[] => {
  let processed = text;
  
  // Clean math structure indicators
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  
  interface Token {
    text: string;
    bold?: boolean;
    italic?: boolean;
    isMath?: boolean;
  }
  
  let tokens: Token[] = [{ text: processed }];
  
  // 1. Process LaTeX inline: \(...\) -> italics math
  tokens = tokens.flatMap(tok => {
    if (tok.bold || tok.italic) return [tok];
    const parts = tok.text.split(/\\\(([\s\S]*?)\\\)/g);
    return parts.map((str, idx) => {
      if (idx % 2 === 1) {
        return { text: str, italic: true, isMath: true };
      }
      return { text: str };
    });
  });

  // 2. Process Bold: **...**
  tokens = tokens.flatMap(tok => {
    if (tok.bold || tok.italic) return [tok];
    const parts = tok.text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((str, idx) => {
      if (idx % 2 === 1) {
        return { text: str, bold: true };
      }
      return { text: str };
    });
  });

  // 3. Process Bold alternative: __...__
  tokens = tokens.flatMap(tok => {
    if (tok.bold || tok.italic) return [tok];
    const parts = tok.text.split(/__([\s\S]*?)__/g);
    return parts.map((str, idx) => {
      if (idx % 2 === 1) {
        return { text: str, bold: true };
      }
      return { text: str };
    });
  });

  // 4. Process Italic: *...* 
  tokens = tokens.flatMap(tok => {
    if (tok.bold || tok.italic) return [tok];
    const parts = tok.text.split(/\*([^\*\s][^\*]*?[^\*\s]|[^\*\s])\*/g);
    return parts.map((str, idx) => {
      if (idx % 2 === 1) {
        return { text: str, italic: true };
      }
      return { text: str };
    });
  });

  // 5. Process Italic alternative: _..._
  tokens = tokens.flatMap(tok => {
    if (tok.bold || tok.italic) return [tok];
    const parts = tok.text.split(/_([^_ ]+[^_]*?[^_ ]|[^_ ]+)_/g);
    return parts.map((str, idx) => {
      if (idx % 2 === 1) {
        return { text: str, italic: true };
      }
      return { text: str };
    });
  });

  const runs: TextRun[] = [];
  
  tokens.forEach(tok => {
    if (tok.text === "") return;
    
    // Clean remaining asterisks in the token text since they are formatting leftovers or typos
    let cleanTokText = tok.text.replace(/\*/g, '');
    
    const isItalic = !!tok.italic;
    const isBold = forceBold || !!tok.bold;
    
    if (tok.isMath || isItalic || cleanTokText.includes('^') || cleanTokText.includes('_')) {
      // Clean single underscores used for markdown italics unless it is part of a blank line (3 or more underscores)
      if (!cleanTokText.includes('___')) {
        // Only strip underscores that look like formatting marks, keeping alphanumeric ones and leaving indices alone
        cleanTokText = cleanTokText.replace(/(^|[^a-zA-Z0-9])_(?![0-9])|(?<![0-9])_([^a-zA-Z0-9]|$)/g, '$1$2');
      }
      runs.push(...createTextRunsFromMath(cleanTokText, isItalic, defaultSize, isBold));
    } else {
      // Clean single underscores used for markdown italics unless it is part of a blank line (3 or more underscores)
      if (!cleanTokText.includes('___')) {
        cleanTokText = cleanTokText.replace(/_/g, '');
      }
      if (cleanTokText === "") return;
      runs.push(new TextRun({
        text: cleanTokText,
        font: "Times New Roman",
        size: defaultSize,
        bold: isBold,
        italics: isItalic,
      }));
    }
  });
  
  return runs;
};

interface Step4ExportProps {
  resultUi: string; // From Step 3 original exam
  onNext: () => void;
  onPrev: () => void;
}

const Step4Export: React.FC<Step4ExportProps> = ({
  resultUi,
  onNext,
  onPrev
}) => {
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'html_source' | 'cropper'>('preview');

  // Advanced AI Image Cropper & Digitizer States (Yêu cầu đặc biệt Bộ GD & Eliza Tâm Dương SĐT 0962571826)
  const [uploadedImgSrc, setUploadedImgSrc] = useState<string | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const [detectedBoxes, setDetectedBoxes] = useState<{ coord: number[]; label: string }[]>([]);
  const [cropEditContent, setCropEditContent] = useState<string>("");
  const [copiedCrop, setCopiedCrop] = useState(false);

  const handleDownloadDocx = async () => {
    try {
      const docxChildren: any[] = [];

      // 1. Create Head Office Table (left block: SỞ GIÁO DỤC... / TRƯỜNG THPT... ; right block: ĐỀ KIỂM TRA ĐỊNH KÌ / Năm học...)
      const headerTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 60, line: 240 },
                    children: [
                      new TextRun({
                        text: "SỞ GIÁO DỤC VÀ ĐÀO TẠO",
                        font: "Times New Roman",
                        size: 24, // 12pt
                        bold: true,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 120, line: 240 },
                    children: [
                      new TextRun({
                        text: "TRƯỜNG THPT CHUÂN ĐỀ",
                        font: "Times New Roman",
                        size: 24, // 12pt
                        bold: true,
                        underline: {},
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 60, line: 240 },
                    children: [
                      new TextRun({
                        text: "ĐỀ KIỂM TRA ĐỊNH KÌ",
                        font: "Times New Roman",
                        size: 24, // 12pt
                        bold: true,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 120, line: 240 },
                    children: [
                      new TextRun({
                        text: "Năm học 2025 - 2026",
                        font: "Times New Roman",
                        size: 24, // 12pt
                        italics: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      docxChildren.push(headerTable);

      // Add small spacing after school header
      docxChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 240 },
          children: [new TextRun({ text: "" })],
        })
      );

      // 2. Exam Title Block
      docxChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60, line: 360 },
          children: [
            new TextRun({
              text: "ĐỀ THI GỐC KHẢO SÁT CHẤT LƯỢNG",
              font: "Times New Roman",
              size: 32, // 16pt
              bold: true,
            }),
          ],
        })
      );
      docxChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60, line: 360 },
          children: [
            new TextRun({
              text: "MÔN: TOÁN HỌC LỚP 10",
              font: "Times New Roman",
              size: 28, // 14pt
              bold: true,
            }),
          ],
        })
      );
      docxChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 360, line: 360 },
          children: [
            new TextRun({
              text: "Thời gian làm bài: 45 phút (Không kể thời gian giao đề)",
              font: "Times New Roman",
              size: 24, // 12pt
              italics: true,
            }),
          ],
        })
      );

      // Add a thin line separator
      docxChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 240 },
          children: [
            new TextRun({
              text: "--------------------------------------------------",
              font: "Times New Roman",
              size: 20,
            }),
          ],
        })
      );

      // 3. Process resultUi line by line
      const lines = resultUi.split("\n");
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line === "") {
          docxChildren.push(
            new Paragraph({
              spacing: { before: 80, after: 80, line: 360 },
              children: [new TextRun({ text: "", font: "Times New Roman" })],
            })
          );
          continue;
        }

        // Horizontal line separator / Page break
        if (line === "---") {
          docxChildren.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
          continue;
        }

        // Headings: ## or ###
        if (line.startsWith("#")) {
          const headingText = line.replace(/#+/g, "").trim();
          const level = (line.match(/^#+/) || [""])[0].length;
          docxChildren.push(
            new Paragraph({
              alignment: level <= 2 ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 240, after: 120, line: 360 },
              children: parseFormattedText(headingText, level <= 2 ? 30 : 28, true), // size 15pt or 14pt, force bold!
            })
          );
          continue;
        }

        // Preprocess line: strip list / bullet / dash indicators at the start of the line to prevent automatic indentation or bullets
        let cleanText = line;
        while (
          cleanText.startsWith("- ") || 
          cleanText.startsWith("* ") || 
          cleanText.startsWith("+ ") || 
          cleanText.startsWith("• ") ||
          cleanText.startsWith("– ") ||
          cleanText.startsWith("— ")
        ) {
          cleanText = cleanText.substring(2).trim();
        }

        // Question Match (e.g. "**Câu 1:**" or "*Câu 1.*" or "Câu 1:")
        const cleanForMatching = cleanText.replace(/^(\*\*|\*|__|_)/, '').trim();
        const questionMatch = cleanForMatching.match(/^(Câu\s+\d+[:.]?)(.*)$/i) || cleanForMatching.match(/^(Câu\s+\d+\s*\()(.*)$/i);
        if (questionMatch) {
          const label = questionMatch[1];
          let remainder = questionMatch[2].trim();
          
          // Clean leading and trailing bold asterisks from the remainder
          if (remainder.startsWith("**")) remainder = remainder.substring(2).trim();
          else if (remainder.startsWith("*")) remainder = remainder.substring(1).trim();
          if (remainder.endsWith("**")) remainder = remainder.slice(0, -2).trim();
          else if (remainder.endsWith("*")) remainder = remainder.slice(0, -1).trim();

          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 180, after: 120, line: 360 },
              children: [
                new TextRun({
                  text: label + " ",
                  font: "Times New Roman",
                  size: 28, // 14pt
                  bold: true,
                }),
                ...parseFormattedText(remainder, 28)
              ],
            })
          );
          continue;
        }

        // Multiple choices in one line: e.g. "A. 5.    B. 6.    C. 7.    D. 8." or with asterisks
        const choicesMatches = [...cleanText.matchAll(/(?:\*\*|\*)?([A-D]\.)(?:\*\*|\*)?\s+([^\*A-D]*)/g)];
        if (choicesMatches && choicesMatches.length > 1) {
          const runs: TextRun[] = [];
          choicesMatches.forEach((match) => {
            const optionLabel = match[1];
            let optionValue = match[2].trim();
            
            if (optionValue.endsWith("**")) optionValue = optionValue.slice(0, -2).trim();
            else if (optionValue.endsWith("*")) optionValue = optionValue.slice(0, -1).trim();

            runs.push(
              new TextRun({
                text: optionLabel + " ",
                font: "Times New Roman",
                size: 28,
                bold: true,
              })
            );
            runs.push(...parseFormattedText(optionValue, 28));
            runs.push(
              new TextRun({
                text: "        ",
                font: "Times New Roman",
                size: 28,
              })
            );
          });
          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 80, after: 80, line: 360 },
              children: runs,
            })
          );
          continue;
        }

        // Single Choice: e.g. "A. 5" or "**A.** 5"
        const cleanChoiceText = cleanText.replace(/^(\*\*|\*|__|_)/, '').trim();
        const singleChoiceMatch = cleanChoiceText.match(/^([A-D]\.)(.*)$/);
        if (singleChoiceMatch) {
          const label = singleChoiceMatch[1];
          let value = singleChoiceMatch[2].trim();
          
          if (value.startsWith("**")) value = value.substring(2).trim();
          else if (value.startsWith("*")) value = value.substring(1).trim();
          if (value.endsWith("**")) value = value.slice(0, -2).trim();
          else if (value.endsWith("*")) value = value.slice(0, -1).trim();

          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 60, after: 60, line: 360 },
              children: [
                new TextRun({
                  text: label + " ",
                  font: "Times New Roman",
                  size: 28,
                  bold: true,
                }),
                ...parseFormattedText(value, 28)
              ],
            })
          );
          continue;
        }

        // Sub choice for True-False / Đúng Sai questions: e.g. "a) " or "b) "
        const subChoiceMatch = cleanText.match(/^([a-d]\))\s*(.*)$/);
        if (subChoiceMatch) {
          const label = subChoiceMatch[1];
          let value = subChoiceMatch[2].trim();
          
          if (value.startsWith("**")) value = value.substring(2).trim();
          else if (value.startsWith("*")) value = value.substring(1).trim();
          if (value.endsWith("**")) value = value.slice(0, -2).trim();
          else if (value.endsWith("*")) value = value.slice(0, -1).trim();

          docxChildren.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 60, after: 60, line: 360 },
              children: [
                new TextRun({
                  text: label + " ",
                  font: "Times New Roman",
                  size: 28,
                  bold: true,
                }),
                ...parseFormattedText(value, 28)
              ],
            })
          );
          continue;
        }

        // Regular Text Line: e.g. section descriptions, styled without automatic list margins or prepended bullets
        docxChildren.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 120, after: 120, line: 360 },
            children: parseFormattedText(cleanText, 28),
          })
        );
      }

      // Build document with standard 2cm (1134 dxa) margins on A4 paper
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1134,
                  bottom: 1134,
                  left: 1134,
                  right: 1134,
                },
              },
            },
            children: docxChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "De_Thi_Goc_Khao_Sat_Chuan_Bo.docx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Lỗi xuất tệp DOCX:", err);
      alert("Gặp lỗi khi tạo tệp Word (.docx): " + (err.message || err));
    }
  };

  // Chuyển kết quả sang cấu trúc HTML hoàn chỉnh sử dụng CSS bắt buộc của Bộ Giáo Dục / Eliza Tâm Dương SĐT 0962571826 dặn dò
  const buildExamHtml = () => {
    // Escape certain aspects or clean up some blocks to make clean HTML
    const cleanedContent = resultUi
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // We can also run a parser or just render the markdown content simply as a styled body.
    // To make it easy to copy to Word or print perfectly, we construct a fully valid HTML wrapper.
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ĐỀ KIỂM TRA ĐỊNH KÌ KHỚP FORM CHUẨN</title>
<style> 
  @page { size: A4 portrait; margin: 2cm 1.5cm 2cm 2.5cm; } 
  body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.45; color: #000; background: #fff; padding: 20px; max-width: 800px; margin: 0 auto; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
  h1, h2, h3 { text-align: center; margin: 12px 0; font-family: "Times New Roman", Times, serif; } 
  h1 { font-size: 16pt; text-transform: uppercase; font-weight: bold; }
  h2 { font-size: 14pt; margin-top: 24px; text-transform: uppercase; font-weight: bold; } 
  h3 { font-size: 13pt; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; table-layout: fixed; } 
  th, td { border: 1px solid #000; padding: 6px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; font-family: "Times New Roman", Times, serif; } 
  th { text-align: center; font-weight: bold; background: #f2f2f2; } 
  .center { text-align: center; } 
  .right { text-align: right; } 
  .bold { font-weight: bold; } 
  .question { margin-top: 12px; margin-bottom: 12px; font-weight: bold; } 
  .student-info-box { border: 1px solid #000000; padding: 12px; margin-bottom: 24px; font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.6; display: flex; justify-content: space-between; align-items: center; }
  .choices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: 20px; margin-bottom: 12px; }
  .choice-item { margin-bottom: 4px; }
  .page-break { page-break-before: always; } 
</style>
</head>
<body>

<div class="header" style="display: flex; justify-content: space-between; margin-bottom: 24px; font-family: 'Times New Roman', Times, serif; font-size: 12pt;">
  <div style="text-align: center; width: 45%;">
    <div style="font-weight: bold;">SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
    <div style="font-weight: bold; text-decoration: underline;">TRƯỜNG THPT CHUÂN ĐỀ</div>
  </div>
  <div style="text-align: center; width: 50%;">
    <div style="font-weight: bold;">ĐỀ KIỂM TRA ĐỊNH KÌ CHUẨN</div>
    <div style="font-style: italic;">Năm học 2025 - 2026</div>
  </div>
</div>

<div style="text-align: center; margin-bottom: 24px; font-family: 'Times New Roman', Times, serif;">
  <h1>ĐỀ THI GỐC KHẢO SÁT CHẤT LƯỢNG</h1>
  <h3>MÔN: TOÁN HỌC - KHẢO SÁT CHUẨN BỘ</h3>
  <div style="font-style: italic;">Thời gian làm bài: 45 phút (Không kể thời gian giao đề)</div>
</div>

<div class="student-info-box">
  <div style="space-y-3;">
    <div>Họ và tên học sinh: .....................................................................</div>
    <div>Số báo danh: ........................................... Lớp: ...................</div>
  </div>
  <div style="border: 2px solid #000; padding: 6px 12px; font-weight: bold; font-size: 14pt;">Mã đề: GỐC</div>
</div>

<div class="content">
${resultUi
  .split('\n')
  .map(line => {
    // Simple line transitions for gorgeous print render
    if (line.startsWith('###') || line.startsWith('##')) {
      return `<h2>${line.replace(/#+/g, '').trim()}</h2>`;
    }
    if (line.startsWith('-') || line.startsWith('*')) {
      return `<div style="margin-left: 20px; margin-bottom: 6px;">&bull; ${line.substring(2)}</div>`;
    }
    if (line.match(/^Câu\s+\d+[:.]/gi) || line.match(/^Câu\s+\d+\s*\(/gi)) {
      return `<div class="question">${line}</div>`;
    }
    if (line.match(/^[A-D]\./)) {
      return `<div class="choice-item"><strong>${line.substring(0, 2)}</strong>${line.substring(2)}</div>`;
    }
    if (line.trim() === '---') {
      return `<div class="page-break"></div>`;
    }
    return `<p style="margin-bottom: 8px;">${line}</p>`;
  })
  .join('\n')}
</div>

</body>
</html>`;
    return fullHtml;
  };

  const handleDownloadHtml = () => {
    const htmlContent = buildExamHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `De_Thi_Goc_HTML_In_An.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyGoogleDoc = () => {
    // Copies raw text formatted beautifully for Google Doc / Copying straight into Microsoft Word
    navigator.clipboard.writeText(resultUi);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleCopyHtmlSource = () => {
    navigator.clipboard.writeText(buildExamHtml());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handlePrint = () => {
    // Open a new styled window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(buildExamHtml());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleCropUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingCrop(true);
    setCropError(null);
    setUploadedImgSrc(null);
    setDetectedBoxes([]);
    setCropEditContent("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result as string;
      const rawBase64 = base64Content.split(',')[1];
      const mime = file.type;

      try {
        const res = await fetch("/api/detect-figures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: rawBase64, mimeType: mime }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Gặp lỗi khi gửi tệp đến hệ thống phân tích AI.");
        }

        const data = await res.json();
        const { figures, transcribed_text } = data;

        const img = new Image();
        img.src = base64Content;
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          // Tính toán khoảng 1mm pixel dựa trên chuẩn A4 của Bộ GD (210mm x 297mm)
          const padWidthPx = Math.max(4, Math.round(width / 210)); 
          const padHeightPx = Math.max(4, Math.round(height / 297));

          let updatedText = transcribed_text;
          const boxesToSave: any[] = [];

          figures.forEach((fig: any, index: number) => {
            const [yminNorm, xminNorm, ymaxNorm, xmaxNorm] = fig.box_2d;

            // Bất đối xứng tọa độ normalized [0, 1000] sang pixels
            let ymin = Math.round((yminNorm / 1000) * height);
            let xmin = Math.round((xminNorm / 1000) * width);
            let ymax = Math.round((ymaxNorm / 1000) * height);
            let xmax = Math.round((xmaxNorm / 1000) * width);

            // Tự động mở rộng vùng cắt thêm đúng 1mm padding mỗi bên bảo vệ mất nét
            ymin = Math.max(0, ymin - padHeightPx);
            xmin = Math.max(0, xmin - padWidthPx);
            ymax = Math.min(height, ymax + padHeightPx);
            xmax = Math.min(width, xmax + padWidthPx);

            const cropW = xmax - xmin;
            const cropH = ymax - ymin;

            if (cropW > 0 && cropH > 0) {
              const canvas = document.createElement("canvas");
              canvas.width = cropW;
              canvas.height = cropH;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, xmin, ymin, cropW, cropH, 0, 0, cropW, cropH);
                const croppedBase64 = canvas.toDataURL("image/png");

                // Replacement placeholder inside HTML block with gorgeous styling
                const imgTag = `\n[FIGURE type="cropped_img"]\n${croppedBase64}\n[/FIGURE]\n`;
                updatedText = updatedText.replace(new RegExp(`\\[IMAGE_PLACEHOLDER_${index}\\]`, 'g'), imgTag);
              }
            }
            
            boxesToSave.push({
              coord: [ymin, xmin, ymax, xmax],
              coordNorm: fig.box_2d,
              label: fig.label || `Hình vẽ ${index + 1}`
            });
          });

          setUploadedImgSrc(base64Content);
          setDetectedBoxes(boxesToSave);
          setCropEditContent(updatedText);
          setIsProcessingCrop(false);
        };
      } catch (err: any) {
        console.error("Lỗi số hóa thông minh:", err);
        setCropError(err.message || "Không thể phân tích hoặc số hóa tệp tải lên.");
        setIsProcessingCrop(false);
      }
    };
    reader.onerror = () => {
      setCropError("Không thể đọc tệp tin.");
      setIsProcessingCrop(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <Printer size={24} />
          </div>
          <div>
            <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider">QUY TRÌNH RA ĐỀ - BƯỚC 4</div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Xuất bản Đề kiểm tra gốc
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Hỗ trợ xuất mã HTML tiêu chuẩn in ấn A4, sao chép sang Word/Google Doc, hoặc in ấn trực tiếp.
            </p>
          </div>
        </div>

        {/* Quick Save Action Row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadDocx}
            className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <FileText size={15} /> Tải file Word (.docx) chuẩn
          </button>
          <button
            onClick={handleDownloadHtml}
            className="px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md shadow-emerald-50"
          >
            <Download size={15} /> Tải file HTML in ấn A4
          </button>
          <button
            onClick={handleCopyGoogleDoc}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 border ${
              copiedDoc
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copiedDoc ? <Check size={14} /> : <Copy size={14} />}
            {copiedDoc ? 'Đã sao chép Docx' : 'Sao chép dạng Google Doc (4.1)'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md shadow-blue-50"
          >
            <Printer size={15} /> Thiết lập trang in
          </button>
        </div>
      </div>

      {/* Tabs of Exports */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye size={14} /> Xem thử nội dung in
            </button>
            <button
              onClick={() => setActiveTab('html_source')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'html_source'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileCode size={14} /> Mã nguồn HTML in ấn (4.0)
            </button>
            <button
              onClick={() => setActiveTab('cropper')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cropper'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" /> Trích xuất & Cắt hình tự động (4.2)
            </button>
          </div>

          {activeTab === 'html_source' && (
            <button
              onClick={handleCopyHtmlSource}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                copiedHtml 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copiedHtml ? <Check size={14} /> : <Copy size={13} />}
              {copiedHtml ? 'Đã sao chép' : 'Sao chép mã nguồn'}
            </button>
          )}

          {activeTab === 'cropper' && cropEditContent && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(cropEditContent);
                setCopiedCrop(true);
                setTimeout(() => setCopiedCrop(false), 2000);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                copiedCrop 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copiedCrop ? <Check size={14} /> : <Copy size={13} />}
              {copiedCrop ? 'Đã sao chép kết quả' : 'Sao chép văn bản số hóa'}
            </button>
          )}
        </div>

        {/* Tab display pane */}
        <div className="p-8">
          {activeTab === 'preview' ? (
            <div className="border border-slate-100 rounded-2xl p-8 bg-slate-50 shadow-inner max-h-[600px] overflow-y-auto">
              <div className="bg-white p-12 shadow-md rounded-lg max-w-[800px] mx-auto min-h-[500px] prose">
                {resultUi ? (
                  <ContentRenderer content={resultUi} />
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    Vui lòng quay lại Bước 3 và hoàn thành biên soạn đề thi gốc trước.
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'html_source' ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                ℹ️ Đây là mã nguồn HTML hoàn chỉnh được đóng gói sẵn với CSS lề A4, phông chữ 14px chân thực và căn lề đúng 2cm theo quy chuẩn báo cáo Công văn 7991 để giáo viên nạp trực tiếp vào ChatGPT hoặc in ấn ngoại tuyến.
              </p>
              <textarea
                readOnly
                value={buildExamHtml()}
                className="w-full h-[400px] p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl focus:outline-none resize-none custom-scrollbar shadow-inner leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Introduction bar */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl flex-shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-indigo-950 text-sm">Bộ số hóa đề thi thông minh (Chống trích xuất chữ trong ảnh & Cắt padding 1mm)</h4>
                  <ul className="text-indigo-800 text-xs space-y-1.5 list-disc pl-4 leading-relaxed font-medium">
                    <li><strong className="font-bold">Tuyệt đối không trích xuất văn bản nằm trong hình vẽ</strong> hoặc biểu đồ phức tạp, bảo lưu và định vị dưới dạng hình ảnh chất lượng cao.</li>
                    <li><strong className="font-bold">Công thức toán học</strong> tự động được định dạng hoàn hảo sang LaTeX và được bọc chuẩn chỉ trong dấu <code className="px-1 py-0.5 bg-indigo-100 border border-indigo-200 rounded text-indigo-900">$...$</code> (ví dụ: $E=mc^2$).</li>
                    <li><strong className="font-bold">Căn lề vật lý 1mm chuẩn xác:</strong> Sử dụng tỷ lệ thực tế của khổ giấy tiêu chuẩn A4 (210mm x 297mm) để tự động mở rộng viền cắt thêm 1mm mỗi chiều, tránh triệt để tình trạng lệch viền hoặc đứt nét.</li>
                  </ul>
                </div>
              </div>

              {/* Upload or Results Render */}
              {!uploadedImgSrc && !isProcessingCrop ? (
                <div className="flex justify-center py-6">
                  <label className="w-full max-w-xl h-64 border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all gap-4 p-8 select-none bg-slate-50/30 shadow-inner group">
                    <div className="w-14 h-14 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-slate-100 group-hover:scale-105 transition-transform duration-300">
                      <Sparkles size={24} className="text-indigo-600 animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-sm font-bold text-slate-800 block">Tải ảnh trang đề thi thô lên hệ thống</span>
                      <span className="text-xs text-slate-400 block leading-relaxed max-w-sm mx-auto">Hỗ trợ định dạng PNG, JPG, JPEG, WebP. Hệ thống sẽ tự động quét, xác định bounding box và trả về LaTeX chuẩn xác.</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCropUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              ) : isProcessingCrop ? (
                <div className="py-20 text-center space-y-6">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="space-y-1 select-none">
                    <p className="text-sm font-bold text-slate-800 animate-pulse">Hệ thống AI Gemini 3.5 Flash đang phân tích sơ đồ hình học...</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">Đang quét sơ đồ, phân định Bounding Box, tính toán sai số khoảng cách lề và tách phương trình toán sangLaTeX.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status header */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2 select-none">
                       <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-xs font-bold text-slate-700">Tìm thấy {detectedBoxes.length} vùng chứa ảnh vẽ minh họa thành công</span>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedImgSrc(null);
                        setDetectedBoxes([]);
                        setCropEditContent("");
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-200 bg-white hover:bg-rose-50 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Xóa và tải tệp tin khác
                    </button>
                  </div>

                  {/* Interactive Split Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Visual Overlay representation */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Trang đề nguồn và vùng crop AI</span>
                         <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-bold">Lưới 1000 DPI</span>
                      </div>
                      <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-900/95 flex items-center justify-center p-3 min-h-[400px] shadow-sm">
                        <img 
                          src={uploadedImgSrc || undefined} 
                          alt="Source Preview" 
                          className="max-h-[500px] w-auto object-contain rounded-xl opacity-85 select-none"
                        />
                        {/* ABSOLUTE BOXES OVERLAID */}
                        {detectedBoxes.map((box, idx) => {
                          const [ymin, xmin, ymax, xmax] = box.coordNorm || [0, 0, 1000, 1000];
                          return (
                            <div
                              key={idx}
                              className="absolute bg-emerald-500/15 border-2 border-emerald-400 rounded-xl flex items-start justify-start p-1.5 cursor-crosshair group transition-all duration-200 hover:bg-emerald-500/30 hover:border-emerald-300"
                              style={{
                                top: `${ymin / 10}%`,
                                left: `${xmin / 10}%`,
                                width: `${(xmax - xmin) / 10}%`,
                                height: `${(ymax - ymin) / 10}%`,
                              }}
                              title={box.label}
                            >
                              <div className="px-1.5 py-0.5 rounded bg-emerald-600 text-[10px] font-mono text-white leading-none font-extrabold tracking-tight border border-emerald-400/50 shadow-md">
                                {idx + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Transcribed live result */}
                    <div className="space-y-3">
                      <span className="font-bold text-xs text-slate-500 uppercase tracking-wider block">Bản số hóa trực tuyến bọc LaTeX & Nhúng ảnh crop</span>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white">
                        <div className="bg-slate-50/50 border-b border-slate-100 p-3 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest pl-2">Xem thử nội dung biên soạn</span>
                        </div>
                        <div className="p-8 max-h-[460px] overflow-y-auto select-text prose prose-slate">
                          {cropEditContent ? (
                            <ContentRenderer content={cropEditContent} />
                          ) : (
                            <p className="text-slate-400 text-xs text-center py-10">Bản preview đang trống.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cropError && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center text-xs font-bold text-rose-700 leading-normal max-w-md mx-auto">
                  ⚠️ Có lỗi xảy ra: {cropError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Guide Note Box */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 flex gap-4">
        <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold flex-shrink-0 animate-pulse">
          💡
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm mb-1">Mẹo in ấn chuẩn từ Eliza Tâm Dương SĐT 0962571826</h4>
          <p className="text-amber-800 text-xs leading-relaxed">
            Khi click <strong className="font-bold">"Thiết lập trang in"</strong>, trình in ấn của trình duyệt sẽ kích hoạt. Hãy chọn <strong className="font-bold">"Save as PDF"</strong> hoặc chọn máy in của bạn. Ở mục <strong className="font-bold">More Settings / Cài đặt khác</strong>, hãy bỏ tích chọn <strong className="font-bold">"Headers and footers / Tiêu đề đầu trang và chân trang"</strong> để đảm bảo lề giấy bóng sạch, cực kì giống văn bản in giấy thi truyền thống!
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between border-t border-slate-100 pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all text-sm"
        >
          Trở lại Bước 3 (Đề kiểm tra gốc)
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100 transition-all text-sm flex items-center gap-1.5"
        >
          Tiến hành Bước 5: Tạo mã đề gộp <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default Step4Export;
