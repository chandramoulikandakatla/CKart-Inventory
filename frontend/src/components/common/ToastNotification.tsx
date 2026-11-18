import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export interface ToastData {
  id?: number;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | string;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-[0_16px_40px_-8px_rgba(44,26,18,0.14)] rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className={`p-2 rounded-xl shrink-0 ${
        toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-700' :
        toast.type === 'error' ? 'bg-rose-500/20 text-rose-600' :
        'bg-orange-500/15 text-orange-600'
      }`}>
        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
         toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
         <Sparkles className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2C1A12]">{toast.title}</p>
        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-stone-500 hover:text-[#2C1A12] text-xs px-1.5 py-0.5">✕</button>
    </div>
  );
};

export default ToastNotification;
