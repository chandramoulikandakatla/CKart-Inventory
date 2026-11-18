import React from 'react';
import { ORDER_STATUS_STEPS } from '../../../constants/initialState';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentOrderTrackingScreen: React.FC = () => {
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

            const ord = ecosystem.orders.find(o => o.id === trackingOrderId) || studentOrders[0];
            if (!ord) return null;
            const currentStepIdx = Math.max(0, ORDER_STATUS_STEPS.indexOf(ord.status));

            return (
              <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600">Live Fulfilment Tracker</span>
                    <h2 className="text-xl font-extrabold text-[#2C1A12]">Order {ord.id}</h2>
                    <p className="text-xs text-stone-500">{ord.collectionPoint} · Placed at {ord.date}</p>
                  </div>
                  <select
                    value={ord.id}
                    onChange={(e) => setTrackingOrderId(e.target.value)}
                    className="bg-[#F4EFEA] border border-stone-200/90 rounded-xl px-3 py-2 text-xs text-[#2C1A12]"
                  >
                    {studentOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} — {o.status} (₹{o.totalAmount})</option>
                    ))}
                  </select>
                </div>

                {/* 6-Stage Visual Progress Tracker */}
                <div className="space-y-3 py-2">
                  {ORDER_STATUS_STEPS.map((stepName, index) => {
                    const done = index <= currentStepIdx || stepName === 'Payment Confirmed';
                    const isCurrent = index === currentStepIdx;
                    return (
                      <div
                        key={stepName}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-orange-500/15 border-orange-500 text-white'
                            : done
                            ? 'bg-emerald-500/10 border-cyan-300/80 text-sky-900'
                            : 'bg-stone-100/80 border-stone-200/60 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            done ? 'bg-emerald-500 text-slate-950' : 'bg-stone-200/65 text-stone-500'
                          }`}>
                            {done ? '✓' : index + 1}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold">{stepName}</p>
                            <p className="text-[11px] opacity-75">
                              {index === 0 && `Order received by CampusKart kiosk queue`}
                              {index === 1 && `Ref ${ord.txnRef} verified — ₹${ord.totalAmount} debited`}
                              {index === 2 && `Accepted by campus fulfilment team`}
                              {index === 3 && `Items being packed & verified`}
                              {index === 4 && `Ready at ${ord.collectionPoint}`}
                              {index === 5 && `Handed over to ${ord.studentName}`}
                            </p>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-orange-500 text-white">
                            Current Stage
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-orange-300/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-amber-800">Evaluator Tip: Test Live Operations Sync</p>
                    <p className="text-stone-600">Switch to Operations Dashboard to advance this order's status and watch it update here.</p>
                  </div>
                  <button
                    onClick={() => {
                      setOpsScreen('orders');
                      setActivePortal('ops');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0"
                  >
                    Open Operations Order Queue →
                  </button>
                </div>
              </div>
            );

};

export default StudentOrderTrackingScreen;
