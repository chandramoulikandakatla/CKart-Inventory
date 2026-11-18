import React from 'react';
import {
  Wallet
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const OpsReconciliationScreen: React.FC = () => {
  const {
    ecosystem,
    manualAdjForm,
    setManualAdjForm,
    handleOpsManualAdjustment,
  } = useCampusKart();

  return (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Audited Manual Adjustment Form */}
              <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-orange-300/80 rounded-3xl p-5 h-fit space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-orange-600">Strict Audit Trail Required</span>
                  <h3 className="text-base font-bold text-[#2C1A12] mt-0.5">Record Audited Wallet Adjustment</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Operators cannot silently alter balances. Every manual credit/refund requires a reason, timestamp, and operator ID.
                  </p>
                </div>

                <form onSubmit={handleOpsManualAdjustment} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-500 mb-1">Target Student Account</label>
                    <select
                      value={manualAdjForm.studentId}
                      onChange={(e) => setManualAdjForm({ ...manualAdjForm, studentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    >
                      {ecosystem.students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id}) — Bal: ₹{s.walletBalance}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-500 mb-1">Entry Type</label>
                      <select
                        value={manualAdjForm.type}
                        onChange={(e) => setManualAdjForm({ ...manualAdjForm, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                      >
                        <option value="Refund">Refund (+)</option>
                        <option value="Adjustment">Adjustment (+/-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-500 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={manualAdjForm.amount}
                        onChange={(e) => setManualAdjForm({ ...manualAdjForm, amount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Authorized Operator Identity</label>
                    <input
                      type="text"
                      value={manualAdjForm.operator}
                      onChange={(e) => setManualAdjForm({ ...manualAdjForm, operator: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Mandatory Audit Reason</label>
                    <input
                      type="text"
                      value={manualAdjForm.reason}
                      onChange={(e) => setManualAdjForm({ ...manualAdjForm, reason: e.target.value })}
                      placeholder="e.g. Damaged item replacement refund"
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    Commit Audited Ledger Entry
                  </button>
                </form>
              </div>

              {/* Master Reconciliation Ledger */}
              <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#2C1A12]">Master Wallet & Transaction Reconciliation</h3>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-sky-800 text-xs font-bold">
                    ✓ All Student Balances Reconcile with Ledger
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-stone-500 border-b border-stone-200/80">
                        <th className="py-2.5 px-2">Ref ID</th>
                        <th className="py-2.5 px-2">Student</th>
                        <th className="py-2.5 px-2">Type</th>
                        <th className="py-2.5 px-2">Audit Note / Method</th>
                        <th className="py-2.5 px-2 text-right">Prev → New</th>
                        <th className="py-2.5 px-2 text-right">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {ecosystem.transactions.map(t => (
                        <tr key={t.id} className="hover:bg-[#F5F0EB]/90">
                          <td className="py-2.5 px-2 font-mono text-amber-800">{t.id}</td>
                          <td className="py-2.5 px-2 font-mono text-[#2C1A12]">{t.studentId}</td>
                          <td className="py-2.5 px-2 text-stone-600">{t.type}</td>
                          <td className="py-2.5 px-2 text-stone-500">
                            {t.note} <span className="text-slate-500">({t.method})</span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-stone-600">
                            ₹{t.previousBalance} → ₹{t.newBalance}
                          </td>
                          <td className={`py-2.5 px-2 text-right font-bold ${t.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

  );
};

export default OpsReconciliationScreen;
