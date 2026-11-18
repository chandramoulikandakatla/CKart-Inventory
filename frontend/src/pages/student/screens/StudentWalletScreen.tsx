import React from 'react';
import {
  Wallet
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentWalletScreen: React.FC = () => {
  const {
    currentStudent,
    studentTransactions,
    studentMetrics,
    handleRequestParentTopUp,
  } = useCampusKart();

  return (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-100/85 to-cyan-50/80 border border-orange-400/70 rounded-2xl p-5">
                  <span className="text-xs text-[#4A2E1B]">Current Reconciled Balance</span>
                  <p className="text-3xl font-black text-[#2C1A12] mt-1">₹{currentStudent.walletBalance.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-stone-600 mt-1">Student cannot independently create funds</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <span className="text-xs text-stone-500">Total Funds Received (Parent + Refunds)</span>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    +₹{(studentMetrics.totalAdded + studentMetrics.totalRefunds).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">Funded by {currentStudent.parentName}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <span className="text-xs text-stone-500">Total Campus Expenditure</span>
                  <p className="text-2xl font-extrabold text-rose-600 mt-1">
                    -₹{studentMetrics.totalSpent.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">Across {studentMetrics.purchaseCount} verified orders</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#2C1A12]">Complete Student Wallet Ledger</h3>
                  <button
                    onClick={handleRequestParentTopUp}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
                  >
                    Request Parent Top-Up
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-stone-500 border-b border-stone-200/80">
                        <th className="py-2.5 px-3">Ref ID</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Details / Linked Order</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {studentTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-[#F5F0EB]/90">
                          <td className="py-3 px-3 font-mono text-orange-700">{t.id}</td>
                          <td className="py-3 px-3 text-stone-600">{t.timestamp}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              t.amount > 0 ? 'bg-emerald-500/20 text-sky-800' : 'bg-rose-500/20 text-rose-700'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-stone-600">
                            {t.note} {t.relatedOrderId && <span className="font-mono text-orange-600">({t.relatedOrderId})</span>}
                          </td>
                          <td className={`py-3 px-3 text-right font-bold ${t.amount > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#3D251A]">₹{t.newBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

  );
};

export default StudentWalletScreen;
