import React from 'react';
import {
  ShoppingBag, Plus, Minus, ArrowLeft
} from 'lucide-react';
import { ProductArtwork } from '../../../components/common/ProductArtwork';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentProductDetailScreen: React.FC = () => {
  const {
    ecosystem,
    showToast,
    setStudentScreen,
    selectedProductId,
    detailQty,
    setDetailQty,
    cart,
    cartItemCount,
    cartSubtotal,
    handleAddToCart,
  } = useCampusKart();

            const product = ecosystem.products.find(p => p.id === selectedProductId) || ecosystem.products[0];
            const inCart = cart.find(c => c.productId === product.id);
            return (
              <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setStudentScreen('shop')}
                    className="text-xs text-stone-600 hover:text-[#2C1A12] flex items-center gap-1.5 bg-[#F5F0EB]/90 px-3 py-1.5 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Catalogue
                  </button>
                  <button
                    onClick={() => setStudentScreen('cart')}
                    className="text-xs text-orange-700 hover:text-white flex items-center gap-1.5 bg-orange-500/15 border border-orange-300/80 px-3.5 py-1.5 rounded-xl font-semibold"
                  >
                    <ShoppingBag className="w-4 h-4" /> Cart ({cartItemCount} items · ₹{cartSubtotal})
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <ProductArtwork category={product.category} id={product.id} className="w-full h-64 sm:h-72" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-700 text-xs font-semibold">
                        {product.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-800 text-xs font-semibold">
                        {product.offerTag}
                      </span>
                    </div>

                    <h1 className="text-2xl font-extrabold text-[#2C1A12]">{product.name}</h1>
                    <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>

                    <div className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-500 block">Campus Price</span>
                        <span className="text-3xl font-black text-[#2C1A12]">₹{product.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-500 block">Availability</span>
                        {product.stock > 0 ? (
                          <span className="text-sm font-bold text-emerald-700">{product.stock} Units Available</span>
                        ) : (
                          <span className="text-sm font-bold text-rose-600">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-stone-600">Select Quantity:</span>
                      <div className="flex items-center gap-3 bg-[#F4EFEA] border border-stone-200/90 rounded-xl px-3 py-1.5">
                        <button
                          onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                          className="p-1 rounded-lg hover:bg-stone-200/65 text-[#2C1A12]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-[#2C1A12] w-6 text-center">{detailQty}</span>
                        <button
                          onClick={() => {
                            if (detailQty < product.stock) setDetailQty(detailQty + 1);
                            else showToast('Stock Cap', `Maximum available stock is ${product.stock}.`, 'error');
                          }}
                          className="p-1 rounded-lg hover:bg-stone-200/65 text-[#2C1A12]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {inCart && (
                      <p className="text-xs text-orange-700">
                        Currently in your cart: <strong>{inCart.qty} unit(s)</strong> (Subtotal: ₹{inCart.qty * product.price})
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        disabled={product.stock <= 0}
                        onClick={() => handleAddToCart(product, detailQty)}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                          product.stock <= 0
                            ? 'bg-[#F5F0EB]/90 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add {detailQty} to Cart (₹{product.price * detailQty})</span>
                      </button>
                      <button
                        onClick={() => setStudentScreen('cart')}
                        className="px-5 py-3.5 rounded-xl bg-stone-200/65 hover:bg-stone-200/80 text-[#2C1A12] font-semibold text-sm"
                      >
                        Go to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );

};

export default StudentProductDetailScreen;
