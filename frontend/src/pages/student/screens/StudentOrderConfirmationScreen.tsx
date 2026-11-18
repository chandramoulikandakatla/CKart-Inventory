import React from 'react';
import {
  Wallet, CheckCircle2, Truck, FileText
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentOrderConfirmationScreen: React.FC = () => {
  const {
    setReceiptModalOrder,
    setStudentScreen,
    lastConfirmedOrder,
    setTrackingOrderId,
    studentOrders,
  } = useCampusKart();

            const ord = lastConfirmedOrder || studentOrders[0];
            if (!ord) return null;
            return (
              <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-cyan-400/80 text-emerald-700 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-sky-800">
                    Simulated Wallet Debit Complete
                  </span>
                  <h1 className="text-2xl font-extrabold text-[#2C1A12]">Order Confirmed!</h1>
                  <p className="text-xs text-stone-600">
                    Your order has been dispatched to the CampusKart Operations Dashboard and your Parent Portal has been updated.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 bg-[#F5F0EB] p-4 rounded-2xl border border-stone-200/80 text-xs">
                  <div>
                    <span className="text-stone-500 block">Order ID</span>
                    <span className="font-mono font-bold text-[#2C1A12] text-sm">{ord.id}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Transaction Reference</span>
                    <span className="font-mono font-bold text-orange-700">{ord.txnRef}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Student Name & ID</span>
                    <span className="font-semibold text-[#2C1A12]">{ord.studentName} ({ord.studentId})</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Order Date & Time</span>
                    <span className="font-semibold text-[#2C1A12]">{ord.date}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Fulfilment Method</span>
                    <span className="font-semibold text-sky-800">{ord.fulfilmentMethod}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Collection Point & Window</span>
                    <span className="font-semibold text-[#2C1A12]">{ord.collectionPoint} ({ord.estimatedTime})</span>
                  </div>
                </div>

                {/* Purchased Items */}
                <div className="bg-[#F7F3EE] border border-stone-200/80 rounded-2xl p-4 space-y-2 text-xs">
                  <p className="font-mono uppercase text-[10px] text-stone-500">Purchased Products</p>
                  {ord.items.map((it, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-stone-200/60">
                      <span className="text-[#2C1A12]">{it.qty}× {it.name}</span>
                      <span className="font-bold text-[#2C1A12]">₹{it.subtotal}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between text-stone-600">
                    <span>Previous Wallet Balance</span>
                    <span>₹{ord.previousBalance}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#2C1A12]">
                    <span>Total Amount Paid</span>
                    <span className="text-emerald-700">₹{ord.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Remaining Wallet Balance</span>
                    <span className="font-bold text-orange-700">₹{ord.remainingBalance}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setTrackingOrderId(ord.id);
                      setStudentScreen('order_tracking');
                    }}
                    className="py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" /> Track My Order
                  </button>
                  <button
                    onClick={() => setReceiptModalOrder(ord)}
                    className="py-3 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 text-[#2C1A12] font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" /> View Receipt
                  </button>
                  <button
                    onClick={() => setStudentScreen('home')}
                    className="py-3 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-[#3D251A] font-semibold text-xs"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            );

};

export default StudentOrderConfirmationScreen;
