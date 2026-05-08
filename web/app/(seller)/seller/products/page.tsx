"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Plus, Search, RefreshCw, Edit2, Trash2, X,
  CheckCircle, Clock, XCircle, Image as ImageIcon, Save, TrendingUp
} from "lucide-react";
import { fetchWithConfig } from "@/lib/config";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  image: string;
  category: { _id: string; name: string } | null;
  brand: { _id: string; name: string } | null;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

const statusCfg = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800", icon: XCircle },
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", image: "", category: "", brand: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "all") params.set("status", filter);
      const res = await fetchWithConfig<any>(`/sellers/products?${params}`);
      setProducts(res.products || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    (async () => {
      try {
        const [c, b] = await Promise.all([
          fetchWithConfig<any>("/categories"), fetchWithConfig<any>("/brands"),
        ]);
        setCategories(c.categories || c || []);
        setBrands(b.brands || b || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setForm(prev => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreate = () => { 
    setEditingProduct(null); 
    setForm({ name: "", description: "", price: "", stock: "", image: "", category: "", brand: "" }); 
    setImagePreview(null);
    setShowModal(true); 
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), image: p.image, category: p.category?._id || "", brand: p.brand?._id || "" });
    setImagePreview(p.image);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: [form.image] };
      if (editingProduct) {
        await fetchWithConfig(`/sellers/products/${editingProduct._id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Product updated successfully");
      } else {
        await fetchWithConfig("/sellers/products", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Product created and submitted for approval");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await fetchWithConfig(`/sellers/products/${showDeleteModal}`, { method: "DELETE" });
      toast.success("Product deleted successfully");
      setShowDeleteModal(null);
      fetchProducts();
    } catch (err) { toast.error("Failed to delete product"); }
  };

  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const counts = { all: products.length, pending: products.filter((p) => p.approvalStatus === "pending").length, approved: products.filter((p) => p.approvalStatus === "approved").length, rejected: products.filter((p) => p.approvalStatus === "rejected").length };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1a1a2c] flex items-center gap-3 tracking-tighter">
            <ShoppingBag className="h-8 w-8 text-[#d52245]" /> 
            Product Inventory
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-70">Manage your marketplace offerings</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={fetchProducts} 
            className="inline-flex items-center justify-center h-12 w-12 text-slate-600 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm group"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          </button>
          <button 
            onClick={openCreate} 
            className="inline-flex items-center gap-3 px-8 h-12 text-sm font-black uppercase tracking-widest text-white bg-[#1a1a2c] rounded-2xl hover:bg-[#d52245] transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="h-5 w-5" /> Add New
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap bg-white p-2 rounded-[1.5rem] w-fit border-2 border-slate-100 shadow-sm">
        {(["all", "pending", "approved", "rejected"] as const).map((key) => (
          <button 
            key={key} 
            onClick={() => setFilter(key)} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === key 
                ? "bg-[#1a1a2c] text-white shadow-lg" 
                : "text-slate-400 hover:text-[#1a1a2c] hover:bg-slate-50"
            }`}
          >
            {key} <span className={`ml-1.5 opacity-50 ${filter === key ? "text-white" : ""}`}>{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#1a1a2c] transition-colors" />
        <input 
          type="text" 
          placeholder="Filter products by name..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 h-16 text-sm border-2 border-slate-100 rounded-[1.5rem] bg-white focus:outline-none focus:ring-4 focus:ring-slate-50 focus:border-[#1a1a2c] transition-all font-bold placeholder:text-slate-300 shadow-sm" 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[2rem] border-2 border-slate-100">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#d52245] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-[#1a1a2c]">
              <ShoppingBag className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Inventory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8">
            <ShoppingBag className="h-12 w-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-[#1a1a2c]">No items found</h3>
          <p className="text-slate-400 mt-3 max-w-sm mx-auto font-bold uppercase text-[10px] tracking-widest leading-relaxed">Try adjusting your filters or search terms to find what you're looking for.</p>
          <button onClick={openCreate} className="mt-10 px-10 h-14 bg-[#1a1a2c] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#d52245] shadow-2xl shadow-slate-200 transition-all">
            List Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Info</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sold</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filtered.map((product) => {
                  const sc = statusCfg[product.approvalStatus]; const Icon = sc.icon;
                  return (
                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-slate-300" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#1a1a2c] truncate text-base leading-none mb-1.5">{product.name}</p>
                            <div className="flex gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{product.category?.name || "No Category"}</span>
                              <span className="h-3 w-px bg-slate-200" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{product.brand?.name || "No Brand"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className={`text-sm font-black ${product.stock < 10 ? "text-[#d52245]" : "text-slate-700"}`}>
                            {product.stock} Units
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{product.stock < 10 ? "Low Stock" : "In Stock"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xl font-black text-[#1a1a2c] tracking-tight">${product.price}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sc.cls} border-current/10`}>
                          <Icon className="h-3 w-3" /> {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-black text-slate-700">{product.sold}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(product)} 
                            className="h-10 px-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a2c] bg-slate-100 rounded-xl hover:bg-[#1a1a2c] hover:text-white transition-all"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => setShowDeleteModal(product._id)} 
                            className="h-10 w-10 inline-flex items-center justify-center text-[#d52245] bg-rose-50 rounded-xl hover:bg-[#d52245] hover:text-white transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a2c]/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-4 border-white flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b-2 border-slate-50">
              <div>
                <h2 className="text-2xl font-black text-[#1a1a2c] tracking-tight">{editingProduct ? "Edit Listing" : "New Listing"}</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-70">Define your product specifications</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-12 w-12 flex items-center justify-center text-slate-300 hover:text-[#d52245] hover:bg-rose-50 rounded-2xl transition-all"><X className="h-7 w-7" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#1a1a2c] uppercase tracking-[0.2em]">Product Visuals</label>
                <div 
                  className="relative aspect-video rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden hover:border-[#1a1a2c] hover:bg-slate-100/50 transition-all cursor-pointer group shadow-inner"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-8 w-8 text-[#d52245]" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-[#1a1a2c] uppercase tracking-widest">Select Image File</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">PNG, JPG or WebP (max 5MB)</p>
                      </div>
                    </div>
                  )}
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Title</label>
                  <input type="text" required placeholder="Name of your product" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-14 px-6 text-sm border-2 border-slate-100 rounded-2xl focus:border-[#1a1a2c] focus:outline-none bg-slate-50/30 font-bold placeholder:text-slate-200" />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea required placeholder="Highlight the best features..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full p-6 text-sm border-2 border-slate-100 rounded-2xl focus:border-[#1a1a2c] focus:outline-none bg-slate-50/30 font-bold placeholder:text-slate-200 resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">$</span>
                    <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full h-14 pl-10 pr-6 text-sm border-2 border-slate-100 rounded-2xl focus:border-[#1a1a2c] focus:outline-none bg-slate-50/30 font-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Units in Stock</label>
                  <input type="number" required min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full h-14 px-6 text-sm border-2 border-slate-100 rounded-2xl focus:border-[#1a1a2c] focus:outline-none bg-slate-50/30 font-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-14 px-6 text-sm border-2 border-slate-100 rounded-2xl focus:border-[#1a1a2c] focus:outline-none bg-slate-50/30 font-black appearance-none cursor-pointer">
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                  <select required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full h-14 px-6 text-sm border-2 border-slate-100 rounded-2xl focus:border-[#1a1a2c] focus:outline-none bg-slate-50/30 font-black appearance-none cursor-pointer">
                    <option value="">Select Brand</option>
                    {brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            </form>

            <div className="p-8 bg-slate-50 border-t-2 border-slate-100 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 h-14 text-xs font-black uppercase tracking-widest text-slate-400 bg-white border-2 border-slate-100 rounded-2xl hover:text-slate-900 transition-all">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={saving} 
                className="flex-[2] inline-flex items-center justify-center gap-3 h-14 text-xs font-black uppercase tracking-[0.2em] text-white bg-[#1a1a2c] rounded-2xl hover:bg-[#d52245] disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
              >
                {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} 
                {saving ? "Processing..." : editingProduct ? "Confirm Update" : "Publish Listing"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Mosla) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1a1a2c]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 border-4 border-white flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center text-[#d52245] mb-6 shadow-inner">
              <Trash2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black text-[#1a1a2c]">Delete Product?</h3>
            <p className="text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-widest leading-relaxed">This action cannot be undone. All data associated with this listing will be permanently removed.</p>
            
            <div className="flex gap-3 w-full mt-10">
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-xl hover:text-slate-900 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-white bg-[#d52245] rounded-xl hover:bg-red-700 shadow-lg shadow-rose-200 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
