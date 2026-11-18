import React from 'react';
import { ShoppingBag, ShieldCheck, Terminal, Building2, HelpCircle } from 'lucide-react';

interface EvaluatorBarProps {
  currentStudent: {
    firstName: string;
    walletBalance: number;
  };
  totalOrdersCount: number;
  activePortal: 'student' | 'parent' | 'ops' | 'college' | string;
  pendingOpsOrdersCount: number;
  onSelectPortal: (portal: 'student' | 'parent' | 'ops' | 'college') => void;
  onOpenDemoModal: () => void;
}

export const EvaluatorBar: React.FC<EvaluatorBarProps> = ({
  currentStudent,
  totalOrdersCount,
  activePortal,
  pendingOpsOrdersCount,
  onSelectPortal,
  onOpenDemoModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-stone-200/90 shadow-[0_4px_24px_-6px_rgba(44,26,18,0.07)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Brand & Live Sync Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 font-black text-white text-sm tracking-tighter">
            CK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-[#2C1A12] text-sm sm:text-base">
                CAMPUSKART
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-sky-800 border border-cyan-300/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Shared Ledger Live
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              Active Student Wallet ({currentStudent.firstName}):{' '}
              <strong className="text-[#2C1A12]">
                ₹{currentStudent.walletBalance.toLocaleString('en-IN')}
              </strong>{' '}
              · Orders: <strong className="text-[#2C1A12]">{totalOrdersCount}</strong>
            </p>
          </div>
        </div>

        {/* 4-Portal Switcher Pills */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] p-1 rounded-2xl border border-stone-200/80 overflow-x-auto max-w-full">
          <button
            onClick={() => onSelectPortal('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'student'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-stone-500 hover:text-white hover:bg-[#F5F0EB]/90'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>1. Student App</span>
          </button>

          <button
            onClick={() => onSelectPortal('parent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'parent'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-500/25'
                : 'text-stone-500 hover:text-white hover:bg-[#F5F0EB]/90'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Parent Portal</span>
          </button>

          <button
            onClick={() => onSelectPortal('ops')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'ops'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'text-stone-500 hover:text-white hover:bg-[#F5F0EB]/90'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Operations</span>
            {pendingOpsOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-stone-200/60 text-[10px]">
                {pendingOpsOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectPortal('college')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'college'
                ? 'bg-gradient-to-r from-[#4A2E1B] to-[#6F4E37] text-white shadow-lg shadow-stone-700/20'
                : 'text-stone-500 hover:text-white hover:bg-[#F5F0EB]/90'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>4. College Admin</span>
          </button>
        </div>

        {/* Evaluator Quick-Help & Demo Credentials */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDemoModal}
            className="px-3 py-1.5 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 border border-stone-200/90 text-xs font-medium text-[#4A2E1B] flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Evaluator Guide & Keys</span>
            <span className="sm:hidden">Keys</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default EvaluatorBar;
