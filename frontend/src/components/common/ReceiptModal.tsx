import React from 'react';
import { Download } from 'lucide-react';

interface ReceiptModalProps {
  order: any | null;
  onClose: () => void;
  onDownload: (orderId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose, onDownload }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2C1A12]/45 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white shadow-sm border border-stone-200/90 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/15 text-orange-700">
              Official CampusKart Receipt
            </span>
            <h3 className="text-lg font-bold text-[#2C1A12] mt-1">{order.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-stone-600"
          >
            ✕
          </button>
        </div>
        <div className="py-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 bg-[#F5F0EB]/90 p-3 rounded-xl">
            <div>
              <span className="text-stone-500 block">Student</span>
              <span className="font-semibold text-[#2C1A12]">{order.studentName} ({order.studentId})</span>
            </div>
            <div>
              <span className="text-stone-500 block">Date & Time</span>
              <span className="font-semibold text-[#2C1A12]">{order.date}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Transaction Ref</span>
              <span className="font-mono text-orange-700">{order.txnRef}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Status</span>
              <span className="font-semibold text-emerald-700">{order.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-stone-500 font-medium uppercase tracking-wider text-[10px]">Purchased Items</p>
            {order.items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-stone-200/60">
                <div>
                  <p className="text-[#2C1A12] font-medium">{it.name}</p>
                  <p className="text-stone-500 text-[11px]">{it.qty} × ₹{it.price}</p>
                </div>
                <span className="font-semibold text-[#2C1A12]">₹{it.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="bg-cyan-50/80 border border-orange-200/90 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Previous Wallet Balance</span>
              <span>₹{order.previousBalance}</span>
            </div>
            <div className="flex justify-between text-[#2C1A12] font-bold text-sm">
              <span>Total Amount Debited</span>
              <span className="text-emerald-700">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Remaining Wallet Balance</span>
              <span>₹{order.remainingBalance}</span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 bg-[#F5F0EB]/90 p-2.5 rounded-xl">
            <p><strong className="text-[#3D251A]">Fulfilment:</strong> {order.fulfilmentMethod}</p>
            <p><strong className="text-[#3D251A]">Collection Point:</strong> {order.collectionPoint}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onDownload(order.id)}
            className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 text-[#2C1A12] font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
