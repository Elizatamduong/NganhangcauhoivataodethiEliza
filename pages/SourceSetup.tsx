import React, { useState, useRef } from 'react';
import { 
  FileText, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  Trash2, 
  CheckCircle,
  PlusCircle,
  Upload,
  Loader2
} from 'lucide-react';
import { 
  DEFAULT_CV7991, 
  DEFAULT_LESSON, 
  DEFAULT_SAMPLE_EXAM, 
  DEFAULT_MATRIX_TEMPLATE 
} from '../constants';

interface SourceSetupProps {
  lesson: string;
  setLesson: (v: string) => void;
  cv7991: string;
  setCv7991: (v: string) => void;
  sampleExam: string;
  setSampleExam: (v: string) => void;
  matrix: string;
  setMatrix: (v: string) => void;
  onNext: () => void;
}

const SourceSetup: React.FC<SourceSetupProps> = ({
  lesson,
  setLesson,
  cv7991,
  setCv7991,
  sampleExam,
  setSampleExam,
  matrix,
  setMatrix,
  onNext
}) => {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const fileInputRefs = {
    lesson: useRef<HTMLInputElement>(null),
    cv7991: useRef<HTMLInputElement>(null),
    sampleExam: useRef<HTMLInputElement>(null),
    matrix: useRef<HTMLInputElement>(null),
  };

  const handleLoadDefaults = () => {
    setLesson(DEFAULT_LESSON);
    setCv7991(DEFAULT_CV7991);
    setSampleExam(DEFAULT_SAMPLE_EXAM);
    setMatrix(DEFAULT_MATRIX_TEMPLATE);
    triggerNotification("Đã nạp bộ dữ liệu mẫu chuẩn (Toán 10 - Định lý Vi-ét)!");
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả tài liệu nguồn hiện tại không?")) {
      setLesson("");
      setCv7991("");
      setSampleExam("");
      setMatrix("");
      triggerNotification("Đã xóa trắng tài liệu nguồn.");
    }
  };

  const triggerNotification = (text: string) => {
    setSaveStatus(text);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const compressImage = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1600;
          const maxHeight = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Không thể khởi tạo môi ứng vẽ ảnh (canvas context)"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          const base64 = dataUrl.split(",")[1];
          resolve({ base64, mimeType: 'image/jpeg' });
        };
        img.onerror = () => reject(new Error("Tệp hình ảnh bị hỏng hoặc không thể đọc được."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Lỗi khi đọc tệp hình ảnh."));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File, fieldId: 'lesson' | 'cv7991' | 'sampleExam' | 'matrix') => {
    // Check file size limits to prevent Nginx and Server Payload Too Large Issues
    if (file.name.endsWith('.pdf') && file.size > 2 * 1024 * 1024) {
      alert(`Tệp PDF "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(2)} MB).\n\nĐể hệ thống hoạt động ổn định và tránh lỗi quá tải dung lượng, thầy cô vui lòng:\n1. Chia nhỏ PDF hoặc nén PDF trước khi tải lên (nên dưới 2MB).\n2. Hoặc sao chép (copy) và dán trực tiếp nội dung văn bản vào ô nhập phía dưới.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert(`Tệp "${file.name}" vượt quá giới hạn 15MB. Thầy cô vui lòng tối ưu hóa hoặc dán trực tiếp văn bản.`);
      return;
    }

    setUploadingId(fieldId);

    try {
      let base64 = "";
      let mimeType = file.type;
      const fileName = file.name;

      if (file.type.startsWith('image/')) {
        // Optimize and compress images before upload
        const compressed = await compressImage(file);
        base64 = compressed.base64;
        mimeType = compressed.mimeType;
      } else {
        // Read file directly as raw base64
        base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => {
            const res = r.result as string;
            resolve(res.split(",")[1]);
          };
          r.onerror = () => reject(new Error("Lỗi khi đọc tệp."));
          r.readAsDataURL(file);
        });
      }

      const response = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType, fileName }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (response.status === 413) {
          throw new Error("Dung lượng tài liệu quá lớn so với giới hạn xử lý. Thầy cô vui lòng chia nhỏ tài liệu hoặc dán trực tiếp nội dung văn bản vào ô nhập!");
        }
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(`Máy chủ AI đang bận hoặc quá tải tạm thời (Lỗi ${response.status}). Thầy cô vui lòng đợi khoảng 10 giây rồi thử lại.`);
        }
        throw new Error(`Lỗi phản hồi từ hệ thống (Lỗi ${response.status}). Hãy thử lại.`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || "Gặp lỗi khi số hóa tệp.");
      }

      const extractedText = data.text || "";
      
      // Get correct text state
      let currentVal = "";
      let setter: (v: string) => void;
      if (fieldId === 'lesson') { currentVal = lesson; setter = setLesson; }
      else if (fieldId === 'cv7991') { currentVal = cv7991; setter = setCv7991; }
      else if (fieldId === 'sampleExam') { currentVal = sampleExam; setter = setSampleExam; }
      else { currentVal = matrix; setter = setMatrix; }

      if (currentVal.trim()) {
        if (window.confirm("Bạn muốn GHI ĐÈ nội dung cũ hay CHÈN NỐI TIẾP nội dung mới của tệp này?")) {
          setter(extractedText);
        } else {
          setter((currentVal + "\n\n=== NỘI DUNG TỪ TỆP: " + fileName + " ===\n" + extractedText).trim());
        }
      } else {
        setter(extractedText);
      }
      triggerNotification(`Đã trích xuất & số hóa thành công tệp: ${fileName}! Hệ thống đang tự động chuyển qua Bước 1 (Phân tích nguồn)...`);
      
      // Auto navigate to M1 after 1800ms
      setTimeout(() => {
        onNext();
      }, 1800);
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi số hóa tệp: ${err.message || err}`);
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: 'lesson' | 'cv7991' | 'sampleExam' | 'matrix') => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, fieldId);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, fieldId: 'lesson' | 'cv7991' | 'sampleExam' | 'matrix') => {
    e.preventDefault();
    setDragOverId(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, fieldId);
    }
  };

  const renderFileDropZone = (fieldId: 'lesson' | 'cv7991' | 'sampleExam' | 'matrix') => {
    const isUploading = uploadingId === fieldId;
    const isOver = dragOverId === fieldId;

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, fieldId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, fieldId)}
        onClick={() => fileInputRefs[fieldId].current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center ${
          isOver 
            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-inner scale-[0.99]' 
            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-500'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRefs[fieldId]}
          onChange={(e) => handleFileChange(e, fieldId)}
          accept="image/*,application/pdf,.docx,.txt"
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700 animate-pulse">
              Đang số hóa tài liệu này với Gemini...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOver ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              <Upload size={16} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">
                Kéo thả hoặc nhấn để tải tệp lên
              </p>
              <p className="text-[10px] text-slate-400">
                Hỗ trợ tệp Ảnh (JPG/PNG), Word (.docx), PDF hoặc Văn bản (.txt)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide">
            <Sparkles size={16} /> HỆ THỐNG KIỂM TRA ĐẶC TẢ TỰ ĐỘNG
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bước 0. Nạp thông tin tài liệu nguồn
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Tải lên tài liệu giảng dạy (SGK / Giáo án), Công văn 1791/7991, Đề thi mẫu và Ma trận để Gemini hỗ trợ tự động hóa toàn quy trình.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLoadDefaults}
            className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-all text-sm border border-blue-200 flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={16} /> Nạp dữ liệu mẫu
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold transition-all text-sm border border-rose-200 flex items-center gap-2 shadow-sm"
          >
            <Trash2 size={16} /> Xóa trắng
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 text-sm font-semibold animate-fade-in shadow-sm">
          <CheckCircle className="text-emerald-600" size={18} />
          {saveStatus}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Unit 1: SGK / Lesson */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">1. Tài liệu dạy học / SGK / Giáo án</h3>
                <p className="text-[11px] text-slate-400 font-medium">Chứa kiến thức, định tính, công thức trọng tâm</p>
              </div>
            </div>
          </div>
          
          {renderFileDropZone('lesson')}

          <textarea
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            placeholder="Nội dung sách giáo khoa hoặc giáo án sẽ xuất hiện ở đây sau khi tải tệp lên, hoặc bạn có thể tự dán thủ công..."
            className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50/30 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-sans"
          />
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Dùng tệp Ảnh, PDF, Word hoặc gõ trực tiếp</span>
            <span>{lesson.length.toLocaleString()} ký tự</span>
          </div>
        </div>

        {/* Unit 2: Công văn 7991 / 7791 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">2. Công văn Quy định (CV 1791 / 7991)</h3>
                <p className="text-[11px] text-slate-400 font-medium">Định nghĩa cấu trúc điểm, dạng thức câu hỏi, mức độ</p>
              </div>
            </div>
          </div>

          {renderFileDropZone('cv7991')}

          <textarea
            value={cv7991}
            onChange={(e) => setCv7991(e.target.value)}
            placeholder="Nội dung Công văn 1791 / 7991 hoặc quy chuẩn ra đề thi của cơ sở đào tạo..."
            className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50/30 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-sans"
          />
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Định mức tỷ lệ Nhận biết - Thông hiểu - Vận dụng</span>
            <span>{cv7991.length.toLocaleString()} ký tự</span>
          </div>
        </div>

        {/* Unit 3: Đề thi mẫu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">3. Đề kiểm tra mẫu</h3>
                <p className="text-[11px] text-slate-400 font-medium">Làm khuôn mẫu về cách trình bày, tiêu đề, số lượng câu</p>
              </div>
            </div>
          </div>

          {renderFileDropZone('sampleExam')}

          <textarea
            value={sampleExam}
            onChange={(e) => setSampleExam(e.target.value)}
            placeholder="Đề kiểm tra mẫu hoàn chỉnh..."
            className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50/30 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-sans"
          />
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Dùng đề mẫu để AI bắt chước đúng định dạng</span>
            <span>{sampleExam.length.toLocaleString()} ký tự</span>
          </div>
        </div>

        {/* Unit 4: Ma trận đề mẫu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">4. Ma trận đề thi mẫu (Nếu có)</h3>
                <p className="text-[11px] text-slate-400 font-medium">Bảng sơ đồ tỉ lệ phân phối câu hỏi theo chương, mức độ</p>
              </div>
            </div>
          </div>

          {renderFileDropZone('matrix')}

          <textarea
            value={matrix}
            onChange={(e) => setMatrix(e.target.value)}
            placeholder="Ma trận đề mẫu giúp AI nắm bắt phân phối chương mục..."
            className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50/30 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-sans"
          />
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Tự nạp qua biểu mẫu XLS/PDF/DOCX hoặc dán bảng</span>
            <span>{matrix.length.toLocaleString()} ký tự</span>
          </div>
        </div>
      </div>

      {/* Persistent Note */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex gap-4 items-start">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-850 flex items-center justify-center font-bold flex-shrink-0 text-sm">
          💡
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 text-sm mb-1">Mẹo nạp nhanh siêu hiệu quả</h4>
          <p className="text-indigo-700 text-xs leading-relaxed">
            Bạn có thể click nút <strong className="font-bold text-indigo-800">"Nạp dữ liệu mẫu"</strong> ở góc trên bên phải để nạp sẵn đề tài liệu, ma trận và mẫu môn Toán lớp 10, Định lý Vi-ét chuẩn chỉ của Eliza Tâm Dương SĐT 0962571826, giúp kiểm thử nhanh toàn bộ quy trình mà không phải soạn thủ công!
          </p>
        </div>
      </div>

      {/* Next Step Control */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!lesson.trim() && !cv7991.trim() && !sampleExam.trim()}
          className={`px-8 py-4 rounded-2xl font-extrabold flex items-center gap-2 transition-all text-base shadow-lg ${
            (!lesson.trim() && !cv7991.trim() && !sampleExam.trim())
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-100 hover:translate-y-[-1px]'
          }`}
        >
          Lưu & Tiến hành Phân tích Bước 1
          <PlusCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default SourceSetup;
