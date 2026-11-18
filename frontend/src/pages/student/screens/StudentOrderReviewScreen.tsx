import React from 'react';
import {
  Wallet, ArrowRight, ArrowLeft, Clock
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentOrderReviewScreen: React.FC = () => {
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
            <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600">Phase 3 — Checkout Step 1</span>
                  <h2 className="text-xl font-extrabold text-[#2C1A12]">Order Review & Fulfilment</h2>
                </div>
                <button
                  onClick={() => setStudentScreen('cart')}
                  className="text-xs text-stone-500 hover:text-[#2C1A12] flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Cart
                </button>
              </div>

              {/* Section 1: Order Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500">1. Selected Products</h3>
                <div className="bg-[#F5F0EB] border border-stone-200/80 rounded-2xl divide-y divide-stone-200/70">
                  {populatedCart.map(item => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#2C1A12]">{item.name}</p>
                        <p className="text-stone-500">Qty: {item.qty} × ₹{item.price}</p>
                      </div>
                      <span className="font-bold text-[#2C1A12]">₹{item.subtotal}</span>
                    </div>
                  ))}
                  <div className="p-3.5 flex items-center justify-between text-sm font-extrabold text-[#2C1A12] bg-orange-50/70">
                    <span>Total Order Value</span>
                    <span className="text-orange-700">₹{cartFinalPayable}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Fulfilment Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500">2. Campus Fulfilment Configuration</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Campus Kiosk Pickup', 'Hostel Delivery Counter'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFulfilmentType(method)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        fulfilmentType === method
                          ? 'bg-orange-500/15 border-orange-500 text-white'
                          : 'bg-[#F7F3EE] border-stone-200/80 text-stone-600'
                      }`}
                    >
                      <p className="text-xs font-bold">{method}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {method === 'Campus Kiosk Pickup' ? 'Instant QR/PIN collection during break' : 'Delivered to hostel gate dispensary'}
                      </p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-stone-600 mb-1.5">Designated Campus Collection Point:</label>
                  <select
                    value={selectedCollectionPoint}
                    onChange={(e) => setSelectedCollectionPoint(e.target.value)}
                    className="w-full bg-[#F4EFEA] border border-stone-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2C1A12]"
                  >
                    {ecosystem.college.collectionPoints.map(cp => (
                      <option key={cp} value={cp}>{cp}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/80 text-xs text-stone-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <span><strong>Ordering & Collection Window:</strong> {ecosystem.college.pilotWindow}</span>
                </div>
              </div>

              {/* Section 3: Payment Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500">3. Wallet & Payment Summary</h3>
                <div className="bg-[#F4EFEA] border border-orange-300/80 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Current CampusKart Wallet Balance</span>
                    <span className="font-bold text-[#2C1A12]">₹{currentStudent.walletBalance}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Total Payable Amount</span>
                    <span className="font-bold text-amber-800">₹{cartFinalPayable}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200/80 flex justify-between text-sm font-bold">
                    <span className="text-[#2C1A12]">Remaining Balance After Purchase</span>
                    <span className={currentStudent.walletBalance - cartFinalPayable >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      ₹{currentStudent.walletBalance - cartFinalPayable}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStudentScreen('payment_method')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

  );
};

export default StudentOrderReviewScreen;
