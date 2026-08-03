import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GuideModal from './components/GuideModal';
import { ViewState } from './types';
import {
  Check,
  Home,
  BookOpen,
  Layers,
  PlusCircle,
  Printer,
  Copy
} from 'lucide-react';

// Importing Steps
import SourceSetup from './pages/SourceSetup';
import Step1Analysis from './pages/Step1Analysis';
import Step2Matrix from './pages/Step2Matrix';
import Step3OriginalExam from './pages/Step3OriginalExam';
import Step4Export from './pages/Step4Export';
import Step5Equivalents from './pages/Step5Equivalents';
import BackupRestore from './pages/BackupRestore';

// Importing Constants
import {
  DEFAULT_LESSON,
  DEFAULT_CV7991,
  DEFAULT_SAMPLE_EXAM,
  DEFAULT_MATRIX_TEMPLATE,
  PROMPT_STEP1,
  PROMPT_STEP2,
  PROMPT_STEP3,
  PROMPT_STEP5
} from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('M0');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Read state with fallbacks on bootup
  const [lesson, setLesson] = useState(() => localStorage.getItem('qbank_lesson') || DEFAULT_LESSON);
  const [cv7991, setCv7991] = useState(() => localStorage.getItem('qbank_cv7991') || DEFAULT_CV7991);
  const [sampleExam, setSampleExam] = useState(() => localStorage.getItem('qbank_sample_exam') || DEFAULT_SAMPLE_EXAM);
  const [matrix, setMatrix] = useState(() => localStorage.getItem('qbank_matrix') || DEFAULT_MATRIX_TEMPLATE);

  const [promptStep1, setPromptStep1] = useState(() => localStorage.getItem('qbank_prompt_step1') || PROMPT_STEP1);
  const [promptStep2, setPromptStep2] = useState(() => localStorage.getItem('qbank_prompt_step2') || PROMPT_STEP2);
  const [promptStep3, setPromptStep3] = useState(() => localStorage.getItem('qbank_prompt_step3') || PROMPT_STEP3);
  const [promptStep5, setPromptStep5] = useState(() => localStorage.getItem('qbank_prompt_step5') || PROMPT_STEP5);

  const [resultStep1, setResultStep1] = useState(() => localStorage.getItem('qbank_result_step1') || '');
  const [resultStep2, setResultStep2] = useState(() => localStorage.getItem('qbank_result_step2') || '');
  const [resultStep3, setResultStep3] = useState(() => localStorage.getItem('qbank_result_step3') || '');
  const [resultStep5, setResultStep5] = useState(() => localStorage.getItem('qbank_result_step5') || '');

  // Persists states in localStorage
  useEffect(() => { localStorage.setItem('qbank_lesson', lesson); }, [lesson]);
  useEffect(() => { localStorage.setItem('qbank_cv7991', cv7991); }, [cv7991]);
  useEffect(() => { localStorage.setItem('qbank_sample_exam', sampleExam); }, [sampleExam]);
  useEffect(() => { localStorage.setItem('qbank_matrix', matrix); }, [matrix]);

  useEffect(() => { localStorage.setItem('qbank_prompt_step1', promptStep1); }, [promptStep1]);
  useEffect(() => { localStorage.setItem('qbank_prompt_step2', promptStep2); }, [promptStep2]);
  useEffect(() => { localStorage.setItem('qbank_prompt_step3', promptStep3); }, [promptStep3]);
  useEffect(() => { localStorage.setItem('qbank_prompt_step5', promptStep5); }, [promptStep5]);

  useEffect(() => { localStorage.setItem('qbank_result_step1', resultStep1); }, [resultStep1]);
  useEffect(() => { localStorage.setItem('qbank_result_step2', resultStep2); }, [resultStep2]);
  useEffect(() => { localStorage.setItem('qbank_result_step3', resultStep3); }, [resultStep3]);
  useEffect(() => { localStorage.setItem('qbank_result_step5', resultStep5); }, [resultStep5]);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('qbank_seen_guide');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
      localStorage.setItem('qbank_seen_guide', 'true');
    }
  }, []);

  const handleExportAll = async () => {
    const fullData = {
      lesson,
      cv7991,
      sampleExam,
      matrix,
      resultStep1,
      resultStep2,
      resultStep3,
      resultStep5,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quy_Trinh_Tao_De_Kiem_Tra_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa sạch TOÀN BỘ dữ liệu bài soạn của bạn trên trình duyệt này. Bạn có chắc chắn?')) {
      localStorage.clear();
      setLesson('');
      setCv7991('');
      setSampleExam('');
      setMatrix('');
      setResultStep1('');
      setResultStep2('');
      setResultStep3('');
      setResultStep5('');
      alert('Đã xóa sạch bộ nhớ tạm.');
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'M0':
        return (
          <SourceSetup
            lesson={lesson}
            setLesson={setLesson}
            cv7991={cv7991}
            setCv7991={setCv7991}
            sampleExam={sampleExam}
            setSampleExam={setSampleExam}
            matrix={matrix}
            setMatrix={setMatrix}
            onNext={() => setCurrentView('M1')}
          />
        );
      case 'M1':
        return (
          <Step1Analysis
            lesson={lesson}
            cv7991={cv7991}
            sampleExam={sampleExam}
            matrix={matrix}
            prompt={promptStep1}
            setPrompt={setPromptStep1}
            result={resultStep1}
            setResult={setResultStep1}
            onNext={() => setCurrentView('M2')}
            onPrev={() => setCurrentView('M0')}
          />
        );
      case 'M2':
        return (
          <Step2Matrix
            lesson={lesson}
            cv7991={cv7991}
            sampleExam={sampleExam}
            matrix={matrix}
            step1Result={resultStep1}
            prompt={promptStep2}
            setPrompt={setPromptStep2}
            result={resultStep2}
            setResult={setResultStep2}
            onNext={() => setCurrentView('M3')}
            onPrev={() => setCurrentView('M1')}
          />
        );
      case 'M3':
        return (
          <Step3OriginalExam
            lesson={lesson}
            cv7991={cv7991}
            sampleExam={sampleExam}
            matrix={matrix}
            step1Result={resultStep1}
            step2Result={resultStep2}
            prompt={promptStep3}
            setPrompt={setPromptStep3}
            result={resultStep3}
            setResult={setResultStep3}
            onNext={() => setCurrentView('M4')}
            onPrev={() => setCurrentView('M2')}
          />
        );
      case 'M4':
        return (
          <Step4Export
            resultUi={resultStep3}
            onNext={() => setCurrentView('M5')}
            onPrev={() => setCurrentView('M3')}
          />
        );
      case 'M5':
        return (
          <Step5Equivalents
            lesson={lesson}
            cv7991={cv7991}
            sampleExam={sampleExam}
            step1Result={resultStep1}
            step2Result={resultStep2}
            step3Result={resultStep3}
            prompt={promptStep5}
            setPrompt={setPromptStep5}
            result={resultStep5}
            setResult={setResultStep5}
            onPrev={() => setCurrentView('M4')}
          />
        );
      case 'M6':
        return (
          <BackupRestore
            onExportAll={handleExportAll}
            onClearAllData={handleClearAllData}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-400">
            Chương trình không tồn tại.
          </div>
        );
    }
  };

  const steps = [
    { id: 'M0', title: 'Bước 0', subtitle: 'Nạp tệp nguồn', icon: Home, isCompleted: !!(lesson.trim() || cv7991.trim() || sampleExam.trim()) },
    { id: 'M1', title: 'Bước 1', subtitle: 'Phân tích tài liệu', icon: BookOpen, isCompleted: !!resultStep1.trim() },
    { id: 'M2', title: 'Bước 2', subtitle: 'Ma trận & Đặc tả', icon: Layers, isCompleted: !!resultStep2.trim() },
    { id: 'M3', title: 'Bước 3', subtitle: 'Tạo đề kiểm tra gốc', icon: PlusCircle, isCompleted: !!resultStep3.trim() },
    { id: 'M4', title: 'Bước 4', subtitle: 'Xuất bản đề thi', icon: Printer, isCompleted: !!resultStep3.trim() },
    { id: 'M5', title: 'Bước 5', subtitle: 'Tạo mã đề gộp', icon: Copy, isCompleted: !!resultStep5.trim() },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex pb-8">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenGuide={() => setIsGuideOpen(true)}
      />
      
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden transition-all duration-300 flex flex-col">
        {/* Wizard Progress Stepper Header */}
        {currentView !== 'M6' && (
          <div className="bg-white border-b border-slate-250 py-4 px-8 sticky top-0 z-30 shadow-xs no-print select-none">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentView === step.id;
                const isCompleted = step.isCompleted;
                
                return (
                  <React.Fragment key={step.id}>
                    {/* Step Item */}
                    <button
                      onClick={() => setCurrentView(step.id as ViewState)}
                      className="flex items-center gap-3 group text-left outline-none transition-all cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-50 shadow-md scale-105' 
                          : isCompleted 
                          ? 'bg-emerald-50 text-emerald-650 border border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                      }`}>
                        {isCompleted && !isActive ? (
                          <Check size={16} strokeWidth={2.5} />
                        ) : (
                          <Icon size={16} />
                        )}
                      </div>
                      <div className="hidden lg:block">
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                          {step.title}
                        </div>
                        <div className={`text-xs font-extrabold ${isActive ? 'text-slate-800' : 'text-slate-550 group-hover:text-slate-800'} transition-colors`}>
                          {step.subtitle}
                        </div>
                      </div>
                    </button>

                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div className="flex-1 h-[2px] mx-4 max-w-[60px] bg-slate-200 relative rounded-full hidden sm:block">
                        <div className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                          isCompleted ? 'w-full bg-emerald-500' : isActive ? 'w-1/2 bg-blue-500' : 'w-0 bg-slate-250'
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1">
          {renderContent()}
        </div>
      </main>

      <GuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />
    </div>
  );
};

export default App;
