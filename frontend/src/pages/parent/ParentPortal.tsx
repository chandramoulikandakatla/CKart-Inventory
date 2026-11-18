import React from 'react';
import { useCampusKart } from '../../context/CampusKartContext';

import ParentWelcomeScreen from './screens/ParentWelcomeScreen';
import ParentLoginScreen from './screens/ParentLoginScreen';
import ParentDashboardScreen from './screens/ParentDashboardScreen';
import ParentAddMoneyScreen from './screens/ParentAddMoneyScreen';
import ParentFundingMethodScreen from './screens/ParentFundingMethodScreen';
import ParentFundingConfirmScreen from './screens/ParentFundingConfirmScreen';
import ParentFundingProcessingScreen from './screens/ParentFundingProcessingScreen';
import ParentFundingSuccessScreen from './screens/ParentFundingSuccessScreen';
import ParentTransactionsScreen from './screens/ParentTransactionsScreen';
import ParentAnalyticsScreen from './screens/ParentAnalyticsScreen';
import ParentControlsScreen from './screens/ParentControlsScreen';
import ParentOrdersScreen from './screens/ParentOrdersScreen';
import ParentNotificationsScreen from './screens/ParentNotificationsScreen';
import ParentStatementsScreen from './screens/ParentStatementsScreen';

export const ParentPortal: React.FC = () => {
  const {
    parentScreen,
    setParentScreen,
    parentAuthed,
    setParentAuthed,
    ecosystem,
    parentLinkedStudent,
    handleParentLogout,
    showToast,
  } = useCampusKart();

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Parent Top Navigation Bar */}
      <div className="mb-6 bg-white/85 backdrop-blur-xl shadow-[0_10px_28px_-6px_rgba(44,26,18,0.06)] border border-cyan-300/70 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-sky-800 border border-cyan-300/80">
            Parent FinTech Portal
          </span>
          {parentAuthed ? (
            [
              { id: 'dashboard', label: '3. Overview' },
              { id: 'add_money', label: '4. Add Money' },
              { id: 'transactions', label: '9. Transactions' },
              { id: 'analytics', label: '10. Spending Analytics' },
              { id: 'controls', label: '11. Spending Controls' },
              { id: 'orders', label: '12. Student Orders' },
              {
                id: 'notifications',
                label: `13. Alerts (${
                  ecosystem.notifications.filter(
                    (n: any) => n.studentId === parentLinkedStudent.id
                  ).length
                })`,
              },
              { id: 'statements', label: '14. Statements & Receipts' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setParentScreen(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  parentScreen === tab.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-stone-600 hover:bg-stone-200/65'
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            <span className="text-xs text-stone-500">Parent Authentication Flow (Screens 1–2)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {parentAuthed && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-mono text-sky-900 bg-sky-100/80 px-2.5 py-1 rounded-lg border border-sky-300/80">
                {parentLinkedStudent.parentName} ({parentLinkedStudent.firstName}'s Guardian)
              </span>
              <button
                type="button"
                onClick={handleParentLogout}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
              >
                Sign Out
              </button>
            </div>
          )}
          <select
            value={parentScreen}
            onChange={(e) => {
              const val = e.target.value;
              if (!parentAuthed && !['welcome', 'login'].includes(val)) {
                setParentScreen('login');
                showToast('Authentication Required', 'Please verify your Parent Access PIN to open guardian controls.', 'info');
                return;
              }
              setParentScreen(val);
            }}
            className="bg-[#F4EFEA] border border-cyan-300/80 rounded-xl px-2.5 py-1.5 text-xs text-[#3D251A]"
          >
            <option value="welcome">Screen 1 — Parent Portal Welcome</option>
            <option value="login">Screen 2 — Parent Login</option>
            <option value="dashboard">Screen 3 — Parent Dashboard Overview</option>
            <option value="add_money">Screen 4 — Add Money</option>
            <option value="funding_method">Screen 5 — Select Funding Method</option>
            <option value="funding_confirm">Screen 6 — Funding Confirmation</option>
            <option value="funding_processing">Screen 7 — Parent Payment Processing (5s)</option>
            <option value="funding_success">Screen 8 — Wallet Funding Success</option>
            <option value="transactions">Screen 9 — Transaction History</option>
            <option value="analytics">Screen 10 — Spending Analytics</option>
            <option value="controls">Screen 11 — Spending Controls</option>
            <option value="orders">Screen 12 — Linked Student Orders</option>
            <option value="notifications">Screen 13 — Parent Notifications</option>
            <option value="statements">Screen 14 — Monthly Statements & Receipts</option>
          </select>
        </div>
      </div>

      {/* Screen Routing */}
      {parentScreen === 'welcome' && <ParentWelcomeScreen />}
      {parentScreen === 'login' && <ParentLoginScreen />}
      {parentScreen === 'dashboard' && <ParentDashboardScreen />}
      {parentScreen === 'add_money' && <ParentAddMoneyScreen />}
      {parentScreen === 'funding_method' && <ParentFundingMethodScreen />}
      {parentScreen === 'funding_confirm' && <ParentFundingConfirmScreen />}
      {parentScreen === 'funding_processing' && <ParentFundingProcessingScreen />}
      {parentScreen === 'funding_success' && <ParentFundingSuccessScreen />}
      {parentScreen === 'transactions' && <ParentTransactionsScreen />}
      {parentScreen === 'analytics' && <ParentAnalyticsScreen />}
      {parentScreen === 'controls' && <ParentControlsScreen />}
      {parentScreen === 'orders' && <ParentOrdersScreen />}
      {parentScreen === 'notifications' && <ParentNotificationsScreen />}
      {parentScreen === 'statements' && <ParentStatementsScreen />}
    </main>
  );
};

export default ParentPortal;
