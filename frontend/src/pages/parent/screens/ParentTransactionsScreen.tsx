import React from 'react';
import {
  Wallet
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentTransactionsScreen: React.FC = () => {
  const {
    ecosystem,
    setReceiptModalOrder,
    parentTxnFilter,
    setParentTxnFilter,
    parentDateRange,
    setParentDateRange,
    parentLinkedStudent,
    parentTransactions,
  } = useCampusKart();

  return (
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Parent Transaction Ledger</h2>
                  <p className="text-xs text-stone-500">Every funding credit, purchase debit, refund, and adjustment for {parentLinkedStudent.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Money Added', 'Purchases', 'Refunds'].map(f => (
                    <button
                      key={f}
                      onClick={() => setParentTxnFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        parentTxnFilter === f ? 'bg-sky-600 text-white' : 'bg-[#F5F0EB]/90 text-stone-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                  <select
                    value={parentDateRange}
                    onChange={(e) => setParentDateRange(e.target.value)}
                    className="bg-[#F4EFEA] border border-stone-200/90 rounded-xl px-3 py-1.5 text-xs text-[#2C1A12]"
                  >
                    <option value="All Time">Date: All Time</option>
                    <option value="Nov 2026">Date: Nov 2026</option>
                    <option value="Oct 2026">Date: Oct 2026</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-stone-500 border-b border-stone-200/80">
                      <th className="py-3 px-3">Transaction ID</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Description / Linked Order</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-right">Wallet Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70">
                    {parentTransactions
                      .filter(t => {
                        if (parentDateRange !== 'All Time' && t.month !== parentDateRange) return false;
                        if (parentTxnFilter === 'Money Added') return t.type === 'Wallet Funding';
                        if (parentTxnFilter === 'Purchases') return t.type === 'Student Purchase';
                        if (parentTxnFilter === 'Refunds') return t.type === 'Refund' || t.type === 'Adjustment';
                        return true;
                      })
                      .map(t => (
                        <tr key={t.id} className="hover:bg-[#F5F0EB]/90">
                          <td className="py-3 px-3 font-mono text-sky-800">{t.id}</td>
                          <td className="py-3 px-3 text-stone-600">{t.timestamp}</td>
                          <td className="py-3 px-3 font-semibold text-[#2C1A12]">{t.type}</td>
                          <td className="py-3 px-3 text-stone-600">
                            {t.note}
                            {t.relatedOrderId && (
                              <button
                                onClick={() => {
                                  const ord = ecosystem.orders.find(o => o.id === t.relatedOrderId);
                                  if (ord) setReceiptModalOrder(ord);
                                }}
                                className="ml-2 text-orange-600 hover:underline font-mono"
                              >
                                [{t.relatedOrderId}]
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-sky-800 text-[10px]">
                              {t.status}
                            </span>
                          </td>
                          <td className={`py-3 px-3 text-right font-bold ${t.amount > 0 ? 'text-emerald-700' : 'text-orange-600'}`}>
                            {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#2C1A12]">₹{t.newBalance}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

  );
};

export default ParentTransactionsScreen;
