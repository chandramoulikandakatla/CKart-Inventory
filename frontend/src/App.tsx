import React, { useMemo } from 'react';
import { CampusKartProvider, useCampusKart } from './context/CampusKartContext';
import ShaderBackground from './components/common/ShaderBackground';
import ToastNotification from './components/common/ToastNotification';
import ReceiptModal from './components/common/ReceiptModal';
import EvaluatorModal from './components/common/EvaluatorModal';
import EvaluatorBar from './components/common/EvaluatorBar';

import StudentPortal from './pages/student/StudentPortal';
import ParentPortal from './pages/parent/ParentPortal';
import OpsPortal from './pages/ops/OpsPortal';
import CollegePortal from './pages/college/CollegePortal';

function AppContent() {
  const {
    activePortal,
    setActivePortal,
    toast,
    setToast,
    showToast,
    showDemoModal,
    setShowDemoModal,
    receiptModalOrder,
    setReceiptModalOrder,
    currentStudent,
    ecosystem,
    handleResetDemoData,
  } = useCampusKart();

  const pendingOpsOrdersCount = useMemo(() => {
    return ecosystem.orders.filter(
      (o: any) => o.status !== 'Completed' && o.status !== 'Cancelled'
    ).length;
  }, [ecosystem.orders]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1A12] font-sans relative selection:bg-orange-500 selection:text-white">
      <ShaderBackground theme={activePortal} />

      {/* Global Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Receipt Inspection Modal */}
      <ReceiptModal
        order={receiptModalOrder}
        onClose={() => setReceiptModalOrder(null)}
        onDownload={(orderId) => {
          showToast('Receipt Downloaded', `Saved ${orderId}.pdf statement.`, 'success');
          setReceiptModalOrder(null);
        }}
      />

      {/* Evaluator Guide & Credentials Modal */}
      <EvaluatorModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Top Ecosystem Switcher Bar */}
      <EvaluatorBar
        currentStudent={currentStudent}
        totalOrdersCount={ecosystem.orders.length}
        activePortal={activePortal}
        pendingOpsOrdersCount={pendingOpsOrdersCount}
        onSelectPortal={setActivePortal}
        onOpenDemoModal={() => setShowDemoModal(true)}
      />

      {/* Active Portal Views */}
      {activePortal === 'student' && <StudentPortal />}
      {activePortal === 'parent' && <ParentPortal />}
      {activePortal === 'ops' && <OpsPortal />}
      {activePortal === 'college' && <CollegePortal />}
    </div>
  );
}

export default function App() {
  return (
    <CampusKartProvider>
      <AppContent />
    </CampusKartProvider>
  );
}
