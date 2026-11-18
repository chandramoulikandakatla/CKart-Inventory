import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const OpsOverviewScreen: React.FC = () => {
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Total Registered Students</span>
                  <p className="text-2xl font-black text-[#2C1A12] mt-1">{ecosystem.students.length}</p>
                  <span className="text-[11px] text-emerald-700">
                    {ecosystem.students.filter(s => s.status === 'Active').length} Active Accounts
                  </span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Total Orders</span>
                  <p className="text-2xl font-black text-orange-600 mt-1">{ecosystem.orders.length}</p>
                  <span className="text-[11px] text-stone-500">
                    {ecosystem.orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length} Pending / Active
                  </span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Completed vs. Cancelled</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {ecosystem.orders.filter(o => o.status === 'Completed').length} / {ecosystem.orders.filter(o => o.status === 'Cancelled').length}
                  </p>
                  <span className="text-[11px] text-stone-500">Fulfilment completion</span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Total Demo Transaction Value</span>
                  <p className="text-2xl font-black text-orange-600 mt-1">
                    ₹{ecosystem.transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-emerald-700">100% Ledger Reconciled</span>
                </div>
              </div>

              {/* Inventory Status & Pending Fulfilment Queue */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#2C1A12]">Live Incoming Orders Queue</h3>
                    <button onClick={() => setOpsScreen('orders')} className="text-xs text-orange-600 hover:underline">
                      Manage All Orders →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {ecosystem.orders.slice(0, 4).map(ord => (
                      <div key={ord.id} className="p-3 rounded-xl bg-[#F4EFEA] border border-stone-200/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-[#2C1A12]">{ord.id} — {ord.studentName} ({ord.studentId})</p>
                          <p className="text-stone-500">{ord.items.length} items · ₹{ord.totalAmount} · {ord.fulfilmentMethod}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-800 font-semibold">
                          {ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#2C1A12]">Inventory Low-Stock Alerts</h3>
                    <button onClick={() => setOpsScreen('inventory')} className="text-xs text-orange-600 hover:underline">
                      Manage Catalogue →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {ecosystem.products.filter(p => p.stock <= 15).map(p => (
                      <div key={p.id} className="p-3 rounded-xl bg-[#F4EFEA] border border-stone-200/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-[#2C1A12]">{p.name} ({p.id})</p>
                          <p className="text-stone-500">{p.category} · ₹{p.price}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg font-bold ${
                          p.stock === 0 ? 'bg-rose-500/20 text-rose-700' : 'bg-amber-500/20 text-amber-800'
                        }`}>
                          {p.stock === 0 ? 'Out of Stock (0)' : `Low Stock (${p.stock})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

  );
};

export default OpsOverviewScreen;
