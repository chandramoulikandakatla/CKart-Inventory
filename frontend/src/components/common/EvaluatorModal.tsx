import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface EvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
}

export const EvaluatorModal: React.FC<EvaluatorModalProps> = ({
  isOpen,
  onClose,
  onResetDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2C1A12]/45 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white shadow-sm border border-stone-200/90 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-bold text-[#2C1A12]">
                Institutional Evaluation — Demo Credentials & Scenarios
              </h3>
              <p className="text-xs text-stone-500">
                All 4 applications share a live, synchronized ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-stone-600"
          >
            ✕
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 my-4 text-xs">
          <div className="p-4 rounded-2xl bg-orange-50/90 border border-orange-300/70 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-700">
              Student Account #1 (Active)
            </span>
            <p className="text-sm font-bold text-[#2C1A12]">Aarav Sharma (2nd Year MPC)</p>
            <p className="text-stone-600">
              Student ID: <code className="text-orange-700 font-mono">CK-2026-101</code>
            </p>
            <p className="text-stone-600">
              Password: <code className="text-orange-700 font-mono">PASS101</code>
            </p>
            <p className="text-stone-600">
              CampusKart PIN: <code className="text-orange-700 font-mono">1234</code>
            </p>
            <p className="text-sky-800 font-medium">
              Parent PIN (Rajesh Sharma): <code className="font-mono">9999</code>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-cyan-300/70 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-800">
              Student Account #2 (Active)
            </span>
            <p className="text-sm font-bold text-[#2C1A12]">Diya Reddy (1st Year BiPC)</p>
            <p className="text-stone-600">
              Student ID: <code className="text-sky-800 font-mono">CK-2026-102</code>
            </p>
            <p className="text-stone-600">
              Password: <code className="text-sky-800 font-mono">PASS102</code>
            </p>
            <p className="text-stone-600">
              CampusKart PIN: <code className="text-sky-800 font-mono">5678</code>
            </p>
            <p className="text-sky-800 font-medium">
              Parent PIN (Lakshmi Reddy): <code className="font-mono">8888</code>
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-stone-600 bg-[#F5F0EB]/90 p-4 rounded-2xl border border-stone-200/80">
          <p className="font-semibold text-[#2C1A12]">Mandatory Shared-State Evaluation Checklist:</p>
          <p>
            1. <strong>Scenario A (Student Purchase):</strong> Log in as Aarav, add items, complete the
            5-second wallet payment, and watch the balance debit and order propagate to Parent & Operations.
          </p>
          <p>
            2. <strong>Scenario B (Parent Top-Up):</strong> Switch to the <strong>Parent Portal</strong>,
            add ₹500 or ₹1,000 via simulated UPI/Card (5-sec flow), and see the Student Wallet balance
            update immediately.
          </p>
          <p>
            3. <strong>Scenario C (Order Fulfilment):</strong> Switch to{' '}
            <strong>Operations Dashboard</strong> → Order Management, advance an order status to
            Ready/Completed, and inspect the live progress tracker in the Student App.
          </p>
          <p>
            4. <strong>Scenario D (Spending Limit):</strong> In{' '}
            <strong>Parent Portal → Spending Controls</strong>, lower the Daily Limit to ₹100 or
            restrict a category, then try purchasing in the Student App to verify instant enforcement.
          </p>
        </div>

        <div className="flex justify-between items-center mt-5 pt-3 border-t border-stone-200/80">
          <button
            onClick={() => {
              onResetDemoData();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Seeded Demo Data
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
          >
            Continue Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorModal;
