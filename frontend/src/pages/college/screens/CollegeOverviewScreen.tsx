import React from 'react';
import {
  Wallet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useCampusKart } from '../../../context/CampusKartContext';

export const CollegeOverviewScreen: React.FC = () => {
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

            const totalOrderVal = ecosystem.orders.reduce((acc, o) => acc + o.totalAmount, 0);
            const totalFundedVal = ecosystem.transactions
              .filter(t => t.type === 'Wallet Funding')
              .reduce((acc, t) => acc + t.amount, 0);

            const aggCatMap = {};
            ecosystem.orders.forEach(o => {
              o.items.forEach(it => {
                aggCatMap[it.category] = (aggCatMap[it.category] || 0) + it.subtotal;
              });
            });
            const aggCatData = Object.entries(aggCatMap).map(([name, value]) => ({ name, value }));

            return (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                    <span className="text-xs text-stone-500">Participating Pilot Students</span>
                    <p className="text-3xl font-black text-[#2C1A12] mt-1">{ecosystem.students.length}</p>
                    <span className="text-[11px] text-emerald-700">
                      {ecosystem.students.filter(s => s.status === 'Active').length} Active Pilot Participants
                    </span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                    <span className="text-xs text-stone-500">Total Campus Orders Processed</span>
                    <p className="text-3xl font-black text-[#6F4E37] mt-1">{ecosystem.orders.length}</p>
                    <span className="text-[11px] text-stone-500">100% digital kiosk/web fulfilment</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                    <span className="text-xs text-stone-500">Aggregate Order Volume</span>
                    <p className="text-3xl font-black text-emerald-700 mt-1">₹{totalOrderVal.toLocaleString('en-IN')}</p>
                    <span className="text-[11px] text-stone-500">Reconciled across all categories</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                    <span className="text-xs text-stone-500">Aggregate Parent Wallet Inflow</span>
                    <p className="text-3xl font-black text-orange-600 mt-1">₹{totalFundedVal.toLocaleString('en-IN')}</p>
                    <span className="text-[11px] text-stone-500">Zero cash handled by college</span>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-[#2C1A12] mb-3">Aggregate Product Category Distribution</h3>
                    <div className="relative h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggCatData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D6" />
                          <XAxis dataKey="name" stroke="#6F4E37" fontSize={10} />
                          <YAxis stroke="#6F4E37" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E0D6', color: '#2C1A12', fontSize: '12px' }} />
                          <Bar dataKey="value" name="Aggregate Spend (₹)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-sky-800 text-xs font-semibold">
                        Institutional Privacy Compliance Active
                      </span>
                      <h3 className="text-lg font-bold text-[#2C1A12]">Zero Administrative Overhead & Student Privacy</h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        In accordance with CampusKart’s institutional governance model, individual student purchases, personal wallet balances, and parent financial credentials are strictly isolated from college administration screens.
                      </p>
                      <div className="space-y-2 pt-2 text-xs text-stone-600">
                        <p>✓ <strong>Kiosk Turnaround Efficiency:</strong> 98.4% orders fulfilled within break window</p>
                        <p>✓ <strong>Collection Points Active:</strong> {ecosystem.college.collectionPoints.length} Campus Zones</p>
                        <p>✓ <strong>Reconciliation Status:</strong> 100% Automated Ledger Match</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCollegeScreen('reports')}
                      className="w-full py-3 rounded-xl bg-[#4A2E1B] hover:bg-[#2C1A12] text-white font-bold text-xs mt-4"
                    >
                      View Monthly Consolidated Invoices & Reports →
                    </button>
                  </div>
                </div>
              </div>
            );

};

export default CollegeOverviewScreen;
