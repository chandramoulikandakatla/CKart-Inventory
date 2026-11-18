import React from 'react';
import {
  Wallet, CreditCard, Smartphone, Landmark
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentFundingMethodScreen: React.FC = () => {
  const {
    setParentScreen,
    fundingMethod,
    setFundingMethod,
  } = useCampusKart();

  return (
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#2C1A12]">Select Parent Funding Method</h2>
                <button onClick={() => setParentScreen('add_money')} className="text-xs text-stone-500 hover:text-[#2C1A12]">
                  ← Back
                </button>
              </div>
              <p className="text-xs text-stone-500">
                Simulated prototype payment options — no real bank credentials or card numbers are collected.
              </p>

              <div className="space-y-3">
                {[
                  { id: 'UPI', desc: 'Instant UPI AutoPay / QR Verification (Zero Fee)', icon: Smartphone },
                  { id: 'Debit Card', desc: 'RuPay / Visa / Mastercard Domestic Debit Card', icon: CreditCard },
                  { id: 'Credit Card', desc: 'Instant Campus Wallet Reload via Credit Card', icon: CreditCard },
                  { id: 'Net Banking', desc: 'Direct Institutional NEFT / IMPS Portal', icon: Landmark }
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setFundingMethod(m.id)}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        fundingMethod === m.id
                          ? 'bg-cyan-500/15 border-sky-500 text-white'
                          : 'bg-[#F7F3EE] border-stone-200/80 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-emerald-700" />
                        <div>
                          <p className="text-sm font-bold">{m.id}</p>
                          <p className="text-xs text-stone-500">{m.desc}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border ${fundingMethod === m.id ? 'bg-emerald-400 border-emerald-400' : 'border-slate-500'}`} />
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setParentScreen('funding_confirm')}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm"
              >
                Review Funding Confirmation →
              </button>
            </div>

  );
};

export default ParentFundingMethodScreen;
