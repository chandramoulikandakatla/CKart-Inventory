import React from 'react';
import {
  Wallet
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const OpsStudentsScreen: React.FC = () => {
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
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-5 h-fit space-y-4">
                <h3 className="text-base font-bold text-[#2C1A12]">Enroll New Pilot Student</h3>
                <form onSubmit={handleOpsCreateStudent} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-500 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={newStudentForm.name}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                      placeholder="e.g. Ananya Rao"
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Academic Year</label>
                    <select
                      value={newStudentForm.academicYear}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    >
                      <option value="Intermediate First Year (MPC)">Intermediate First Year (MPC)</option>
                      <option value="Intermediate First Year (BiPC)">Intermediate First Year (BiPC)</option>
                      <option value="Intermediate Second Year (MPC)">Intermediate Second Year (MPC)</option>
                      <option value="Intermediate Second Year (BiPC)">Intermediate Second Year (BiPC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Linked Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={newStudentForm.parentName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                      placeholder="e.g. Suresh Rao"
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Initial Onboarding Wallet Credit (₹)</label>
                    <input
                      type="number"
                      value={newStudentForm.initialWallet}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, initialWallet: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    + Register Student Account
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-5 space-y-4">
                <h3 className="text-base font-bold text-[#2C1A12]">Registered Student Directory (Access-Controlled)</h3>
                <div className="space-y-3">
                  {ecosystem.students.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl bg-[#F4EFEA] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-600">{s.id}</span>
                          <span className="font-bold text-[#2C1A12] text-sm">{s.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'Active' ? 'bg-emerald-500/20 text-sky-800' : 'bg-rose-500/20 text-rose-700'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-stone-500 mt-1">{s.institution} · {s.academicYear}</p>
                        <p className="text-stone-500">Linked Parent: <strong className="text-[#3D251A]">{s.parentName} ({s.parentId})</strong> · PIN: Masked (****)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-stone-500 block">Wallet Balance</span>
                          <span className="text-base font-extrabold text-[#2C1A12]">₹{s.walletBalance}</span>
                        </div>
                        <button
                          onClick={() => handleOpsToggleStudentStatus(s.id)}
                          className={`px-3 py-2 rounded-xl font-bold ${
                            s.status === 'Active'
                              ? 'bg-rose-500/20 text-rose-700 hover:bg-rose-500/30'
                              : 'bg-sky-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

  );
};

export default OpsStudentsScreen;
