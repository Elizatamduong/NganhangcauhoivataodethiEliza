
/**
 * exportUtils.ts - Senior Export Upgrade
 */
export const exportToWord = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Tạo một bản sao sạch để xử lý
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Xử lý các khối KaTeX: Word không hiểu tốt thẻ ẩn .katex-mathml
  const katexMathML = clone.querySelectorAll('.katex-mathml');
  katexMathML.forEach(el => el.remove());

  const content = clone.innerHTML;
  
  // Header HTML này cực kỳ quan trọng để MS Word hiểu được font và cấu trúc bảng
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Export QBankVN</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page { size: 21cm 29.7cm; margin: 2cm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: black; }
        table { border-collapse: collapse; width: 100%; border: 1pt solid black; margin: 10pt 0; }
        th, td { border: 1pt solid black; padding: 5pt; text-align: left; vertical-align: top; }
        .font-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .question-block { margin-bottom: 20pt; page-break-inside: avoid; }
        .figure-container { text-align: center; margin: 15pt 0; }
        .figure-container svg { width: 400pt; height: auto; }
        .math-block-wrapper { text-align: center; margin: 10pt 0; }
        .katex { font-family: 'Times New Roman', serif; }
      </style>
    </head>
    <body>
  `;
  const footer = "</body></html>";
  const sourceHTML = header + content + footer;

  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Chuyển đổi sang Markdown cho Pandoc
 */
export const getPandocMarkdown = (questions: any[]) => {
  return questions.map((q, idx) => {
    let md = `**Câu ${idx + 1}:** ${q.noiDung}\n\n`;
    
    // Convert markers chuẩn Pandoc: \( \) -> $ và \[ \] -> $$
    md = md.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
    md = md.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    
    // Xóa marker figure trong MD vì Pandoc xử lý SVG theo cách khác
    md = md.replace(/\[FIGURE type="svg"\][\s\S]*?\[\/FIGURE\]/g, '\n*(Hình minh họa)*\n');
    
    if (q.luaChon && Object.keys(q.luaChon).length > 0) {
      Object.entries(q.luaChon).forEach(([k, v]) => {
        md += `- **${k}.** ${v}\n`;
      });
    }
    return md;
  }).join('\n\n---\n\n');
};
