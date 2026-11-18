import React from 'react';
import {
  Wallet, ShieldCheck, ArrowRight, ArrowLeft, AlertTriangle, CreditCard
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentPaymentMethodScreen: React.FC = () => {
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

            const sufficient = currentStudent.walletBalance >= cartFinalPayable;
            const shortfall = Math.max(0, cartFinalPayable - currentStudent.walletBalance);
            return (
              <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600">Phase 3 — Checkout Step 2</span>
                    <h2 className="text-xl font-extrabold text-[#2C1A12]">Select Payment Method</h2>
                  </div>
                  <button
                    onClick={() => setStudentScreen('order_review')}
                    className="text-xs text-stone-500 hover:text-[#2C1A12] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200/90 text-xs text-[#4A2E1B] flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>Students are never asked for parent bank passwords, UPI PINs, or card numbers.</span>
                </div>

                {/* Payment Method Cards */}
                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedPaymentMethod('CampusKart Wallet')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === 'CampusKart Wallet'
                        ? 'bg-orange-500/15 border-orange-500'
                        : 'bg-[#F7F3EE] border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-600 text-white">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#2C1A12]">CampusKart Student Wallet (Default)</p>
                          <p className="text-xs text-stone-500">Instant zero-PIN deduction from parent-funded balance</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-sky-800">
                        Active Pilot Default
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200/60 bg-stone-100/60 opacity-60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#F5F0EB]/90 text-stone-500">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-600">External UPI / Direct Bank Cards</p>
                        <p className="text-xs text-slate-500">Disabled for student kiosk pilot — Parent Portal only</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Parent Only</span>
                  </div>
                </div>

                {/* Wallet Balance Breakdown Table */}
                <div className="bg-[#F4EFEA] border border-stone-200/90 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F5F0EB]/90 text-stone-500 border-b border-stone-200/80">
                        <th className="text-left py-2.5 px-4 font-semibold">Description</th>
                        <th className="text-right py-2.5 px-4 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      <tr>
                        <td className="py-3 px-4 text-stone-600">Available wallet balance</td>
                        <td className="py-3 px-4 text-right font-bold text-[#2C1A12]">₹{currentStudent.walletBalance}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-stone-600">Order amount</td>
                        <td className="py-3 px-4 text-right font-bold text-orange-600">₹{cartFinalPayable}</td>
                      </tr>
                      <tr className="bg-[#F5F0EB]/90">
                        <td className="py-3 px-4 font-bold text-[#2C1A12]">Remaining balance</td>
                        <td className={`py-3 px-4 text-right font-extrabold text-sm ${sufficient ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {sufficient ? `₹${currentStudent.walletBalance - cartFinalPayable}` : `-₹${shortfall} (Insufficient)`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Insufficient Balance Handler */}
                {!sufficient ? (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-3">
                    <div className="flex items-start gap-2.5 text-rose-700 text-xs">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                      <div>
                        <p className="font-bold text-sm text-[#2C1A12]">Insufficient CampusKart Wallet Balance</p>
                        <p className="mt-0.5">
                          You need an additional <strong>₹{shortfall}</strong> to complete this ₹{cartFinalPayable} order. Payment cannot proceed until your wallet is topped up.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleRequestParentTopUp}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Request Parent Wallet Top-Up (₹{shortfall})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedStudentId(currentStudent.id);
                          setParentAuthed(true);
                          setFundAmount(Math.max(500, shortfall));
                          setCustomFundInput(String(Math.max(500, shortfall)));
                          setParentScreen('add_money');
                          setActivePortal('parent');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
                      >
                        Switch to Parent Portal to Fund Now →
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setStudentScreen('wallet_verify')}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Wallet Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );

};

export default StudentPaymentMethodScreen;
