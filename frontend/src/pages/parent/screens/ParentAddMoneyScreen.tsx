import React from 'react';
import {
  Wallet
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentAddMoneyScreen: React.FC = () => {
  const {
    setParentScreen,
    fundAmount,
    setFundAmount,
    customFundInput,
    setCustomFundInput,
    parentLinkedStudent,
  } = useCampusKart();

  return (
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700">Phase 2 — Wallet Top-Up</span>
                <h2 className="text-2xl font-extrabold text-[#2C1A12] mt-1">Add Funds to Student Wallet</h2>
                <p className="text-xs text-stone-500">Linked Student: {parentLinkedStudent.name} ({parentLinkedStudent.id})</p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[250, 500, 1000, 2000].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setFundAmount(preset); setCustomFundInput(String(preset)); }}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      Number(fundAmount) === preset
                        ? 'bg-sky-600 border-emerald-400 text-white'
                        : 'bg-[#F4EFEA] border-stone-200/80 text-stone-600 hover:bg-[#F5F0EB]/90'
                    }`}
                  >
                    +₹{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setFundAmount(750); setCustomFundInput('750'); }}
                  className="py-3 rounded-xl text-xs font-bold border bg-[#F4EFEA] border-stone-200/80 text-sky-800"
                >
                  Custom
                </button>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1.5">Enter Funding Amount (₹)</label>
                <input
                  type="number"
                  min="50"
                  max="25000"
                  value={customFundInput}
                  onChange={(e) => {
                    setCustomFundInput(e.target.value);
                    setFundAmount(Math.max(0, Number(e.target.value) || 0));
                  }}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12] text-lg font-extrabold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="bg-[#F4EFEA] border border-stone-200/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Existing Student Wallet Balance</span>
                  <span className="font-bold text-[#2C1A12]">₹{parentLinkedStudent.walletBalance}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Amount Being Added</span>
                  <span className="font-bold text-emerald-700">+₹{fundAmount}</span>
                </div>
                <div className="pt-2 border-t border-stone-200/80 flex justify-between text-sm font-extrabold text-[#2C1A12]">
                  <span>New Projected Wallet Balance</span>
                  <span className="text-sky-800">₹{parentLinkedStudent.walletBalance + Number(fundAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => setParentScreen('funding_method')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-sm"
              >
                Continue to Payment →
              </button>
            </div>

  );
};

export default ParentAddMoneyScreen;
