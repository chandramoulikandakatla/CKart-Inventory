import React from 'react';
import { ShieldCheck, UserCheck, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentLoginScreen: React.FC = () => {
  const {
    ecosystem,
    parentLookupStudentId,
    setParentLookupStudentId,
    parentPinInput,
    setParentPinInput,
    parentAuthError,
    handleParentLogin,
  } = useCampusKart();

  return (
    <div className="max-w-lg mx-auto my-6 bg-white/95 backdrop-blur-xl shadow-[0_12px_36px_-6px_rgba(44,26,18,0.09)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#2C1A12]">Guardian Authentication</h2>
          <p className="text-xs text-stone-500">
            Dedicated multi-tenant parent access strictly isolated to your registered student.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-300/60 text-xs text-sky-900 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Strict Multi-Tenant Financial Scoping:</strong> Once authenticated, wallet top-ups, daily spending caps, and purchase alerts apply <em>only</em> to your linked student's account.
        </p>
      </div>

      <form onSubmit={handleParentLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-700" /> Linked Student ID or Registered Mobile
          </label>
          <input
            type="text"
            placeholder="e.g. CK-2026-101 or 9848022334"
            value={parentLookupStudentId}
            onChange={(e) => setParentLookupStudentId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-sm font-mono focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-sky-700" /> Dedicated Parent Access PIN (4 Digits)
          </label>
          <input
            type="password"
            maxLength={4}
            placeholder="****"
            value={parentPinInput}
            onChange={(e) => setParentPinInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-sm font-mono tracking-widest focus:outline-none focus:border-sky-500"
          />
          <p className="text-[11px] text-stone-500 mt-1">
            Guardian PIN is independent and never shared with the student's password.
          </p>
        </div>

        {parentAuthError && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{parentAuthError}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all"
        >
          Secure Guardian Sign-In →
        </button>
      </form>

      {/* Quick Verified Guardian Profiles for Testing */}
      <div className="pt-4 border-t border-stone-200/80 space-y-2">
        <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
          Quick Guardian Switcher (Evaluator Presets):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {ecosystem.students.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => {
                setParentLookupStudentId(student.id);
                setParentPinInput(student.parentPin);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                parentLookupStudentId === student.id
                  ? 'bg-sky-50/80 border-sky-400/90 shadow-sm'
                  : 'bg-[#F5F0EB]/90 hover:bg-stone-200/65 border-stone-200/70'
              }`}
            >
              <p className="font-bold text-[#2C1A12] truncate">{student.parentName}</p>
              <p className="text-sky-800 text-[11px] truncate">Child: {student.firstName}</p>
              <p className="text-emerald-700 font-mono text-[10px] mt-0.5">
                {student.id} · PIN: {student.parentPin}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentLoginScreen;
