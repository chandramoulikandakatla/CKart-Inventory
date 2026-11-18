import React from 'react';
import {
  ShoppingBag, Wallet, Plus, Minus, Trash2, ArrowRight, ArrowLeft
} from 'lucide-react';
import { ProductArtwork } from '../../../components/common/ProductArtwork';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentCartScreen: React.FC = () => {
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
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#2C1A12]">Your CampusKart Shopping Bag</h1>
                  <p className="text-xs text-stone-500">Contents are preserved across screens</p>
                </div>
                <button
                  onClick={() => setStudentScreen('shop')}
                  className="px-4 py-2 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 text-xs font-semibold text-[#2C1A12] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
                </button>
              </div>

              {populatedCart.length === 0 ? (
                <div className="bg-white/85 backdrop-blur-xl shadow-[0_10px_28px_-6px_rgba(44,26,18,0.06)] border border-stone-200/80 rounded-3xl p-12 text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-bold text-[#2C1A12]">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Browse the student catalogue to add snacks, beverages, academic supplies, or daily essentials.
                  </p>
                  <button
                    onClick={() => setStudentScreen('shop')}
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Cart Items List */}
                  <div className="lg:col-span-2 space-y-3">
                    {populatedCart.map(item => (
                      <div
                        key={item.id}
                        className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <ProductArtwork category={item.category} id={item.id} className="w-20 h-20 shrink-0" />
                          <div>
                            <span className="text-[10px] text-orange-600 font-medium">{item.category}</span>
                            <h3 className="text-sm font-bold text-[#2C1A12]">{item.name}</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Unit Price: ₹{item.price} · Stock: {item.stock}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          <div className="flex items-center gap-2 bg-[#F4EFEA] border border-stone-200/90 rounded-xl px-2.5 py-1">
                            <button
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="p-1 text-stone-600 hover:text-[#2C1A12]"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-[#2C1A12] w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="p-1 text-stone-600 hover:text-[#2C1A12]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[60px]">
                            <span className="text-sm font-extrabold text-[#2C1A12]">₹{item.subtotal}</span>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary Card */}
                  <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-orange-300/80 rounded-2xl p-5 space-y-4 h-fit">
                    <h3 className="text-base font-bold text-[#2C1A12] border-b border-stone-200/80 pb-3">Cart Summary</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Total Item Count</span>
                        <span className="font-semibold text-[#2C1A12]">{cartItemCount} items</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Items Subtotal</span>
                        <span className="font-semibold text-[#2C1A12]">₹{cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Campus Pilot Handling Charge</span>
                        <span className="text-emerald-700 font-semibold">₹0 (Waived)</span>
                      </div>
                      <div className="pt-2 border-t border-stone-200/80 flex justify-between text-sm font-extrabold text-[#2C1A12]">
                        <span>Final Payable Amount</span>
                        <span className="text-orange-600 text-base">₹{cartFinalPayable}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/80 text-xs flex justify-between items-center">
                      <span className="text-stone-500">Your Wallet Balance:</span>
                      <span className={`font-bold ${currentStudent.walletBalance >= cartFinalPayable ? 'text-emerald-700' : 'text-rose-600'}`}>
                        ₹{currentStudent.walletBalance}
                      </span>
                    </div>

                    <button
                      onClick={() => setStudentScreen('order_review')}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setStudentScreen('shop')}
                      className="w-full py-2.5 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-stone-600 text-xs font-semibold"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

  );
};

export default StudentCartScreen;
