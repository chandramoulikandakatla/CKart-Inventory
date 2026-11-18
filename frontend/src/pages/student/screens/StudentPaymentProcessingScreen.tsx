import React from 'react';
import {
  Wallet, CheckCircle2, XCircle
} from 'lucide-react';
import {
  Bar
} from 'recharts';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentPaymentProcessingScreen: React.FC = () => {
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
            <div className="max-w-lg mx-auto my-10 bg-white shadow-sm/95 border border-stone-200/90 rounded-3xl p-8 text-center shadow-2xl space-y-6">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 border border-orange-300/80">
                Simulated Prototype Payment Engine — No Real Bank Transfer
              </span>

              {studentPayStep !== 4 ? (
                <>
                  <div className="w-20 h-20 rounded-full border-4 border-orange-300/80 border-t-indigo-400 animate-spin mx-auto flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-orange-700 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-[#2C1A12]">
                      {studentPayStep === 1 && '0–1s: Payment Initiated...'}
                      {studentPayStep === 2 && '1–3s: Verifying Wallet & Authorizing Debit...'}
                      {studentPayStep === 3 && '3–5s: Generating Ledger Reference & Finalizing Order...'}
                    </h2>
                    <p className="text-xs text-stone-500">
                      Please wait while the 5-second demonstration payment sequence completes.
                    </p>
                  </div>

                  {/* Step Progress Bar */}
                  <div className="space-y-2.5 text-left bg-[#F4EFEA] p-4 rounded-2xl border border-stone-200/80 text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 ${studentPayStep >= 1 ? 'text-emerald-700' : 'text-slate-600'}`} />
                      <span className={studentPayStep >= 1 ? 'text-white font-medium' : 'text-slate-500'}>
                        Step 1 (0–1s): Initiate CampusKart Wallet transaction
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 ${studentPayStep >= 2 ? 'text-emerald-700' : 'text-slate-600'}`} />
                      <span className={studentPayStep >= 2 ? 'text-white font-medium' : 'text-slate-500'}>
                        Step 2 (1–3s): Validate ₹{cartFinalPayable} against balance & spending limits
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 ${studentPayStep >= 3 ? 'text-emerald-700' : 'text-slate-600'}`} />
                      <span className={studentPayStep >= 3 ? 'text-white font-medium' : 'text-slate-500'}>
                        Step 3 (3–5s): Commit ledger debit & dispatch order to Operations
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-600 mx-auto flex items-center justify-center">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Simulated Transaction Failed</h2>
                  <p className="text-xs text-rose-700 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/25">
                    {studentPayErrorReason}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSimulateFailureMode(false);
                        setStudentScreen('wallet_verify');
                      }}
                      className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                    >
                      Retry Payment (Normal Mode)
                    </button>
                    <button
                      onClick={() => setStudentScreen('cart')}
                      className="px-4 py-3 rounded-xl bg-stone-200/65 text-[#2C1A12] text-xs font-semibold"
                    >
                      Return to Preserved Cart
                    </button>
                  </div>
                </div>
              )}
            </div>

  );
};

export default StudentPaymentProcessingScreen;
