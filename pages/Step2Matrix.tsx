import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Play, 
  Loader2, 
  Layers, 
  CheckCircle, 
  Eye, 
  Edit3, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown,
  GripVertical,
  Trash2,
  Plus,
  Percent,
  Info,
  AlertCircle
} from 'lucide-react';
import ContentRenderer from '../components/ContentRenderer';

interface Step2MatrixProps {
  lesson: string;
  cv7991: string;
  sampleExam: string;
  matrix: string;
  step1Result: string;
  prompt: string;
  setPrompt: (v: string) => void;
  result: string;
  setResult: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface MatrixEditorRow {
  id: string;
  topic: string;
  nbCount: number;
  nbDiem: number;
  thCount: number;
  thDiem: number;
  vdCount: number;
  vdDiem: number;
  vdcCount: number;
  vdcDiem: number;
}

const parseMatrixFromMarkdown = (md: string): MatrixEditorRow[] => {
  if (!md) return [];
  const lines = md.split('\n');
  const parsedRows: MatrixEditorRow[] = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    
    const lower = trimmed.toLowerCase();
    if (lower.includes('nội dung') || lower.includes('chủ đề') || lower.includes('tổng cộng') || lower.includes('tỷ lệ') || lower.includes('tỉ lệ') || trimmed.includes('| :---')) {
      continue;
    }
    
    // Extract cells
    const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (cells.length < 2) continue;
    
    const topic = cells[0];
    
    const extractCountAndPoint = (cellText: string, defaultPointPerQ = 0.25) => {
      // Find numbers in string
      const numbers = cellText.match(/\d+(\.\d+)?/g);
      if (!numbers || numbers.length === 0) return { count: 0, diem: 0 };
      
      const count = parseInt(numbers[0]) || 0;
      let diem = 0;
      if (numbers.length > 1) {
        diem = parseFloat(numbers[1]);
      } else {
        diem = Number((count * defaultPointPerQ).toFixed(2));
      }
      return { count, diem };
    };

    let nbCount = 0, nbDiem = 0;
    let thCount = 0, thDiem = 0;
    let vdCount = 0, vdDiem = 0;
    let vdcCount = 0, vdcDiem = 0;
    
    if (cells.length >= 5) {
      const nb = extractCountAndPoint(cells[1]);
      nbCount = nb.count; nbDiem = nb.diem;
      
      const th = extractCountAndPoint(cells[2]);
      thCount = th.count; thDiem = th.diem;
      
      const vd = extractCountAndPoint(cells[3]);
      vdCount = vd.count; vdDiem = vd.diem;
      
      const vdc = extractCountAndPoint(cells[4]);
      vdcCount = vdc.count; vdcDiem = vdc.diem;
    } else if (cells.length >= 4) {
      const nb = extractCountAndPoint(cells[1]);
      nbCount = nb.count; nbDiem = nb.diem;
      
      const th = extractCountAndPoint(cells[2]);
      thCount = th.count; thDiem = th.diem;
      
      const vd = extractCountAndPoint(cells[3]);
      vdCount = vd.count; vdDiem = vd.diem;
    }
    
    if (topic && (nbCount > 0 || thCount > 0 || vdCount > 0 || vdcCount > 0 || topic.length > 2)) {
      parsedRows.push({
        id: crypto.randomUUID(),
        topic,
        nbCount,
        nbDiem,
        thCount,
        thDiem,
        vdCount,
        vdDiem,
        vdcCount,
        vdcDiem
      });
    }
  }
  
  return parsedRows;
};

