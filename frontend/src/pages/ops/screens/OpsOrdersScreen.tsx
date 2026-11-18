import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const OpsOrdersScreen: React.FC = () => {
  const {
    ecosystem,
    opsOrderFilter,
    setOpsOrderFilter,
    handleOpsUpdateOrderStatus,
  } = useCampusKart();

  return (
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Real-Time Order Fulfilment Queue</h2>
                  <p className="text-xs text-stone-500">
                    Updating any order status immediately propagates to Student Order Tracking & Parent Linked Orders
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Order Placed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed'].map(f => (
                    <button
                      key={f}
                      onClick={() => setOpsOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        opsOrderFilter === f ? 'bg-amber-500 text-slate-950' : 'bg-[#F5F0EB]/90 text-stone-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {ecosystem.orders
                  .filter(o => opsOrderFilter === 'All' || o.status === opsOrderFilter)
                  .map(ord => (
                    <div key={ord.id} className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-[#2C1A12] text-sm">{ord.id}</span>
                          <span className="text-orange-700 font-semibold">{ord.studentName} ({ord.studentId})</span>
                          <span className="text-stone-500">{ord.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700">₹{ord.totalAmount} ({ord.paymentStatus})</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 font-bold">
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <p className="text-[#3D251A] font-medium">
                            Items: {ord.items.map(i => `${i.qty}× ${i.name}`).join(' | ')}
                          </p>
                          <p className="text-stone-500 mt-0.5">
                            Fulfilment: {ord.fulfilmentMethod} — {ord.collectionPoint}
                          </p>
                        </div>

                        {/* One-Click Fulfilment Workflow Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {['Order Placed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed'].map(st => (
                            <button
                              key={st}
                              onClick={() => handleOpsUpdateOrderStatus(ord.id, st)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                ord.status === st
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-[#F5F0EB]/90 hover:bg-stone-200/80 text-stone-600'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

  );
};

export default OpsOrdersScreen;
