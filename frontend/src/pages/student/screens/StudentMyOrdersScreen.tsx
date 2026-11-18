import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentMyOrdersScreen: React.FC = () => {
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
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#2C1A12]">My CampusKart Orders</h1>
                  <p className="text-xs text-stone-500">Synchronized in real time with CampusKart Operations</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['All Orders', 'Order Placed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                        orderFilter === st
                          ? 'bg-orange-600 text-white'
                          : 'bg-white shadow-sm text-stone-600 hover:bg-stone-200/65 border border-stone-200/80'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {studentOrders
                  .filter(o => orderFilter === 'All Orders' || o.status === orderFilter)
                  .map(ord => (
                    <div key={ord.id} className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-[#2C1A12]">{ord.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.status === 'Completed' ? 'bg-emerald-500/20 text-sky-800' :
                            ord.status === 'Ready for Collection' ? 'bg-amber-500/20 text-amber-800' :
                            'bg-orange-500/15 text-orange-700'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{ord.date} · {ord.collectionPoint}</p>
                        <div className="mt-3 space-y-1">
                          {ord.items.map((it, idx) => (
                            <p key={idx} className="text-xs text-[#3D251A]">
                              {it.qty}× {it.name} <span className="text-stone-500">(₹{it.subtotal})</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-stone-500 block">{ord.items.reduce((a, b) => a + b.qty, 0)} units</span>
                          <span className="text-base font-extrabold text-[#2C1A12]">₹{ord.totalAmount}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setReceiptModalOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-xs text-[#3D251A]"
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => {
                              setTrackingOrderId(ord.id);
                              setStudentScreen('order_tracking');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-semibold text-white"
                          >
                            View Details & Track →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

  );
};

export default StudentMyOrdersScreen;
