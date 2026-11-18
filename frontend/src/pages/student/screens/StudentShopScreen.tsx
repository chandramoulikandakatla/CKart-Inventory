import React from 'react';
import {
  ShoppingBag, Lock, Search, Filter, Plus, Minus
} from 'lucide-react';
import { ProductArtwork } from '../../../components/common/ProductArtwork';
import { CATEGORIES } from '../../../constants/initialState';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentShopScreen: React.FC = () => {
  const {
    ecosystem,
    setStudentScreen,
    shopSearch,
    setShopSearch,
    shopCategory,
    setShopCategory,
    shopSort,
    setShopSort,
    recentlyViewed,
    cart,
    cartItemCount,
    cartSubtotal,
    studentControls,
    handleOpenProductDetail,
    handleAddToCart,
    handleUpdateCartQty,
  } = useCampusKart();

  return (
            <div className="space-y-6">
              {/* Search, Filter & Sort Toolbar */}
              <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={shopSearch}
                      onChange={(e) => setShopSearch(e.target.value)}
                      placeholder="Search snacks, notebooks, beverages, hygiene kits..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-xs sm:text-sm text-[#2C1A12] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={shopSort}
                      onChange={(e) => setShopSort(e.target.value)}
                      className="bg-[#F4EFEA] border border-stone-200/90 rounded-xl px-3 py-2.5 text-xs text-[#3D251A]"
                    >
                      <option value="featured">Sort: Featured First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="stock">Availability: High Stock</option>
                    </select>
                    <button
                      onClick={() => setStudentScreen('cart')}
                      className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Cart ({cartItemCount}) · ₹{cartSubtotal}</span>
                    </button>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setShopCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        shopCategory === cat
                          ? 'bg-orange-600 text-white'
                          : 'bg-[#F5F0EB]/90 text-stone-600 hover:bg-stone-200/65'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Catalogue Grid */}
              {(() => {
                let filtered = ecosystem.products.filter(p => p.active);
                if (shopCategory !== 'All') {
                  filtered = filtered.filter(p => p.category === shopCategory);
                }
                if (shopSearch.trim()) {
                  const q = shopSearch.toLowerCase();
                  filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
                  );
                }
                if (shopSort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
                if (shopSort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
                if (shopSort === 'stock') filtered = [...filtered].sort((a, b) => b.stock - a.stock);

                return (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(prod => {
                      const inCartItem = cart.find(c => c.productId === prod.id);
                      const isRestricted = studentControls.restrictedCategories?.includes(prod.category);
                      return (
                        <div
                          key={prod.id}
                          className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/80 hover:border-orange-400/70 rounded-2xl p-4 flex flex-col justify-between transition-all"
                        >
                          <div>
                            <div className="cursor-pointer" onClick={() => handleOpenProductDetail(prod.id)}>
                              <ProductArtwork category={prod.category} id={prod.id} className="w-full h-36" />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F5F0EB]/90 text-stone-600">
                                {prod.category}
                              </span>
                              {prod.stock === 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-700">
                                  Out of Stock
                                </span>
                              ) : prod.stock <= 5 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800">
                                  Only {prod.stock} left
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-emerald-700">
                                  In Stock ({prod.stock})
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => handleOpenProductDetail(prod.id)}
                              className="text-sm font-bold text-[#2C1A12] mt-2 cursor-pointer hover:text-orange-700"
                            >
                              {prod.name}
                            </h3>
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                            {isRestricted && (
                              <p className="text-[10px] text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Restricted by Parent Control
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-lg font-extrabold text-[#2C1A12]">₹{prod.price}</span>
                              <button
                                onClick={() => handleOpenProductDetail(prod.id)}
                                className="block text-[11px] text-orange-600 hover:underline"
                              >
                                View Details →
                              </button>
                            </div>

                            {inCartItem ? (
                              <div className="flex items-center gap-2 bg-[#F4EFEA] border border-orange-400/70 rounded-xl px-2 py-1">
                                <button
                                  onClick={() => handleUpdateCartQty(prod.id, -1)}
                                  className="p-1 rounded-lg hover:bg-stone-200/65 text-[#3D251A]"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold text-[#2C1A12] w-5 text-center">{inCartItem.qty}</span>
                                <button
                                  onClick={() => handleUpdateCartQty(prod.id, 1)}
                                  className="p-1 rounded-lg hover:bg-stone-200/65 text-[#3D251A]"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={prod.stock <= 0}
                                onClick={() => handleAddToCart(prod, 1)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                                  prod.stock <= 0
                                    ? 'bg-[#F5F0EB]/90 text-slate-500 cursor-not-allowed'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Recently Viewed Products */}
              {recentlyViewed.length > 0 && (
                <div className="bg-cyan-50/65 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(2,132,199,0.08)] border border-stone-200/80 rounded-2xl p-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">Recently Viewed Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentlyViewed.map(id => {
                      const p = ecosystem.products.find(x => x.id === id);
                      if (!p) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => handleOpenProductDetail(id)}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/65 border border-stone-200/80 text-xs text-[#3D251A] flex items-center gap-2"
                        >
                          <span>{p.name}</span>
                          <span className="text-orange-600 font-bold">₹{p.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

  );
};

export default StudentShopScreen;