const getFallbackRows = (lessonStr: string): MatrixEditorRow[] => {
  const fallbackRows: MatrixEditorRow[] = [];
  const lines = lessonStr.split('\n');
  const topicsFound: string[] = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    const match = trimmed.match(/^\d+\.\s+([^:]+)/);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 5 && !topicsFound.includes(name)) {
        topicsFound.push(name);
      }
    }
  });

  if (topicsFound.length === 0) {
    topicsFound.push("1. Nội dung kiến thức tổng hợp");
  }

  topicsFound.forEach((t, index) => {
    fallbackRows.push({
      id: crypto.randomUUID(),
      topic: t,
      nbCount: index === 0 ? 4 : 2,
      nbDiem: index === 0 ? 1.0 : 0.5,
      thCount: index === 0 ? 2 : 2,
      thDiem: index === 0 ? 0.5 : 0.5,
      vdCount: 1,
      vdDiem: 0.25,
      vdcCount: 0,
      vdcDiem: 0
    });
  });
  
  return fallbackRows;
};

const serializeMatrixToMarkdown = (rows: MatrixEditorRow[]): string => {
  let md = "### BẢNG MA TRẬN PHÂN PHỐI ĐỀ KIỂM TRA (CÔNG VĂN 7991)\n\n";
  md += "| Chủ đề / Đơn vị kiến thức | Nhận biết (NB) | Thông hiểu (TH) | Vận dụng (VD) | Vận dụng cao (VDC) | Tổng số câu | Tổng điểm |\n";
  md += "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n";
  
  let totalNbC = 0, totalNbD = 0;
  let totalThC = 0, totalThD = 0;
  let totalVdC = 0, totalVdD = 0;
  let totalVdcC = 0, totalVdcD = 0;
  
  rows.forEach(r => {
    const rowCount = r.nbCount + r.thCount + r.vdCount + r.vdcCount;
    const rowDiem = r.nbDiem + r.thDiem + r.vdDiem + r.vdcDiem;
    
    totalNbC += r.nbCount; totalNbD += r.nbDiem;
    totalThC += r.thCount; totalThD += r.thDiem;
    totalVdC += r.vdCount; totalVdD += r.vdDiem;
    totalVdcC += r.vdcCount; totalVdcD += r.vdcDiem;
    
    md += `| ${r.topic} | ${r.nbCount} câu (${r.nbDiem}đ) | ${r.thCount} câu (${r.thDiem}đ) | ${r.vdCount} câu (${r.vdDiem}đ) | ${r.vdcCount} câu (${r.vdcDiem}đ) | ${rowCount} câu | ${rowDiem.toFixed(2)}đ |\n`;
  });
  
  const grandCount = totalNbC + totalThC + totalVdC + totalVdcC;
  const grandDiem = totalNbD + totalThD + totalVdD + totalVdcD;
  
  md += `| **Tổng cộng** | **${totalNbC} câu** (${totalNbD.toFixed(2)}đ) | **${totalThC} câu** (${totalThD.toFixed(2)}đ) | **${totalVdC} câu** (${totalVdD.toFixed(2)}đ) | **${totalVdcC} câu** (${totalVdcD.toFixed(2)}đ) | **${grandCount} câu** | **${grandDiem.toFixed(2)}đ** |\n`;
  
  const nbPercent = grandDiem > 0 ? (totalNbD / grandDiem) * 100 : 0;
  const thPercent = grandDiem > 0 ? (totalThD / grandDiem) * 100 : 0;
  const vdPercent = grandDiem > 0 ? (totalVdD / grandDiem) * 100 : 0;
  const vdcPercent = grandDiem > 0 ? (totalVdcD / grandDiem) * 100 : 0;
  
  md += `| **Tỉ lệ % điểm** | **${nbPercent.toFixed(0)}%** | **${thPercent.toFixed(0)}%** | **${vdPercent.toFixed(0)}%** | **${vdcPercent.toFixed(0)}%** | | **100%** |\n\n`;
  md += "*(Bản số hóa tự động hiển thị theo Công văn báo cáo 7991)*\n";
  
  return md;
};

