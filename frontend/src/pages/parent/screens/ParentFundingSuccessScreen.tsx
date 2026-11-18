import React from 'react';
import {
  Wallet, CheckCircle2
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentFundingSuccessScreen: React.FC = () => {
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

            const rec = lastFundingReceipt || {
              txnId: 'TXN-CK-90012',
              studentName: parentLinkedStudent.name,
              studentId: parentLinkedStudent.id,
              amount: fundAmount,
              method: fundingMethod,
              timestamp: '2026-11-16 14:00',
              previousBalance: parentLinkedStudent.walletBalance - Number(fundAmount),
              newBalance: parentLinkedStudent.walletBalance
            };
            return (
              <div className="max-w-xl mx-auto bg-white shadow-sm/95 border border-cyan-400/80 rounded-3xl p-8 text-center shadow-2xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-cyan-400/80 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#2C1A12]">Wallet Funded Successfully!</h2>
                <p className="text-xs text-stone-600">
                  The Student Application wallet balance has been updated immediately via shared state.
                </p>

                <div className="bg-[#F4EFEA] border border-stone-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Funding Transaction ID</span>
                    <span className="font-mono font-bold text-sky-800">{rec.txnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Student Name</span>
                    <span className="font-bold text-[#2C1A12]">{rec.studentName} ({rec.studentId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Method</span>
                    <span className="text-[#2C1A12]">{rec.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date & Time</span>
                    <span className="text-[#2C1A12]">{rec.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Previous Wallet Balance</span>
                    <span className="text-[#2C1A12]">₹{rec.previousBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Amount Added</span>
                    <span className="font-bold text-emerald-700">+₹{rec.amount}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200/80 flex justify-between text-sm font-extrabold text-[#2C1A12]">
                    <span>New Student Wallet Balance</span>
                    <span className="text-sky-800">₹{rec.newBalance}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setParentScreen('dashboard')}
                    className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                  >
                    Return to Parent Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setLoggedStudentId(parentLinkedStudent.id);
                      setStudentAuthed(true);
                      setStudentScreen('home');
                      setActivePortal('student');
                    }}
                    className="px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                  >
                    Verify in Student App →
                  </button>
                </div>
              </div>
            );

};

export default ParentFundingSuccessScreen;
