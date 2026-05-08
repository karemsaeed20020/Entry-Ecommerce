"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, RefreshCw, Eye, Search, Clock, Truck, CheckCircle, XCircle, MapPin, User } from "lucide-react";
import { fetchWithConfig } from "@/lib/config";

const statusCfg: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800", icon: Clock },
  address_confirmed: { label: "Address Confirmed", cls: "bg-blue-100 text-blue-800", icon: MapPin },
  confirmed: { label: "Confirmed", cls: "bg-indigo-100 text-indigo-800", icon: CheckCircle },
  packed: { label: "Packed", cls: "bg-purple-100 text-purple-800", icon: Package },
  delivering: { label: "Delivering", cls: "bg-cyan-100 text-cyan-800", icon: Truck },
  delivered: { label: "Delivered", cls: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  completed: { label: "Completed", cls: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800", icon: XCircle },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("status", filter);
      const res = await fetchWithConfig<any>(`/sellers/orders?${params}`);
      setOrders(res.orders || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o: any) =>
    !search || o._id.toLowerCase().includes(search.toLowerCase()) || o.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#1a1a2c] flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#1a1a2c] tracking-tight">Order Registry</h1>
              <p className="text-slate-500 font-medium text-sm">Manage fulfillment for your marketplace products.</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchOrders} 
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#1a1a2c] bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> 
          Sync Registry
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {["all", "pending", "confirmed", "packed", "delivering", "delivered", "completed"].map((key) => (
            <button 
              key={key} 
              onClick={() => setFilter(key)} 
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                filter === key 
                ? "bg-[#1a1a2c] text-white shadow-lg shadow-slate-200" 
                : "bg-white text-slate-400 border-2 border-slate-50 hover:border-slate-100 hover:text-slate-600"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or customer name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm font-bold border-2 border-slate-50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2c] placeholder:text-slate-300 transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Identifier</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Profile</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Earnings</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order: any) => {
                  const sc = statusCfg[order.status] || statusCfg.pending;
                  const Icon = sc.icon;
                  return (
                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-6 py-6">
                        <span className="font-black text-[#1a1a2c] text-sm tabular-nums">#{order._id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#1a1a2c] text-white flex items-center justify-center text-[10px] font-black">
                            {order.userId?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{order.userId?.name || "Guest"}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{order.userId?.email?.split('@')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sc.cls}`}>
                          <Icon className="h-3 w-3" /> {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="font-black text-[#d52245] text-sm tabular-nums">{fmt(order.sellerTotal || 0)}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)} 
                          className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#1a1a2c] hover:text-white transition-all active:scale-90"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Side Sheet/Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-[#1a1a2c]/20 backdrop-blur-md p-0 md:p-4" onClick={() => setSelectedOrder(null)}>
          <div 
            className="bg-white h-full md:h-auto md:max-h-[90vh] w-full md:max-w-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-500" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1a1a2c] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest mb-4">
                    Transaction Details
                  </div>
                  <h2 className="text-3xl font-black tracking-tight leading-none">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                  <p className="text-white/50 text-sm font-bold mt-2">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Stage</p>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${(statusCfg[selectedOrder.status] || statusCfg.pending).cls.split(' ')[1]}`} />
                    <span className="font-black text-xl text-[#1a1a2c] uppercase italic tracking-tighter">
                      {(statusCfg[selectedOrder.status] || statusCfg.pending).label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earnings</p>
                  <p className="text-2xl font-black text-[#d52245] tabular-nums">{fmt(selectedOrder.sellerTotal || 0)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <User className="h-3.5 w-3.5" /> Customer Logistics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Contact Name</p>
                    <p className="font-bold text-[#1a1a2c]">{selectedOrder.userId?.name}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Email Dispatch</p>
                    <p className="font-bold text-[#1a1a2c] truncate">{selectedOrder.userId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Product Manifest */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <Package className="h-3.5 w-3.5" /> Product Manifest
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-slate-100 transition-colors group">
                      <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#1a1a2c] truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{fmt(item.price)} × {item.quantity} Units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#1a1a2c] tabular-nums">{fmt(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 border-t-2 border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <Truck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest italic">Standard Marketplace Fulfillment</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-8 py-3 bg-[#1a1a2c] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-slate-200 hover:bg-[#d52245] transition-all active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
