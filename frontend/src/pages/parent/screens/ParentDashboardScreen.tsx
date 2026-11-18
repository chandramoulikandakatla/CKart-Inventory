import React from 'react';
import {
  Wallet, Activity, PlusCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentDashboardScreen: React.FC = () => {
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
              {/* Top Linked Student Financial Banner */}
              <div className="bg-gradient-to-r from-white via-cyan-50/85 to-sky-50/80 border border-cyan-300/80 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-2xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-sky-800 border border-cyan-300/80">
                      Guardian Account: {parentLinkedStudent.parentName}
                    </span>
                    <select
                      value={linkedStudentId}
                      onChange={(e) => setLinkedStudentId(e.target.value)}
                      className="bg-[#F4EFEA] border border-stone-200/90 rounded-lg px-2 py-0.5 text-xs text-sky-800 font-mono"
                    >
                      {ecosystem.students.map(s => (
                        <option key={s.id} value={s.id}>Linked Student: {s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>
                  <h1 className="text-2xl font-extrabold text-[#2C1A12]">
                    {parentLinkedStudent.name} — Financial Activity Overview
                  </h1>
                  <p className="text-xs text-stone-600">
                    {parentLinkedStudent.institution} · {parentLinkedStudent.academicYear}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-cyan-50/70 backdrop-blur-md border border-cyan-300/80 rounded-2xl px-5 py-3">
                    <span className="text-[10px] font-mono uppercase text-stone-500 block">Current Student Wallet</span>
                    <span className="text-2xl font-black text-emerald-700">₹{parentLinkedStudent.walletBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => setParentScreen('add_money')}
                    className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Money to Wallet
                  </button>
                </div>
              </div>

              {/* 4 Financial Metric Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Available Wallet Balance</span>
                  <p className="text-2xl font-black text-[#2C1A12] mt-1">₹{parentLinkedStudent.walletBalance}</p>
                  <span className="text-[11px] text-emerald-700">Reconciled with ledger</span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Total Funds Added</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">₹{parentMetrics.totalAdded}</p>
                  <span className="text-[11px] text-stone-500">Parent wallet top-ups</span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Total Student Expenditure</span>
                  <p className="text-2xl font-black text-orange-600 mt-1">₹{parentMetrics.totalSpent}</p>
                  <span className="text-[11px] text-stone-500">{parentMetrics.purchaseCount} campus orders</span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4">
                  <span className="text-xs text-stone-500">Daily Limit Status</span>
                  <p className="text-2xl font-black text-cyan-700 mt-1">
                    {parentControls.dailyLimitEnabled ? `₹${parentControls.dailyLimit}/day` : 'Unrestricted'}
                  </p>
                  <button onClick={() => setParentScreen('controls')} className="text-[11px] text-emerald-700 hover:underline">
                    Configure Limits →
                  </button>
                </div>
              </div>

              {/* Financial Visualizations Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#2C1A12]">Spending by Category (Live Shared Data)</h3>
                    <button onClick={() => setParentScreen('analytics')} className="text-xs text-emerald-700 hover:underline">
                      Full Analytics →
                    </button>
                  </div>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={parentCategoryChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                        >
                          {parentCategoryChartData.map((_, i) => (
                            <Cell key={i} fill={['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E0D6', color: '#2C1A12', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val) => [`₹${val}`, 'Spent']}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#2C1A12]">Wallet Funding vs. Expenditure</h3>
                    <span className="text-xs text-stone-500">Monthly Comparison</span>
                  </div>
                  <div className="relative h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={parentMonthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D6" />
                        <XAxis dataKey="month" stroke="#6F4E37" fontSize={11} />
                        <YAxis stroke="#6F4E37" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E0D6', color: '#2C1A12', borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="funded" name="Wallet Funded (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="spent" name="Student Spend (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Purchases & Notifications */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#2C1A12]">Recent Student Purchases</h3>
                    <button onClick={() => setParentScreen('orders')} className="text-xs text-emerald-700 hover:underline">
                      Inspect All Orders →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {parentOrders.slice(0, 3).map(ord => (
                      <div key={ord.id} className="p-3 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-[#2C1A12]">{ord.id} — {ord.items.map(i => i.name).join(', ').slice(0, 42)}...</p>
                          <p className="text-[11px] text-stone-500">{ord.date} · Status: {ord.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">-₹{ord.totalAmount}</span>
                          <button
                            onClick={() => setReceiptModalOrder(ord)}
                            className="px-2.5 py-1 rounded-lg bg-stone-200/65 hover:bg-stone-200/80 text-[#2C1A12]"
                          >
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#2C1A12]">Recent Guardian Notifications</h3>
                    <button onClick={() => setParentScreen('notifications')} className="text-xs text-emerald-700 hover:underline">
                      All Alerts →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {ecosystem.notifications
                      .filter(n => n.studentId === parentLinkedStudent.id)
                      .slice(0, 3)
                      .map(n => (
                        <div key={n.id} className="p-3 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/60 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-sky-800">{n.title}</span>
                            <span className="text-[10px] text-stone-500">{n.time}</span>
                          </div>
                          <p className="text-stone-600 mt-1">{n.message}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

  );
};

export default ParentDashboardScreen;
