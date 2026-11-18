import React from 'react';
import {
  Wallet, ShieldCheck
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentFundingProcessingScreen: React.FC = () => {
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
            <div className="max-w-lg mx-auto my-10 bg-white shadow-sm/95 border border-cyan-300/80 rounded-3xl p-8 text-center shadow-2xl space-y-6">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-sky-800">
                Simulated Parent Funding Sequence — No Real Money Collected
              </span>
              <div className="w-20 h-20 rounded-full border-4 border-cyan-300/80 border-t-emerald-400 animate-spin mx-auto flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-sky-800" />
              </div>
              <h2 className="text-xl font-extrabold text-[#2C1A12]">
                {parentPayStep === 1 && '0–1s: Initiating Simulated Funding...'}
                {parentPayStep === 2 && `1–3s: Verifying ${fundingMethod} & Authorizing...`}
                {parentPayStep === 3 && '3–5s: Crediting Student Wallet & Generating Ledger Entry...'}
              </h2>
              <div className="text-left bg-[#F4EFEA] p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                <p className={parentPayStep >= 1 ? 'text-sky-800 font-semibold' : 'text-slate-500'}>
                  ✓ 0–1s: Initiating ₹{fundAmount} top-up request
                </p>
                <p className={parentPayStep >= 2 ? 'text-sky-800 font-semibold' : 'text-slate-500'}>
                  ✓ 1–3s: Simulated {fundingMethod} authorization verified
                </p>
                <p className={parentPayStep >= 3 ? 'text-sky-800 font-semibold' : 'text-slate-500'}>
                  ✓ 3–5s: Updating {parentLinkedStudent.name}'s wallet in shared ecosystem state
                </p>
              </div>
            </div>

  );
};

export default ParentFundingProcessingScreen;
