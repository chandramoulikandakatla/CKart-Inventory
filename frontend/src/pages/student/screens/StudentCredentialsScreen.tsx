import React from 'react';
import {
  KeyRound, ArrowRight, ArrowLeft, AlertTriangle
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentCredentialsScreen: React.FC = () => {
  const {
    ecosystem,
    setStudentScreen,
    credIdInput,
    setCredIdInput,
    credPassInput,
    setCredPassInput,
    credError,
    setCredError,
    handleValidateStudentCredentials,
  } = useCampusKart();

  return (
            <div className="max-w-md mx-auto my-8 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] backdrop-blur-2xl border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setStudentScreen('welcome')}
                className="text-xs text-stone-500 hover:text-[#2C1A12] flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Welcome
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-orange-500/15 border border-orange-300/80 text-orange-700">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600">Step 1 of 2</span>
                  <h2 className="text-xl font-bold text-[#2C1A12]">Student Credentials</h2>
                  <p className="text-xs text-stone-500">{ecosystem.college.name}</p>
                </div>
              </div>

              <form onSubmit={handleValidateStudentCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    1. CampusKart Student ID
                  </label>
                  <input
                    type="text"
                    value={credIdInput}
                    onChange={(e) => setCredIdInput(e.target.value)}
                    placeholder="e.g. CK-2026-101"
                    className="w-full px-4 py-3 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    2. Assigned Access Password
                  </label>
                  <input
                    type="password"
                    value={credPassInput}
                    onChange={(e) => setCredPassInput(e.target.value)}
                    placeholder="Enter access credential"
                    className="w-full px-4 py-3 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                {credError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{credError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Validate Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Account Selector */}
              <div className="mt-6 pt-4 border-t border-stone-200/80">
                <p className="text-[11px] text-stone-500 mb-2 font-medium">Evaluator Quick-Fill Demo Accounts:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCredIdInput('CK-2026-101'); setCredPassInput('PASS101'); setCredError(''); }}
                    className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 border border-stone-200/80 text-left text-[11px]"
                  >
                    <p className="font-bold text-[#2C1A12]">Aarav (Active)</p>
                    <p className="text-orange-700 font-mono">CK-2026-101</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCredIdInput('CK-2026-102'); setCredPassInput('PASS102'); setCredError(''); }}
                    className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 border border-stone-200/80 text-left text-[11px]"
                  >
                    <p className="font-bold text-[#2C1A12]">Diya (Active)</p>
                    <p className="text-sky-800 font-mono">CK-2026-102</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCredIdInput('CK-2026-103'); setCredPassInput('PASS103'); setCredError(''); }}
                    className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 border border-stone-200/80 text-left text-[11px]"
                  >
                    <p className="font-bold text-rose-700">Rohan (Inactive)</p>
                    <p className="text-stone-500 font-mono">CK-2026-103</p>
                  </button>
                </div>
              </div>
            </div>

  );
};

export default StudentCredentialsScreen;
