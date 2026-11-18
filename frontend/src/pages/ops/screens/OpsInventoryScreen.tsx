import React from 'react';
import { CATEGORIES } from '../../../constants/initialState';
import { useCampusKart } from '../../../context/CampusKartContext';

export const OpsInventoryScreen: React.FC = () => {
  const {
    ecosystem,
    newProductForm,
    setNewProductForm,
    handleOpsUpdateStock,
    handleOpsCreateProduct,
  } = useCampusKart();

  return (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Create New Product Form */}
              <div className="bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-5 h-fit space-y-4">
                <h3 className="text-base font-bold text-[#2C1A12]">Add New Campus Product</h3>
                <form onSubmit={handleOpsCreateProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-500 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      placeholder="e.g. Millet Protein Sandwich"
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Category</label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-500 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={newProductForm.price}
                        onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-500 mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={newProductForm.stock}
                        onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={newProductForm.description}
                      onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                      placeholder="Approved campus specification..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F4EFEA] border border-stone-200/90 text-[#2C1A12]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    + Publish to Student Catalogue
                  </button>
                </form>
              </div>

              {/* Inventory Table */}
              <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-5 space-y-4">
                <h3 className="text-base font-bold text-[#2C1A12]">Live Campus Inventory & Stock Controls</h3>
                <div className="space-y-2.5">
                  {ecosystem.products.map(p => (
                    <div key={p.id} className="p-3.5 rounded-2xl bg-[#F4EFEA] border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-orange-600 font-bold">{p.id}</span>
                          <span className="font-bold text-[#2C1A12]">{p.name}</span>
                          {!p.active && <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-700">Deactivated</span>}
                        </div>
                        <p className="text-stone-500 mt-0.5">{p.category} · Price: ₹{p.price}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpsUpdateStock(p.id, Math.max(0, p.stock - 5), undefined, undefined)}
                          className="px-2.5 py-1 rounded-lg bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-stone-600"
                        >
                          -5
                        </button>
                        <span className={`px-3 py-1 rounded-lg font-mono font-bold ${
                          p.stock === 0 ? 'bg-rose-500/20 text-rose-700' : 'bg-emerald-500/15 text-sky-800'
                        }`}>
                          Stock: {p.stock}
                        </span>
                        <button
                          onClick={() => handleOpsUpdateStock(p.id, p.stock + 10, undefined, undefined)}
                          className="px-2.5 py-1 rounded-lg bg-[#F5F0EB]/90 hover:bg-stone-200/65 text-stone-600"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleOpsUpdateStock(p.id, 0, undefined, undefined)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700"
                          title="Set Out of Stock to test student blocker"
                        >
                          Set 0
                        </button>
                        <button
                          onClick={() => handleOpsUpdateStock(p.id, undefined, undefined, !p.active)}
                          className={`px-2.5 py-1 rounded-lg font-semibold ${
                            p.active ? 'bg-stone-200/65 text-[#3D251A]' : 'bg-sky-600 text-white'
                          }`}
                        >
                          {p.active ? 'Hide' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

  );
};

export default OpsInventoryScreen;
