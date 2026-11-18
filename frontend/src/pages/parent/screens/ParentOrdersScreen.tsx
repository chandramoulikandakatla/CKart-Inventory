import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentOrdersScreen: React.FC = () => {
  const {
    setReceiptModalOrder,
    parentLinkedStudent,
    parentOrders,
  } = useCampusKart();

  return (
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#2C1A12]">Linked Student Order History ({parentLinkedStudent.name})</h2>
                <p className="text-xs text-stone-500">Inspect item-level receipts and live fulfilment statuses</p>
              </div>
              <div className="space-y-3">
                {parentOrders.map(ord => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#2C1A12] text-sm">{ord.id}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-sky-800 font-semibold">{ord.status}</span>
                        <span className="text-stone-500">{ord.date}</span>
                      </div>
                      <p className="text-[#3D251A] mt-1">
                        {ord.items.map(i => `${i.qty}× ${i.name}`).join(', ')}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Payment: {ord.paymentStatus} (Ref: {ord.txnRef}) · Point: {ord.collectionPoint}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-[#2C1A12]">₹{ord.totalAmount}</span>
                      <button
                        onClick={() => setReceiptModalOrder(ord)}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                      >
                        Inspect Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

  );
};

export default ParentOrdersScreen;
