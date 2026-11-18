import React from 'react';
import { CATEGORIES } from '../../../constants/initialState';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentControlsScreen: React.FC = () => {
  const {
    parentLinkedStudent,
    parentControls,
    handleSaveSpendingControls,
  } = useCampusKart();

  return (
            <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#2C1A12]">Guardian Spending Controls & Alerts</h2>
                <p className="text-xs text-stone-500">
                  Rules saved here are enforced immediately during {parentLinkedStudent.name}'s checkout in the Student App.
                </p>
              </div>

              <div className="space-y-4">
                {/* Daily Limit */}
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={parentControls.dailyLimitEnabled}
                        onChange={(e) => handleSaveSpendingControls({ ...parentControls, dailyLimitEnabled: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <span className="text-sm font-bold text-[#2C1A12]">Daily Spending Limit</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">Blocks student purchases exceeding this daily cap.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Max ₹ / Day:</span>
                    <input
                      type="number"
                      value={parentControls.dailyLimit}
                      onChange={(e) => handleSaveSpendingControls({ ...parentControls, dailyLimit: Math.max(50, Number(e.target.value) || 0) })}
                      className="w-28 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-stone-200/90 text-[#2C1A12] text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Weekly Limit */}
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={parentControls.weeklyLimitEnabled}
                        onChange={(e) => handleSaveSpendingControls({ ...parentControls, weeklyLimitEnabled: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <span className="text-sm font-bold text-[#2C1A12]">Weekly Spending Limit</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">Caps cumulative 7-day student wallet spend.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Max ₹ / Week:</span>
                    <input
                      type="number"
                      value={parentControls.weeklyLimit}
                      onChange={(e) => handleSaveSpendingControls({ ...parentControls, weeklyLimit: Math.max(100, Number(e.target.value) || 0) })}
                      className="w-28 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-stone-200/90 text-[#2C1A12] text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Monthly Limit */}
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={parentControls.monthlyLimitEnabled}
                        onChange={(e) => handleSaveSpendingControls({ ...parentControls, monthlyLimitEnabled: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <span className="text-sm font-bold text-[#2C1A12]">Monthly Allowance Limit</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">Enforces monthly budget discipline.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Max ₹ / Month:</span>
                    <input
                      type="number"
                      value={parentControls.monthlyLimit}
                      onChange={(e) => handleSaveSpendingControls({ ...parentControls, monthlyLimit: Math.max(200, Number(e.target.value) || 0) })}
                      className="w-28 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-stone-200/90 text-[#2C1A12] text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Category Restrictions */}
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 space-y-3">
                  <p className="text-sm font-bold text-[#2C1A12]">Category-Based Restrictions (Click to Block/Allow)</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.filter(c => c !== 'All').map(cat => {
                      const blocked = parentControls.restrictedCategories?.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const cur = parentControls.restrictedCategories || [];
                            const next = blocked ? cur.filter(x => x !== cat) : [...cur, cat];
                            handleSaveSpendingControls({ ...parentControls, restrictedCategories: next });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            blocked
                              ? 'bg-rose-500/20 border-rose-500 text-rose-700'
                              : 'bg-emerald-500/15 border-cyan-300/80 text-sky-800'
                          }`}
                        >
                          {blocked ? `✕ Blocked: ${cat}` : `✓ Allowed: ${cat}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notification Toggles */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <label className="p-3.5 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentControls.lowBalanceAlertEnabled}
                      onChange={(e) => handleSaveSpendingControls({ ...parentControls, lowBalanceAlertEnabled: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Low-Balance Alert (&lt;₹{parentControls.lowBalanceThreshold})</span>
                  </label>
                  <label className="p-3.5 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentControls.instantTxnNotification}
                      onChange={(e) => handleSaveSpendingControls({ ...parentControls, instantTxnNotification: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Instant Purchase Alerts</span>
                  </label>
                  <label className="p-3.5 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentControls.spendingAlertsEnabled}
                      onChange={(e) => handleSaveSpendingControls({ ...parentControls, spendingAlertsEnabled: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Limit Violation Alerts</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => handleSaveSpendingControls({ ...parentControls })}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm"
              >
                Save Spending Preferences
              </button>
            </div>

  );
};

export default ParentControlsScreen;
