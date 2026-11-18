import React from 'react';
import {
  Wallet, Download
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const CollegeReportsScreen: React.FC = () => {
  const {
    ecosystem, setEcosystem,
    activePortal, setActivePortal,
    toast, setToast, showToast,
    showDemoModal, setShowDemoModal,
    receiptModalOrder, setReceiptModalOrder,
    studentScreen, setStudentScreen,
    loggedStudentId, setLoggedStudentId,
    studentAuthed, setStudentAuthed,
    credIdInput, setCredIdInput,
    credPassInput, setCredPassInput,
    credError, setCredError,
    pendingStudent, setPendingStudent,
    pinInput, setPinInput,
    pinError, setPinError,
    pinMasked, setPinMasked,
    shopSearch, setShopSearch,
    shopCategory, setShopCategory,
    shopSort, setShopSort,
    selectedProductId, setSelectedProductId,
    detailQty, setDetailQty,
    recentlyViewed, setRecentlyViewed,
    cart, setCart,
    processedIdempotencyKeys, setProcessedIdempotencyKeys,
    activeIdempotencyKey, setActiveIdempotencyKey,
    backendConnected, setBackendConnected,
    fulfilmentType, setFulfilmentType,
    selectedCollectionPoint, setSelectedCollectionPoint,
    selectedPaymentMethod, setSelectedPaymentMethod,
    simulateFailureMode, setSimulateFailureMode,
    studentPayStep, setStudentPayStep,
    studentPayErrorReason, setStudentPayErrorReason,
    lastConfirmedOrder, setLastConfirmedOrder,
    orderFilter, setOrderFilter,
    trackingOrderId, setTrackingOrderId,
    parentScreen, setParentScreen,
    parentAuthed, setParentAuthed,
    parentLookupStudentId, setParentLookupStudentId,
    parentPinInput, setParentPinInput,
    parentAuthError, setParentAuthError,
    linkedStudentId, setLinkedStudentId,
    fundAmount, setFundAmount,
    customFundInput, setCustomFundInput,
    fundingMethod, setFundingMethod,
    parentPayStep, setParentPayStep,
    lastFundingReceipt, setLastFundingReceipt,
    parentTxnFilter, setParentTxnFilter,
    parentDateRange, setParentDateRange,
    opsScreen, setOpsScreen,
    opsOrderFilter, setOpsOrderFilter,
    newProductForm, setNewProductForm,
    editingProductId, setEditingProductId,
    manualAdjForm, setManualAdjForm,
    newStudentForm, setNewStudentForm,
    collegeScreen, setCollegeScreen,
    currentStudent, parentLinkedStudent,
    populatedCart, cartItemCount, cartSubtotal, platformFee, cartFinalPayable,
    studentOrders, studentTransactions, parentOrders, parentTransactions,
    parentControls, studentControls, studentMetrics, parentMetrics,
    studentTodaySpend, parentCategoryChartData, highestSpendCategory,
    parentMonthlyChartData, parentDailyTrendData,
    handleValidateStudentCredentials, handleVerifyStudentPin,
    handleOpenProductDetail, handleAddToCart, handleUpdateCartQty,
    handleRemoveFromCart, handleRequestParentTopUp, checkOrderBlockers,
    handleConfirmAndPay, handleParentLogin, handleConfirmParentFunding,
    handleSaveSpendingControls, handleOpsUpdateOrderStatus,
    handleOpsUpdateStock, handleOpsCreateProduct, handleOpsToggleStudentStatus,
    handleOpsCreateStudent, handleOpsManualAdjustment, handleResetDemoData,
  } = useCampusKart();

  return (
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Consolidated Institutional Reports & Invoices</h2>
                  <p className="text-xs text-stone-500">Aggregated monthly summaries reconciled directly with the shared transaction ledger</p>
                </div>
                <button
                  onClick={() => showToast('Consolidated Report Exported', 'Downloaded SCNA_Consolidated_Pilot_Report_Nov2026.pdf', 'success')}
                  className="px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#2C1A12] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export Consolidated Monthly Invoice
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                {[
                  {
                    id: 'INV-SCNA-2026-11',
                    title: 'November 2026 Consolidated Pilot Statement',
                    orders: ecosystem.orders.length,
                    volume: ecosystem.orders.reduce((a, b) => a + b.totalAmount, 0),
                    status: 'Live Reconciled'
                  },
                  {
                    id: 'RPT-USAGE-2026-11',
                    title: 'Aggregated Category & Kiosk Utilization Report',
                    orders: ecosystem.orders.length,
                    volume: ecosystem.transactions.filter(t => t.type === 'Wallet Funding').reduce((a, b) => a + b.amount, 0),
                    status: 'Verified'
                  },
                  {
                    id: 'RPT-SLA-2026-11',
                    title: 'Operational SLA & Break-Window Performance Audit',
                    orders: ecosystem.products.length,
                    volume: ecosystem.products.reduce((a, b) => a + b.stock, 0),
                    status: '99.1% SLA Met'
                  }
                ].map(rep => (
                  <div key={rep.id} className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80 space-y-2">
                    <span className="font-mono text-[#6F4E37] font-bold">{rep.id}</span>
                    <h3 className="text-sm font-bold text-[#2C1A12]">{rep.title}</h3>
                    <p className="text-stone-500">Reconciled Records: {rep.orders} · Metric Total: ₹{rep.volume}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-sky-800 text-[10px] font-bold">{rep.status}</span>
                      <button
                        onClick={() => showToast('Report Downloaded', `${rep.id}.pdf saved.`, 'success')}
                        className="text-[#4A2E1B] hover:underline font-semibold"
                      >
                        Download PDF →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

  );
};

export default CollegeReportsScreen;
