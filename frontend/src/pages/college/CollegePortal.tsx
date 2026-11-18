import React from 'react';
import { Building2 } from 'lucide-react';
import { useCampusKart } from '../../context/CampusKartContext';

import CollegeOverviewScreen from './screens/CollegeOverviewScreen';
import CollegeReportsScreen from './screens/CollegeReportsScreen';

export const CollegePortal: React.FC = () => {
  const { collegeScreen, setCollegeScreen, ecosystem } = useCampusKart();

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-[#8B5A3C]/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[#6F4E37]" />
          <div>
            <h2 className="text-base font-bold text-[#2C1A12]">{ecosystem.college.name} — Institutional Reporting Portal</h2>
            <p className="text-xs text-stone-500">
              Privacy-Preserving View: Displays aggregated campus metrics only. Zero administrative burden on college staff.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCollegeScreen('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
              collegeScreen === 'overview' ? 'bg-[#4A2E1B] text-white' : 'bg-[#F5F0EB]/90 text-stone-600'
            }`}
          >
            1. Aggregated Overview
          </button>
          <button
            onClick={() => setCollegeScreen('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
              collegeScreen === 'reports' ? 'bg-[#4A2E1B] text-white' : 'bg-[#F5F0EB]/90 text-stone-600'
            }`}
          >
            2. Consolidated Invoices & Reports
          </button>
        </div>
      </div>

      {/* Screen Routing */}
      {collegeScreen === 'overview' && <CollegeOverviewScreen />}
      {collegeScreen === 'reports' && <CollegeReportsScreen />}
    </main>
  );
};

export default CollegePortal;
