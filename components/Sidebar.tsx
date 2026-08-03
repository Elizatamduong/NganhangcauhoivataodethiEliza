
import React from 'react';
import { 
  Home, 
  Layers, 
  FileText, 
  DownloadCloud, 
  PlusCircle,
  BookOpen,
  HelpCircle,
  Printer,
  Copy
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenGuide: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenGuide }) => {
  const menuItems = [
    { id: 'M0', label: '0. Chuẩn bị nguồn', icon: Home },
    { id: 'M1', label: '1. Phân tích nguồn', icon: BookOpen },
    { id: 'M2', label: '2. Ma trận & Đặc tả', icon: Layers },
    { id: 'M3', label: '3. Đề kiểm tra gốc', icon: PlusCircle },
    { id: 'M4', label: '4. Xuất file đề thi', icon: Printer },
    { id: 'M5', label: '5. Tạo mã đề gộp', icon: Copy },
    { id: 'M6', label: 'Sao lưu & Khôi phục', icon: DownloadCloud },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col no-print z-40 shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-base font-bold text-blue-400 flex items-start gap-2 leading-tight">
          <FileText size={22} className="shrink-0 mt-0.5" />
          <span>Eliza Tâm Dương<br/><span className="text-xs text-blue-300 font-medium">SĐT: 0962571826</span></span>
        </h1>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Hệ thống Ngân hàng & Đề thi</p>
      </div>
      
      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 space-y-2 border-t border-slate-800">
        <button 
          onClick={onOpenGuide}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700"
        >
          <HelpCircle size={18} className="text-blue-400" />
          Hướng dẫn
        </button>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800">
           <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hệ thống ngoại tuyến</span>
           </div>
           <p className="text-[9px] text-slate-500">Dữ liệu lưu tại IndexedDB</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
