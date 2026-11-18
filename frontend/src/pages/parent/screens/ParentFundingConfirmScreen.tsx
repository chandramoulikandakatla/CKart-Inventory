import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentFundingConfirmScreen: React.FC = () => {
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
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#2C1A12]">Funding Confirmation</h2>
                <button onClick={() => setParentScreen('funding_method')} className="text-xs text-stone-500 hover:text-[#2C1A12]">
                  ← Change Method
                </button>
              </div>

              <div className="bg-[#F4EFEA] border border-stone-200/90 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-stone-200/70">
                    <tr>
                      <td className="py-3 px-4 text-stone-500">Parent Account</td>
                      <td className="py-3 px-4 text-right font-bold text-[#2C1A12]">{parentLinkedStudent.parentName} ({parentLinkedStudent.parentId})</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-stone-500">Linked Student</td>
                      <td className="py-3 px-4 text-right font-bold text-[#2C1A12]">{parentLinkedStudent.name} ({parentLinkedStudent.id})</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-stone-500">Selected Payment Method</td>
                      <td className="py-3 px-4 text-right font-semibold text-sky-800">{fundingMethod} (Simulated)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-stone-500">Existing wallet balance</td>
                      <td className="py-3 px-4 text-right font-bold text-[#2C1A12]">₹{parentLinkedStudent.walletBalance}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-stone-500">Amount to add</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">+₹{fundAmount}</td>
                    </tr>
                    <tr className="bg-cyan-50/90">
                      <td className="py-3.5 px-4 font-bold text-[#2C1A12]">New projected balance</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-base text-sky-800">
                        ₹{parentLinkedStudent.walletBalance + Number(fundAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmParentFunding}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25"
              >
                Confirm Simulated Payment (₹{fundAmount})
              </button>
            </div>

  );
};

export default ParentFundingConfirmScreen;
