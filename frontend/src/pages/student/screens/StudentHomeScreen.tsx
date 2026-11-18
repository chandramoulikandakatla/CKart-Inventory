import React from 'react';
import {
  Wallet, UserCheck, Plus, Minus, Lock, ShoppingBag, Clock, Package, Truck, RefreshCw, Star
} from 'lucide-react';
import { ProductArtwork } from '../../../components/common/ProductArtwork';
import { CATEGORIES } from '../../../constants/initialState';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentHomeScreen: React.FC = () => {
  const {
    ecosystem,
    setShowDemoModal,
    setStudentScreen,
    setShopCategory,
    setTrackingOrderId,
    currentStudent,
    studentOrders,
    handleOpenProductDetail,
    handleAddToCart,
    handleUpdateCartQty,
    cart,
    cartItemCount,
    cartFinalPayable,
    studentControls,
  } = useCampusKart();

  return (
            <div className="space-y-6">
              {/* Personalized Header Bar */}
              <div className="bg-gradient-to-r from-white via-orange-50/85 to-cyan-50/75 backdrop-blur-xl border border-orange-300/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-700 border border-orange-300/80">
                      {currentStudent.institution}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">{currentStudent.id} · {currentStudent.academicYear}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1A12]">
                    Hey {currentStudent.firstName}, ready for your break?
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                    <span><strong>Upcoming Pickup Window:</strong> {ecosystem.college.pilotWindow}</span>
                  </p>
                </div>

                {/* Live Wallet Card & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-[#F5F0EB] border border-stone-200/90 rounded-2xl px-5 py-3.5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 uppercase tracking-wider block">Available Wallet Balance</span>
                      <span className="text-2xl font-black text-[#2C1A12]">₹{currentStudent.walletBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => setStudentScreen('wallet')}
                      className="ml-2 px-3 py-1.5 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 text-xs font-semibold text-orange-700"
                    >
                      Ledger →
                    </button>
                  </div>

                  <button
                    onClick={() => setStudentScreen('profile')}
                    className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] hover:bg-slate-800 border border-stone-200/90 text-[#3D251A]"
                    title="Student Profile"
                  >
                    <UserCheck className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Current Offers & Order Tracking Shortcut Banner */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gradient-to-r from-orange-100/80 via-amber-50/75 to-cyan-100/75 border border-orange-300/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-700 border border-orange-300/70">
                      Current Campus Offer
                    </span>
                    <h3 className="text-lg font-bold text-[#2C1A12] mt-1.5">Zero Convenience Fee + 15% Off Insulated Flasks</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Pre-order before 12:30 PM for express priority pickup at Block A & Block B Smart Kiosks.
                    </p>
                  </div>
                  <button
                    onClick={() => setStudentScreen('shop')}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shrink-0 hover:bg-indigo-50 transition-all"
                  >
                    Explore Catalogue →
                  </button>
                </div>

                {/* Live Order Tracking Shortcut */}
                <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-cyan-300/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Live Order Tracker
                    </span>
                    <span className="text-xs font-semibold text-[#2C1A12]">{studentOrders[0]?.id || 'No Active Order'}</span>
                  </div>
                  {studentOrders[0] ? (
                    <div className="my-2">
                      <p className="text-sm font-bold text-[#2C1A12]">{studentOrders[0].status}</p>
                      <p className="text-xs text-stone-500 truncate">{studentOrders[0].collectionPoint}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 my-2">Place an order to track real-time preparation.</p>
                  )}
                  <button
                    onClick={() => {
                      if (studentOrders[0]) setTrackingOrderId(studentOrders[0].id);
                      setStudentScreen('order_tracking');
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-sky-800 border border-cyan-300/80 text-xs font-semibold"
                  >
                    Track My Order →
                  </button>
                </div>
              </div>

              {/* Shop by Category */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-[#2C1A12]">Shop by Category</h2>
                  <button
                    onClick={() => { setShopCategory('All'); setStudentScreen('shop'); }}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View Full Catalogue ({ecosystem.products.length} items) →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setShopCategory(cat);
                        setStudentScreen('shop');
                      }}
                      className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_10px_28px_-6px_rgba(44,26,18,0.06)] hover:bg-orange-50/80 border border-stone-200/80 hover:border-orange-400/70 text-left transition-all group"
                    >
                      <p className="text-xs font-bold text-[#2C1A12] group-hover:text-orange-700">{cat}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {ecosystem.products.filter(p => p.category === cat && p.active).length} products
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Products */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-[#2C1A12] flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-600" /> Featured Campus Products
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ecosystem.products.filter(p => p.featured && p.active).slice(0, 4).map(prod => {
                    const inCartItem = cart.find(c => c.productId === prod.id);
                    const isRestricted = studentControls.restrictedCategories?.includes(prod.category);
                    return (
                      <div
                        key={prod.id}
                        className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 hover:border-orange-400/70 rounded-2xl p-3.5 flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="cursor-pointer" onClick={() => handleOpenProductDetail(prod.id)}>
                            <ProductArtwork category={prod.category} id={prod.id} imageUrl={prod.imageUrl} name={prod.name} className="w-full h-32" />
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F0EB]/90 text-stone-600">
                              {prod.category}
                            </span>
                            <span className="text-[10px] font-semibold text-orange-600">{prod.offerTag}</span>
                          </div>
                          <h3
                            onClick={() => handleOpenProductDetail(prod.id)}
                            className="text-sm font-bold text-[#2C1A12] mt-1.5 cursor-pointer hover:text-orange-700 line-clamp-1"
                          >
                            {prod.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                          {isRestricted && (
                            <p className="text-[10px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Restricted by Parent
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-200/80">
                          <div>
                            <span className="text-base font-extrabold text-[#2C1A12]">₹{prod.price}</span>
                            {prod.stock === 0 ? (
                              <span className="block text-[10px] text-rose-600 font-semibold">Out of stock</span>
                            ) : prod.stock <= 5 ? (
                              <span className="block text-[10px] text-amber-700 font-semibold">Only {prod.stock} left</span>
                            ) : (
                              <span className="block text-[10px] text-emerald-700">{prod.stock} in stock</span>
                            )}
                          </div>

                          {inCartItem ? (
                            <div className="flex items-center gap-1.5 bg-[#F4EFEA] border border-orange-400/70 rounded-xl px-2 py-1 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCartQty(prod.id, -1);
                                }}
                                className="p-1 rounded-lg hover:bg-stone-200/65 text-[#3D251A] transition-colors"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-[#2C1A12] min-w-4 text-center">{inCartItem.qty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCartQty(prod.id, 1);
                                }}
                                disabled={inCartItem.qty >= prod.stock}
                                className={`p-1 rounded-lg transition-colors ${
                                  inCartItem.qty >= prod.stock
                                    ? 'text-stone-300 cursor-not-allowed'
                                    : 'hover:bg-stone-200/65 text-[#3D251A]'
                                }`}
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={prod.stock <= 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(prod, 1);
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                                prod.stock <= 0
                                  ? 'bg-[#F5F0EB]/90 text-stone-400 border border-stone-200/60 cursor-not-allowed'
                                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 active:scale-95'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" /> {prod.stock <= 0 ? 'Out of stock' : 'Add'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Frequently Purchased & Recent Orders Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Frequently Purchased */}
                <div className="bg-white/85 backdrop-blur-xl shadow-[0_10px_28px_-6px_rgba(44,26,18,0.06)] border border-stone-200/80 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#2C1A12] mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-orange-600" /> Frequently Purchased by {currentStudent.firstName}
                  </h3>
                  <div className="space-y-2.5">
                    {ecosystem.products.filter(p => p.frequent && p.active).slice(0, 4).map(prod => {
                      const inCartItem = cart.find(c => c.productId === prod.id);
                      return (
                        <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/60">
                          <div className="min-w-0 pr-3">
                            <p
                              onClick={() => handleOpenProductDetail(prod.id)}
                              className="text-xs font-semibold text-[#2C1A12] truncate cursor-pointer hover:text-orange-700"
                            >
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-stone-500">{prod.category} · ₹{prod.price}</p>
                          </div>
                          {inCartItem ? (
                            <div className="flex items-center gap-1 bg-white border border-orange-400/70 rounded-lg px-1.5 py-1 shrink-0 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCartQty(prod.id, -1);
                                }}
                                className="p-0.5 rounded hover:bg-stone-200/65 text-[#3D251A] transition-colors"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[11px] font-bold text-[#2C1A12] min-w-4 text-center">{inCartItem.qty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCartQty(prod.id, 1);
                                }}
                                disabled={inCartItem.qty >= prod.stock}
                                className={`p-0.5 rounded transition-colors ${
                                  inCartItem.qty >= prod.stock
                                    ? 'text-stone-300 cursor-not-allowed'
                                    : 'hover:bg-stone-200/65 text-[#3D251A]'
                                }`}
                                title="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={prod.stock <= 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(prod, 1);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                                prod.stock <= 0
                                  ? 'bg-stone-200/50 text-stone-400 cursor-not-allowed'
                                  : 'bg-orange-500/15 hover:bg-orange-500/30 text-orange-700 active:scale-95'
                              }`}
                            >
                              + Reorder
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Orders & Help */}
                <div className="bg-white/85 backdrop-blur-xl shadow-[0_10px_28px_-6px_rgba(44,26,18,0.06)] border border-stone-200/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#2C1A12] flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-700" /> Recent Orders
                      </h3>
                      <button
                        onClick={() => setStudentScreen('my_orders')}
                        className="text-xs text-orange-600 hover:text-orange-700"
                      >
                        See All →
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {studentOrders.slice(0, 3).map(ord => (
                        <div key={ord.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F0EB]/90 border border-stone-200/60 text-xs">
                          <div>
                            <p className="font-bold text-[#2C1A12]">{ord.id} <span className="text-stone-500 font-normal">({ord.items.length} items)</span></p>
                            <p className="text-[11px] text-stone-500">{ord.date} · {ord.status}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#2C1A12]">₹{ord.totalAmount}</span>
                            <button
                              onClick={() => { setTrackingOrderId(ord.id); setStudentScreen('order_tracking'); }}
                              className="px-2.5 py-1 rounded-lg bg-stone-200/65 hover:bg-stone-200/80 text-[#2C1A12] text-[11px]"
                            >
                              Track
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
                    <span>Campus Kiosk Support Helpline: Ext #402</span>
                    <button onClick={() => setShowDemoModal(true)} className="text-orange-600 hover:underline">
                      Help & Support
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Floating Quick-Cart Access when items exist in bag */}
              {cartItemCount > 0 && (
                <div className="sticky bottom-4 z-20 flex justify-end">
                  <button
                    onClick={() => setStudentScreen('cart')}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-500/30 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <div className="p-1 rounded-lg bg-white/20">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in Cart · ₹{cartFinalPayable}</span>
                    <span className="pl-2 border-l border-white/30 text-xs font-semibold">View Bag →</span>
                  </button>
                </div>
              )}
            </div>

  );
};

export default StudentHomeScreen;
