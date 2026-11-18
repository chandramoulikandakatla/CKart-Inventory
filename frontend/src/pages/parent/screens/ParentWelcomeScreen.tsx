import React from 'react';
import {
  Wallet, ShieldCheck
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentWelcomeScreen: React.FC = () => {
  const {
    setParentScreen,
  } = useCampusKart();

  return (
            <div className="max-w-xl mx-auto my-8 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-8 text-center shadow-2xl space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/25">
                <ShieldCheck className="w-8 h-8 text-[#2C1A12]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-sky-800">
                CampusKart Guardian Financial Suite
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1A12]">
                Transparent Student Wallet Oversight
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Instantly fund your child’s CampusKart wallet, inspect item-level receipts, analyze monthly nutrition and stationary expenditure, and set automated daily or category spending rules.
              </p>
              <button
                onClick={() => setParentScreen('login')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-sm shadow-xl shadow-sky-500/25"
              >
                Access Parent Dashboard →
              </button>
            </div>

  );
};

export default ParentWelcomeScreen;
