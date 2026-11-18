import React from 'react';
import { useCampusKart } from '../../context/CampusKartContext';

import OpsOverviewScreen from './screens/OpsOverviewScreen';
import OpsOrdersScreen from './screens/OpsOrdersScreen';
import OpsInventoryScreen from './screens/OpsInventoryScreen';
import OpsStudentsScreen from './screens/OpsStudentsScreen';
import OpsReconciliationScreen from './screens/OpsReconciliationScreen';

export const OpsPortal: React.FC = () => {
  const { opsScreen, setOpsScreen, ecosystem } = useCampusKart();

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Operations Navigation */}
      <div className="mb-6 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-orange-300/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-800 border border-orange-300/80">
            Operations Control Center
          </span>
          {[
            { id: 'overview', label: '1. Operations Overview' },
            { id: 'orders', label: `2. Order Management (${ecosystem.orders.length})` },
            { id: 'inventory', label: `3. Inventory Management (${ecosystem.products.length})` },
            { id: 'students', label: `4. Student Management (${ecosystem.students.length})` },
            { id: 'reconciliation', label: '5. Wallet & Ledger Reconciliation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setOpsScreen(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                opsScreen === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-stone-600 hover:bg-stone-200/65'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Routing */}
      {opsScreen === 'overview' && <OpsOverviewScreen />}
      {opsScreen === 'orders' && <OpsOrdersScreen />}
      {opsScreen === 'inventory' && <OpsInventoryScreen />}
      {opsScreen === 'students' && <OpsStudentsScreen />}
      {opsScreen === 'reconciliation' && <OpsReconciliationScreen />}
    </main>
  );
};

export default OpsPortal;
