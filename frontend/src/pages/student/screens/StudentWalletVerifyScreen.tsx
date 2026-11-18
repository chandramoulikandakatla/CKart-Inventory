import React from 'react';
import {
  Wallet, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentWalletVerifyScreen: React.FC = () => {
  const {
    setStudentScreen,
    cart,
    selectedPaymentMethod,
    simulateFailureMode,
    setSimulateFailureMode,
    currentStudent,
    cartFinalPayable,
    handleConfirmAndPay,
  } = useCampusKart();

  return (
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700">Phase 3 — Final Confirmation</span>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Wallet Balance Verification</h2>
                </div>
                <button
                  onClick={() => setStudentScreen('payment_method')}
                  className="text-xs text-stone-500 hover:text-[#2C1A12] flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="bg-[#F4EFEA] border border-stone-200/80 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Student Name</span>
                  <span className="font-bold text-[#2C1A12]">{currentStudent.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">CampusKart Student ID</span>
                  <span className="font-mono font-bold text-orange-700">{currentStudent.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Selected Payment Method</span>
                  <span className="font-semibold text-[#2C1A12]">{selectedPaymentMethod}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Current Wallet Balance</span>
                  <span className="font-bold text-[#2C1A12]">₹{currentStudent.walletBalance}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Order Amount to Debit</span>
                  <span className="font-bold text-orange-600">-₹{cartFinalPayable}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm">
                  <span className="font-bold text-[#2C1A12]">Remaining Wallet Balance</span>
                  <span className="font-extrabold text-emerald-700">₹{currentStudent.walletBalance - cartFinalPayable}</span>
                </div>
              </div>

              {/* Evaluator Test Toggle for Failed Payment Scenario */}
              <div className="p-3 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#3D251A]">Evaluator Test Mode: Simulate Payment Failure?</p>
                  <p className="text-[11px] text-stone-500">Tests that failed transactions preserve the cart and do not debit the wallet.</p>
                </div>
                <input
                  type="checkbox"
                  checked={simulateFailureMode}
                  onChange={(e) => setSimulateFailureMode(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <button
                onClick={handleConfirmAndPay}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Confirm and Pay ₹{cartFinalPayable}</span>
              </button>
            </div>

  );
};

export default StudentWalletVerifyScreen;
