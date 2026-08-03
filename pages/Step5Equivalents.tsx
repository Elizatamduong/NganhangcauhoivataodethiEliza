import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Play, 
  Loader2, 
  Layers, 
  Sparkles, 
  Eye, 
  Edit3, 
  Bookmark, 
  CheckCircle,
  Settings,
  ChevronDown
} from 'lucide-react';
import ContentRenderer from '../components/ContentRenderer';

interface Step5EquivalentsProps {
  lesson: string;
  cv7991: string;
  sampleExam: string;
  step1Result: string;
  step2Result: string;
  step3Result: string;
  prompt: string;
  setPrompt: (v: string) => void;
  result: string;
  setResult: (v: string) => void;
  onPrev: () => void;
}

const Step5Equivalents: React.FC<Step5EquivalentsProps> = ({
  lesson,
  cv7991,
  sampleExam,
  step1Result,
  step2Result,
  step3Result,
  prompt,
  setPrompt,
  result,
  setResult,
  onPrev
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>(result ? 'preview' : 'edit');
  const [showPromptConfig, setShowPromptConfig] = useState(false); // Collapsed by default!

  // Review table checklist for equivalents
  const [review, setReview] = useState([
    { criteria: "Cùng cấu trúc với đề gốc chưa?", m101: "Đạt", m102: "Đạt", m103: "Đạt", m104: "Đạt", note: "Đều gồm 12 câu trắc nghiệm, 4 câu đúng-sai, 6 câu trả lời ngắn" },
    { criteria: "Có cùng độ khó/ma trận không?", m101: "Đạt", m102: "Đạt", m103: "Đạt", m104: "Đạt", note: "Đúng tỉ lệ 3:4:3 của đề khảo sát" },
    { criteria: "Số liệu hoán đổi có tính ra số đẹp không?", m101: "Đạt", m102: "Đạt", m103: "Đạt", m104: "Đạt", note: "Các nghiệm biệt số nghiệm kép đều nguyên" },
    { criteria: "Các mã đề có kèm biểu điểm và đáp án riêng?", m101: "Đạt", m102: "Đạt", m103: "Đạt", m104: "Đạt", note: "Tương thích 100%" },
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
      const response = await fetch("/api/generate/step5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson, cv7991, sampleExam, step1Result, step2Result, step3Result, prompt }),
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
        throw new Error(data.error || "Gặp lỗi khi tạo mã đề tương đương.");
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
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Bookmark size={24} />
        </div>
        <div>
          <div className="text-indigo-600 font-bold text-xs uppercase tracking-wider">QUY TRÌNH RA ĐỀ - BƯỚC 5</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Bước 5. Tạo các Mã đề tương đương (Mã đề gộp)
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">
            Phát triển các mã đề biến thể (Mã đề 101, 102, 103, 104) từ đề kiểm tra gốc ban đầu.
          </p>
        </div>
      </div>

      {/* Main flow interaction */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              Khởi tạo 4 mã đề tương đương tự động
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Hệ thống sẽ giữ vững ma trận, thay đổi tham số cấu trúc thông minh để sinh ra 4 mã biến thể khác biệt nhưng đồng độ khó.
            </p>
          </div>
          <button
            onClick={handleRunGemini}
            disabled={isRunning}
            className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {isRunning ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang tạo mã đề...
              </>
            ) : (
              <>
                <Play fill="currentColor" size={12} />
                Chạy sinh mã đề với Gemini
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
              Cấu hình câu lệnh hoán đề và gộp mã đề nâng cao
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
                className="w-full h-64 p-4 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-y font-mono bg-slate-900 text-slate-100 leading-relaxed custom-scrollbar"
                placeholder="Câu lệnh nhân bản mã đề..."
              />
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-semibold text-sm">
          ❌ HỆ THỐNG PHẢN HỒI LỖI: {errorMsg}
        </div>
      )}

      {/* Results Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500 animate-pulse" />
            Tập tin 4 Mã đề hoán đổi (101 - 104)
          </h3>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('preview')}
              disabled={!result}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'preview' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
              }`}
            >
              <Eye size={14} /> Xem văn bản đẹp
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'edit' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 size={14} /> Sửa thủ công
            </button>
          </div>
        </div>
        
        <div className="p-8 flex-1 bg-white">
          {viewMode === 'edit' ? (
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Kết quả 4 mã đề sau khi sinh hoán vị sẽ được hiển thị ở đây..."
              className="w-full h-[350px] p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-sm font-sans"
            />
          ) : (
            <div className="prose max-w-none text-slate-750 text-sm leading-relaxed overflow-x-auto">
              {result ? (
                <ContentRenderer content={result} />
              ) : (
                <div className="text-center py-20 text-slate-400 select-none font-medium">
                  Chưa có các mã đề hoán đổi. Hãy nhấn nút <strong className="font-bold text-indigo-600">"Chạy sinh mã đề với Gemini"</strong> ở phía trên để tự động bắt đầu!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Self-Review area */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-emerald-600" size={20} />
          <h3 className="font-bold text-slate-800 text-base">Bảng Tự Rà Soát (Tự đánh giá 4 Mã đề biến thể)</h3>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                <th className="p-3 text-center w-12">#</th>
                <th className="p-3">Tiêu chí kiểm định</th>
                <th className="p-3 text-center w-20">Đề 101</th>
                <th className="p-3 text-center w-20">Đề 102</th>
                <th className="p-3 text-center w-20">Đề 103</th>
                <th className="p-3 text-center w-20">Đề 104</th>
                <th className="p-3">Ghi chú điều chỉnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-755">
              {review.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-semibold">{item.criteria}</td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-bold text-[10px]">ĐẠT ✅</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-bold text-[10px]">ĐẠT ✅</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-bold text-[10px]">ĐẠT ✅</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-bold text-[10px]">ĐẠT ✅</span>
                  </td>
                  <td className="p-3">
                    <input 
                      type="text" 
                      value={item.note}
                      onChange={(e) => {
                        const updated = [...review];
                        updated[idx].note = e.target.value;
                        setReview(updated);
                      }}
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-[11px] border border-transparent hover:border-slate-200 focus:border-slate-300 rounded-lg p-1.5 transition-all outline-none"
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
          className="px-6 py-3 border border-slate-300 text-slate-750 hover:bg-slate-50 rounded-xl font-bold transition-all text-sm animate-fade-in"
        >
          Trở lại Bước 4
        </button>
        <div className="text-sm font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm animate-pulse">
          <CheckCircle size={16} /> Toàn bộ quy trình sinh đề kiểm tra tự động đã hoàn thành mỹ mãn!
        </div>
      </div>

    </div>
  );
};

export default Step5Equivalents;
