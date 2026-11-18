import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentLoginScreen: React.FC = () => {
  const {
    parentLookupStudentId,
    setParentLookupStudentId,
    parentPinInput,
    setParentPinInput,
    parentAuthError,
    handleParentLogin,
  } = useCampusKart();

  return (
            <div className="max-w-md mx-auto my-8 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <h2 className="text-xl font-bold text-[#2C1A12]">Parent Account Verification</h2>
              <p className="text-xs text-stone-500">
                Enter your child's CampusKart ID and your dedicated Parent Access PIN (never shares the student's password).
              </p>

              <form onSubmit={handleParentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Linked Student CampusKart ID</label>
                  <input
                    type="text"
                    value={parentLookupStudentId}
                    onChange={(e) => setParentLookupStudentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Parent Verification PIN</label>
                  <input
                    type="password"
                    value={parentPinInput}
                    onChange={(e) => setParentPinInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-sm font-mono"
                  />
                </div>

                {parentAuthError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs">
                    {parentAuthError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm"
                >
                  Secure Parent Login
                </button>
              </form>

              <div className="pt-3 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => { setParentLookupStudentId('CK-2026-101'); setParentPinInput('9999'); }}
                  className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-left"
                >
                  <p className="font-bold text-[#2C1A12]">Rajesh (Aarav's Parent)</p>
                  <p className="text-emerald-700 font-mono text-[11px]">ID: CK-2026-101 | PIN: 9999</p>
                </button>
                <button
                  onClick={() => { setParentLookupStudentId('CK-2026-102'); setParentPinInput('8888'); }}
                  className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-left"
                >
                  <p className="font-bold text-[#2C1A12]">Lakshmi (Diya's Parent)</p>
                  <p className="text-emerald-700 font-mono text-[11px]">ID: CK-2026-102 | PIN: 8888</p>
                </button>
              </div>
            </div>

  );
};

export default ParentLoginScreen;
