import React from 'react';
import {
  Wallet, Download, Printer
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentStatementsScreen: React.FC = () => {
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
            <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Monthly Wallet Statements & Reconciled Summary</h2>
                  <p className="text-xs text-stone-500">Account: {parentLinkedStudent.name} ({parentLinkedStudent.id}) — November 2026</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => showToast('Statement Downloaded', `CampusKart_Statement_${parentLinkedStudent.id}_Nov2026.pdf downloaded.`, 'success')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download PDF Statement
                  </button>
                  <button
                    onClick={() => showToast('Print Job Prepared', 'Formatted monthly statement ready for printing.', 'info')}
                    className="px-4 py-2 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 text-[#2C1A12] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print Statement
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80">
                  <span className="text-stone-500">Total Credits (Funding)</span>
                  <p className="text-lg font-extrabold text-emerald-700 mt-1">+₹{parentMetrics.totalAdded}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80">
                  <span className="text-stone-500">Total Debits (Purchases)</span>
                  <p className="text-lg font-extrabold text-orange-600 mt-1">-₹{parentMetrics.totalSpent}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80">
                  <span className="text-stone-500">Refunds & Adjustments</span>
                  <p className="text-lg font-extrabold text-cyan-700 mt-1">+₹{parentMetrics.totalRefunds}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80">
                  <span className="text-stone-500">Closing Reconciled Balance</span>
                  <p className="text-lg font-extrabold text-[#2C1A12] mt-1">₹{parentLinkedStudent.walletBalance}</p>
                </div>
              </div>

              <div className="bg-[#F4EFEA] border border-stone-200/80 rounded-2xl p-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">Category-Wise Statement Breakdown</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  {parentCategoryChartData.map(c => (
                    <div key={c.name} className="p-3 rounded-xl bg-[#F5F0EB]/90 flex justify-between">
                      <span className="text-stone-600">{c.name}</span>
                      <span className="font-bold text-[#2C1A12]">₹{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

  );
};

export default ParentStatementsScreen;
