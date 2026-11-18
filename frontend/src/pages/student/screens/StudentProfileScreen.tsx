import React from 'react';
import {
  LogOut
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentProfileScreen: React.FC = () => {
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
            <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-[#6F4E37] flex items-center justify-center font-black text-xl text-white">
                    {currentStudent.firstName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#2C1A12]">{currentStudent.name}</h2>
                    <p className="text-xs text-stone-500 font-mono">{currentStudent.id} · {currentStudent.status}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStudentAuthed(false);
                    setStudentScreen('welcome');
                    showToast('Logged Out', 'Student session closed safely.', 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80">
                  <span className="text-stone-500 block">Participating Institution</span>
                  <span className="font-bold text-[#2C1A12] mt-0.5 block">{currentStudent.institution}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80">
                  <span className="text-stone-500 block">Academic Year & Stream</span>
                  <span className="font-bold text-[#2C1A12] mt-0.5 block">{currentStudent.academicYear}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80">
                  <span className="text-stone-500 block">Linked Parent / Guardian Account</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {currentStudent.parentName} ({currentStudent.parentId}) — Verified
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80">
                  <span className="text-stone-500 block">Active Parent Daily Spend Cap</span>
                  <span className="font-bold text-[#2C1A12] mt-0.5 block">
                    {studentControls.dailyLimitEnabled ? `₹${studentControls.dailyLimit} / day` : 'No Daily Cap'}
                  </span>
                </div>
              </div>

              {/* Switch Demo Student Profile Quickly */}
              <div className="p-4 rounded-2xl bg-orange-50/90 border border-orange-300/70 space-y-2">
                <p className="text-xs font-bold text-[#2C1A12]">Switch Active Student Account:</p>
                <div className="flex flex-wrap gap-2">
                  {ecosystem.students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setLoggedStudentId(s.id);
                        showToast('Switched Student', `Now viewing ${s.name} (${s.id})`, 'info');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        s.id === currentStudent.id ? 'bg-orange-600 text-white' : 'bg-stone-200/65 text-stone-600'
                      }`}
                    >
                      {s.name} (₹{s.walletBalance})
                    </button>
                  ))}
                </div>
              </div>
            </div>

  );
};

export default StudentProfileScreen;
