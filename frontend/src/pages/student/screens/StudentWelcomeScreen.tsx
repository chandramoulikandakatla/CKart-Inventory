import React from 'react';
import {
  ShoppingBag, Wallet, ArrowRight, Clock, HelpCircle, MapPin, Shield
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentWelcomeScreen: React.FC = () => {
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
            <div className="max-w-xl mx-auto my-8 bg-white/85 backdrop-blur-xl shadow-[0_10px_28px_-6px_rgba(44,26,18,0.06)] backdrop-blur-2xl border border-stone-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-56 h-56 bg-orange-600/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-pink-600/25 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 mx-auto flex items-center justify-center shadow-xl shadow-orange-500/25 mb-5">
                <ShoppingBag className="w-8 h-8 text-[#2C1A12]" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/12 text-orange-700 border border-orange-300/80 mb-3">
                <MapPin className="w-3.5 h-3.5" /> {ecosystem.college.name}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1A12] tracking-tight">
                Welcome to CampusKart
              </h1>
              <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                Your campus commerce and student wallet platform. Browse approved campus snacks, beverages, academic supplies, and daily essentials with zero cash friction.
              </p>

              <div className="grid grid-cols-3 gap-3 my-6 text-left">
                <div className="p-3 rounded-2xl bg-[#F5F0EB]/90 border border-stone-200/80">
                  <Wallet className="w-5 h-5 text-orange-600 mb-1.5" />
                  <p className="text-xs font-semibold text-[#2C1A12]">Pre-Funded Wallet</p>
                  <p className="text-[11px] text-stone-500">Instant parent top-ups, no bank PINs required.</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F5F0EB]/90 border border-stone-200/80">
                  <Clock className="w-5 h-5 text-sky-600 mb-1.5" />
                  <p className="text-xs font-semibold text-[#2C1A12]">Break Pickup</p>
                  <p className="text-[11px] text-stone-500">Skip long queues during lunch & dispersal.</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F5F0EB]/90 border border-stone-200/80">
                  <Shield className="w-5 h-5 text-orange-600 mb-1.5" />
                  <p className="text-xs font-semibold text-[#2C1A12]">Campus Verified</p>
                  <p className="text-[11px] text-stone-500">100% college-approved inventory & pricing.</p>
                </div>
              </div>

              <button
                onClick={() => setStudentScreen('credentials')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
                <span>Institution ID: <strong className="text-[#3D251A] font-mono">{ecosystem.college.code}</strong></span>
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Need Support / Demo IDs?
                </button>
              </div>
            </div>

  );
};

export default StudentWelcomeScreen;