const Step2Matrix: React.FC<Step2MatrixProps> = ({
  lesson,
  cv7991,
  sampleExam,
  matrix,
  step1Result,
  prompt,
  setPrompt,
  result,
  setResult,
  onNext,
  onPrev
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Set default viewMode to interactive!
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'interactive'>('interactive');
  const [showPromptConfig, setShowPromptConfig] = useState(false); // Collapsed by default!
  
  const [matrixRows, setMatrixRows] = useState<MatrixEditorRow[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Parse result initially on mount or when result shifts
  useEffect(() => {
    if (result && matrixRows.length === 0) {
      const parsed = parseMatrixFromMarkdown(result);
      if (parsed.length > 0) {
        setMatrixRows(parsed);
      }
    }
  }, [result]);

  // Lazy seed if matrixRows is empty on first render of interactive panel
  const initInteractiveRows = () => {
    let parsed = parseMatrixFromMarkdown(result);
    if (parsed.length === 0) {
      parsed = getFallbackRows(lesson || matrix);
    }
    setMatrixRows(parsed);
    const md = serializeMatrixToMarkdown(parsed);
    setResult(md);
  };

  useEffect(() => {
    if (viewMode === 'interactive' && matrixRows.length === 0) {
      initInteractiveRows();
    }
  }, [viewMode]);

  const handleRowValueChange = (id: string, field: keyof MatrixEditorRow, val: any) => {
    const updated = matrixRows.map(r => {
      if (r.id !== id) return r;
      const newRow = { ...r, [field]: val };
      
      // Auto-compute point rules based on count if count is updated
      if (field === 'nbCount') {
        newRow.nbDiem = Number((val * 0.25).toFixed(2));
      } else if (field === 'thCount') {
        newRow.thDiem = Number((val * 0.25).toFixed(2));
      } else if (field === 'vdCount') {
        newRow.vdDiem = Number((val * 0.5).toFixed(2));
      } else if (field === 'vdcCount') {
        newRow.vdcDiem = Number((val * 1.0).toFixed(2));
      }
      return newRow;
    });

    setMatrixRows(updated);
    const md = serializeMatrixToMarkdown(updated);
    setResult(md);
  };

  const handleDeleteRow = (id: string) => {
    const updated = matrixRows.filter(r => r.id !== id);
    setMatrixRows(updated);
    const md = serializeMatrixToMarkdown(updated);
    setResult(md);
  };

  const handleAddRow = () => {
    const newRow: MatrixEditorRow = {
      id: crypto.randomUUID(),
      topic: `Chủ đề mới ${matrixRows.length + 1}`,
      nbCount: 2,
      nbDiem: 0.5,
      thCount: 2,
      thDiem: 0.5,
      vdCount: 0,
      vdDiem: 0,
      vdcCount: 0,
      vdcDiem: 0
    };
    const updated = [...matrixRows, newRow];
    setMatrixRows(updated);
    const md = serializeMatrixToMarkdown(updated);
    setResult(md);
  };

  // Drag and drop mechanics
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const updatedRows = [...matrixRows];
    const draggedRow = updatedRows[draggedIdx];
    updatedRows.splice(draggedIdx, 1);
    updatedRows.splice(index, 0, draggedRow);
    
    setDraggedIdx(index);
    setMatrixRows(updatedRows);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    const md = serializeMatrixToMarkdown(matrixRows);
    setResult(md);
  };

  // Checklist table state for review
  const [checklist, setChecklist] = useState([
    { criterion: "Đúng mẫu Công văn 1791/7991 chưa?", status: "Đạt", notes: "Có đủ Ma trận và Bản đặc tả" },
    { criterion: "Đúng cấu trúc đề mẫu chưa?", status: "Đạt", notes: "Trắc nghiệm 1 lựa chọn, Đúng-sai, Trả lời ngắn" },
    { criterion: "Bám sát sách giáo khoa dạy học chưa?", status: "Đạt", notes: "Chứa đầy đủ kiến thức chính" },
    { criterion: "Tổng điểm đủ 10 chưa?", status: "Đạt", notes: "Đúng cấu trúc 3:4:3 điểm" },
    { criterion: "Ma trận và đặc tả đã khớp nhau chưa?", status: "Đạt", notes: "Khớp số lượng câu ở mỗi mức" },
    { criterion: "Các mức độ đánh giá đã hợp lý chưa?", status: "Đạt", notes: "Biết - Hiểu - Vận dụng phân loại rõ rệt" },
  ]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunGemini = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/generate/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson, cv7991, sampleExam, matrix, step1Result, prompt }),
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (response.status === 413) {
          throw new Error("Dung lượng tài liệu quá lớn so với giới hạn xử lý. Thầy cô vui lòng chia nhỏ thông tin đầu vào!");
        }
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(`Máy chủ AI đang bận hoặc quá tải tạm thời (Lỗi ${response.status}). Thầy cô vui lòng bấm nút "Chạy lại" sau vài giây.`);
        }
        throw new Error(`Lỗi phản hồi từ hệ thống (Lỗi ${response.status}). Hãy thử lại.`);
      }
      if (!response.ok || data.error) {
        throw new Error(data.error || "Gặp lỗi khi sinh ma trận đặc tả.");
      }
      setResult(data.result || "");
      setViewMode('preview');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Không thể kết nối đến server. Vui lòng kiểm tra lại cấu hình API hoặc kết nối mạng.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-100">
          <Layers size={24} />
        </div>
        <div>
          <div className="text-teal-600 font-bold text-xs uppercase tracking-wider">QUY TRÌNH RA ĐỀ - BƯỚC 2</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Bước 2. Lập Ma trận & Bản đặc tả theo quy chế
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">
            Tự động lập bảng phân bố tỉ lệ câu hỏi, số lượng câu, mức đánh giá và các tiêu chí cần đạt.
          </p>
        </div>
      </div>

      {/* Main flow interaction */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-teal-500" />
              Sinh Ma trận & Bản đặc tả tự động
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Hệ thống sẽ bám sát ý kiến phân tích Bước 1 và các tỉ lệ học tập để hoàn chỉnh bảng ma trận đề.
            </p>
          </div>
          <button
            onClick={handleRunGemini}
            disabled={isRunning}
            className="w-full md:w-auto px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-300 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-100"
          >
            {isRunning ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang thiết lập ma trận...
              </>
            ) : (
              <>
                <Play fill="currentColor" size={12} />
                Chạy sinh ma trận với Gemini
              </>
            )}
          </button>
        </div>

        {/* Collapsible Prompt Advanced Config */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
          <button
            onClick={() => setShowPromptConfig(!showPromptConfig)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-slate-600 hover:bg-slate-100/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings size={14} className="text-slate-400" />
              Cấu hình câu lệnh tạo ma trận đặc tả nâng cao
            </span>
            <ChevronDown size={14} className={`transform transition-transform ${showPromptConfig ? 'rotate-180' : ''}`} />
          </button>
          
          {showPromptConfig && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-4 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Bạn có thể tự chỉnh sửa câu lệnh hệ thống gửi đi gửi cho AI:</span>
                <button
                  onClick={handleCopyPrompt}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    copied 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Đã sao chép' : 'Sao chép văn bản'}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-64 p-4 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-y font-mono bg-slate-900 text-slate-100 leading-relaxed custom-scrollbar"
                placeholder="Câu lệnh sinh ma trận..."
              />
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-850 rounded-2xl font-bold text-sm">
          ❌ HỆ THỐNG PHẢN HỒI LỖI: {errorMsg}
        </div>
      )}

      {/* Results Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500 animate-pulse" />
            Ma trận & Đặc tả kiểm tra chi tiết
          </h3>
          
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => {
                setViewMode('interactive');
                if (matrixRows.length === 0) {
                  initInteractiveRows();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'interactive' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={14} /> Biên soạn trực quan (CV7991)
            </button>
            <button
              onClick={() => setViewMode('preview')}
              disabled={!result}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'preview' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
              }`}
            >
              <Eye size={14} /> Xem ma trận dạng bảng
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'edit' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 size={14} /> Sửa mã nguồn Markdown
            </button>
          </div>
        </div>
        
        <div className="p-6 md:p-8 flex-1 bg-white">
          {viewMode === 'interactive' ? (
            <div className="space-y-6">
              {/* Real-time Computations */}
              {(() => {
                const totalNbPoints = matrixRows.reduce((sum, r) => sum + Number(r.nbDiem || 0), 0);
                const totalThPoints = matrixRows.reduce((sum, r) => sum + Number(r.thDiem || 0), 0);
                const totalVdPoints = matrixRows.reduce((sum, r) => sum + Number(r.vdDiem || 0), 0);
                const totalVdcPoints = matrixRows.reduce((sum, r) => sum + Number(r.vdcDiem || 0), 0);
                const grandTotalPoints = Number((totalNbPoints + totalThPoints + totalVdPoints + totalVdcPoints).toFixed(2));
                
                const totalNbCount = matrixRows.reduce((sum, r) => sum + Number(r.nbCount || 0), 0);
                const totalThCount = matrixRows.reduce((sum, r) => sum + Number(r.thCount || 0), 0);
                const totalVdCount = matrixRows.reduce((sum, r) => sum + Number(r.vdCount || 0), 0);
                const totalVdcCount = matrixRows.reduce((sum, r) => sum + Number(r.vdcCount || 0), 0);
                const grandTotalQuestions = totalNbCount + totalThCount + totalVdCount + totalVdcCount;

                // CV7991 Deviations Validation
                const isPointsValid = Math.abs(grandTotalPoints - 10) < 0.01;
                const nbPercent = grandTotalPoints > 0 ? (totalNbPoints / grandTotalPoints) * 100 : 0;
                const thPercent = grandTotalPoints > 0 ? (totalThPoints / grandTotalPoints) * 100 : 0;
                const vdPercent = grandTotalPoints > 0 ? (totalVdPoints / grandTotalPoints) * 100 : 0;
                const vdcPercent = grandTotalPoints > 0 ? (totalVdcPoints / grandTotalPoints) * 100 : 0;

                return (
                  <>
                    {/* CV7991 Live Constraint Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* NB Card */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nhận biết (NB)</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${Math.abs(nbPercent - 40) <= 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {Math.abs(nbPercent - 40) <= 5 ? 'Chuẩn Gợi Ý' : `Lệch ${(nbPercent - 40).toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xl font-black text-slate-800">{totalNbPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-400">điểm</span></div>
                          <div className="text-xs font-bold text-slate-500 mt-0.5">{totalNbCount} câu hỏi</div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>Tỉ lệ thực: {nbPercent.toFixed(0)}%</span>
                            <span>Mục tiêu: 40%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(nbPercent, 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* TH Card */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông hiểu (TH)</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${Math.abs(thPercent - 30) <= 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {Math.abs(thPercent - 30) <= 5 ? 'Chuẩn Gợi Ý' : `Lệch ${(thPercent - 30).toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xl font-black text-slate-800">{totalThPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-400">điểm</span></div>
                          <div className="text-xs font-bold text-slate-500 mt-0.5">{totalThCount} câu hỏi</div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>Tỉ lệ thực: {thPercent.toFixed(0)}%</span>
                            <span>Mục tiêu: 30%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(thPercent, 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* VD Card */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vận dụng (VD)</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${Math.abs(vdPercent - 20) <= 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {Math.abs(vdPercent - 20) <= 5 ? 'Chuẩn Gợi Ý' : `Lệch ${(vdPercent - 20).toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xl font-black text-slate-800">{totalVdPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-400">điểm</span></div>
                          <div className="text-xs font-bold text-slate-500 mt-0.5">{totalVdCount} câu hỏi</div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>Tỉ lệ thực: {vdPercent.toFixed(0)}%</span>
                            <span>Mục tiêu: 20%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(vdPercent, 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* VDC Card */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vận dụng cao (VDC)</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${Math.abs(vdcPercent - 10) <= 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {Math.abs(vdcPercent - 10) <= 5 ? 'Chuẩn Gợi Ý' : `Lệch ${(vdcPercent - 10).toFixed(0)}%`}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xl font-black text-slate-800">{totalVdcPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-400">điểm</span></div>
                          <div className="text-xs font-bold text-slate-500 mt-0.5">{totalVdcCount} câu hỏi</div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span>Tỉ lệ thực: {vdcPercent.toFixed(0)}%</span>
                            <span>Mục tiêu: 10%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(vdcPercent, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CV7991 Constraint Alert Check */}
                    {!isPointsValid && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-850">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold">⚠️ Cảnh báo ràng buộc Công văn 7991 / 1791</p>
                          <p className="text-xs font-semibold leading-relaxed">
                            Tổng số điểm của ma trận đề thi hiện tại là <strong className="font-bold text-amber-950 text-sm">{grandTotalPoints.toFixed(2)}đ</strong>. 
                            Để đúng quy chế kiểm định chất lượng của Bộ GD&ĐT, Thầy/Cô vui lòng phân bổ điểm số của các ô sao cho tổng cộng đạt đúng <strong className="font-bold text-amber-950">10.0đ</strong>.
                          </p>
                        </div>
                      </div>
                    )}

                    {isPointsValid && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 text-emerald-850">
                        <CheckCircle className="text-emerald-650 flex-shrink-0 mt-0.5" size={18} />
                        <div className="space-y-0.5">
                          <p className="text-xs font-extrabold text-emerald-950">✅ Thiết lập đạt tiêu chuẩn Công văn 7991/BGDĐT</p>
                          <p className="text-[11px] font-semibold leading-relaxed text-emerald-800">
                            Tổng điểm đạt hoàn hảo 10.0đ. Phân bổ tỉ lệ các câu Nhận biết (NB), Thông hiểu (TH), Vận dụng (VD), Vận dụng cao (VDC) đã đảm bảo tính cân bằng theo chuẩn kiến thức định kì.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Instruction Alert banner */}
                    <div className="flex bg-indigo-50 border border-indigo-100 rounded-2xl p-4 items-start gap-3 text-indigo-900 select-none">
                      <Info className="text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" size={18} />
                      <p className="text-xs font-medium leading-relaxed">
                        💡 <strong className="font-bold text-indigo-950">Mẹo nâng tải:</strong> Thầy/Cô có thể <strong>kéo và thả (click & drag) biểu tượng tay nắm </strong> ở đầu mỗi dòng để sắp xếp thứ tự ưu tiên xuất hiện của các chủ đề kiến thức. Nhập trực tiếp số câu để tự động tính toán điểm số hoặc ghi đè tùy thích.
                      </p>
                    </div>

                    {/* The Interactive Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-3xl shadow-xs bg-white mt-4">
                      <table className="w-full text-left text-sm border-collapse matrix-table">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-center w-12 text-slate-500 text-xs font-bold uppercase tracking-wider select-none">Kéo</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[280px]">Chủ đề và Đơn vị kiến thức</th>
                            <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-orange-50/20 w-36">Nhận biết (NB)</th>
                            <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-amber-50/20 w-36">Thông hiểu (TH)</th>
                            <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-blue-50/20 w-36">Vận dụng (VD)</th>
                            <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-purple-50/20 w-36">Vận dụng cao (VDC)</th>
                            <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider font-extrabold text-indigo-900 w-32">Tổng cộng</th>
                            <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-20 select-none">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {matrixRows.map((row, idx) => {
                            const rowCount = row.nbCount + row.thCount + row.vdCount + row.vdcCount;
                            const rowPoints = row.nbDiem + row.thDiem + row.vdDiem + row.vdcDiem;
                            
                            return (
                              <tr 
                                key={row.id}
                                className={`hover:bg-slate-50/50 transition-colors ${draggedIdx === idx ? 'opacity-40 bg-indigo-50 border border-indigo-200' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragEnd={handleDragEnd}
                              >
                                {/* DRAG HANDLE */}
                                <td className="p-4 text-center cursor-grab active:cursor-grabbing select-none text-slate-350 hover:text-indigo-650 transition-colors group">
                                  <GripVertical size={16} className="mx-auto group-hover:scale-110" />
                                </td>
                                
                                {/* TOPIC NAME */}
                                <td className="p-4 font-bold text-slate-800">
                                  <input 
                                    type="text" 
                                    value={row.topic}
                                    onChange={(e) => handleRowValueChange(row.id, 'topic', e.target.value)}
                                    className="w-full bg-slate-50 border border-transparent rounded-xl p-2 hover:border-slate-200 focus:border-teal-500 focus:bg-white text-xs font-extrabold focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder-slate-400"
                                    placeholder="Ví dụ: Định lý Vi-ét"
                                  />
                                </td>
                                
                                {/* NHẬN BIẾT (NB) */}
                                <td className="p-4 text-center bg-orange-50/10">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Câu</span>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={row.nbCount}
                                        onChange={(e) => handleRowValueChange(row.id, 'nbCount', parseInt(e.target.value) || 0)}
                                        className="w-10 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Điểm</span>
                                      <input 
                                        type="number" 
                                        step="0.05"
                                        min="0"
                                        value={row.nbDiem}
                                        onChange={(e) => handleRowValueChange(row.id, 'nbDiem', parseFloat(e.target.value) || 0)}
                                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none text-orange-700"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* THÔNG HIỂU (TH) */}
                                <td className="p-4 text-center bg-amber-50/10">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Câu</span>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={row.thCount}
                                        onChange={(e) => handleRowValueChange(row.id, 'thCount', parseInt(e.target.value) || 0)}
                                        className="w-10 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Điểm</span>
                                      <input 
                                        type="number" 
                                        step="0.05"
                                        min="0"
                                        value={row.thDiem}
                                        onChange={(e) => handleRowValueChange(row.id, 'thDiem', parseFloat(e.target.value) || 0)}
                                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none text-amber-700"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* VẬN DỤNG (VD) */}
                                <td className="p-4 text-center bg-blue-50/10">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Câu</span>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={row.vdCount}
                                        onChange={(e) => handleRowValueChange(row.id, 'vdCount', parseInt(e.target.value) || 0)}
                                        className="w-10 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Điểm</span>
                                      <input 
                                        type="number" 
                                        step="0.05"
                                        min="0"
                                        value={row.vdDiem}
                                        onChange={(e) => handleRowValueChange(row.id, 'vdDiem', parseFloat(e.target.value) || 0)}
                                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none text-blue-700"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* VẬN DỤNG CAO (VDC) */}
                                <td className="p-4 text-center bg-purple-50/10">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Câu</span>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={row.vdcCount}
                                        onChange={(e) => handleRowValueChange(row.id, 'vdcCount', parseInt(e.target.value) || 0)}
                                        className="w-10 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-bold select-none">Điểm</span>
                                      <input 
                                        type="number" 
                                        step="0.05"
                                        min="0"
                                        value={row.vdcDiem}
                                        onChange={(e) => handleRowValueChange(row.id, 'vdcDiem', parseFloat(e.target.value) || 0)}
                                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded p-1 font-bold text-xs hover:border-slate-300 focus:border-teal-500 focus:bg-white outline-none text-purple-700"
                                      />
                                    </div>
                                  </div>
                                </td>
                                
                                {/* ROW TOTAL */}
                                <td className="p-4 text-center font-extrabold text-slate-700 bg-slate-50/30 select-none">
                                  <div className="text-xs">{rowCount} câu</div>
                                  <div className="text-[10px] text-indigo-700 font-black mt-0.5">{rowPoints.toFixed(2)}đ</div>
                                </td>
                                
                                {/* ROW DELETE */}
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => handleDeleteRow(row.id)}
                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                                    title="Xóa dòng chủ đề"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 font-extrabold select-none text-slate-800 border-t border-slate-200">
                            <td colSpan={2} className="p-4 text-sm font-black">Cộng toàn đề thi</td>
                            <td className="p-4 text-center text-orange-850">
                              <div className="text-[11px]">{totalNbCount} câu</div>
                              <div className="text-xs font-black">{totalNbPoints.toFixed(2)}đ</div>
                            </td>
                            <td className="p-4 text-center text-amber-850">
                              <div className="text-[11px]">{totalThCount} câu</div>
                              <div className="text-xs font-black">{totalThPoints.toFixed(2)}đ</div>
                            </td>
                            <td className="p-4 text-center text-blue-850">
                              <div className="text-[11px]">{totalVdCount} câu</div>
                              <div className="text-xs font-black">{totalVdPoints.toFixed(2)}đ</div>
                            </td>
                            <td className="p-4 text-center text-purple-850">
                              <div className="text-[11px]">{totalVdcCount} câu</div>
                              <div className="text-xs font-black">{totalVdcPoints.toFixed(2)}đ</div>
                            </td>
                            <td className="p-4 text-center bg-indigo-50/50 text-indigo-950 font-black">
                              <div className="text-xs">{grandTotalQuestions} câu</div>
                              <div className="text-sm font-extrabold underline decoration-2">{grandTotalPoints.toFixed(2)}đ</div>
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Add Row Button */}
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handleAddRow}
                        className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus size={14} /> Thêm đơn vị kiến thức (Dòng mới)
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : viewMode === 'edit' ? (
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Nội dung Ma trận & Đề xuất phân khối đặc tả sẽ hiển thị ở đây sau khi sinh..."
              className="w-full h-[450px] p-4 border border-slate-250 rounded-2xl focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none text-sm font-sans leading-relaxed text-slate-850 custom-scrollbar shadow-inner"
            />
          ) : (
            <div className="prose max-w-none text-slate-750 text-sm leading-relaxed overflow-x-auto">
              {result ? (
                <ContentRenderer content={result} />
              ) : (
                <div className="text-center py-16 text-slate-400 font-medium">
                  Chưa có ma trận đề. Hãy nhấn nút <strong className="font-bold text-teal-600">"Chạy sinh ma trận với Gemini"</strong> ở phía trên để tự động khởi tạo!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Area - Checklist */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-emerald-600" size={20} />
          <h3 className="font-bold text-slate-800 text-base">Bảng Tự Rà Soát (Tự đánh giá Ma trận & Bản đặc tả)</h3>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                <th className="p-4 text-center w-12">#</th>
                <th className="p-4">Tiêu chí kiểm tra</th>
                <th className="p-4 w-28 text-center">Trạng thái</th>
                <th className="p-4">Ý kiến điều chỉnh / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750">
              {checklist.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-4 font-semibold">{item.criterion}</td>
                  <td className="p-4 text-center">
                    <select 
                      value={item.status}
                      onChange={(e) => {
                        const updated = [...checklist];
                        updated[idx].status = e.target.value;
                        setChecklist(updated);
                      }}
                      className="py-1 px-2.5 rounded-lg font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Đạt">Đạt ✅</option>
                      <option value="Chưa Đạt">Chưa Đạt ❌</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={item.notes}
                      onChange={(e) => {
                        const updated = [...checklist];
                        updated[idx].notes = e.target.value;
                        setChecklist(updated);
                      }}
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs border border-transparent hover:border-slate-200 focus:border-slate-300 rounded-lg p-2 transition-all outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between border-t border-slate-100 pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-slate-300 text-slate-755 hover:bg-slate-50 rounded-xl font-bold transition-all text-sm"
        >
          Trở lại Bước 1
        </button>
        <button
          onClick={onNext}
          disabled={!result.trim()}
          className={`px-8 py-3.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all text-sm ${
            !result.trim() 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
          }`}
        >
          Tiến hành Bước 3: Tạo đề thi gốc <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default Step2Matrix;
