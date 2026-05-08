"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Package, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { fetchWithConfig } from "@/lib/config";

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          fetchWithConfig<any>("/sellers/dashboard/stats"),
          fetchWithConfig<any>("/sellers/products?limit=100"),
        ]);
        setStats(s);
        setProducts(p.products || p.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (loading) return <div className="p-6 space-y-4 animate-pulse"><div className="h-8 w-48 bg-muted rounded-lg" />{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}</div>;

  const topProducts = [...products]
    .filter((p) => p.approvalStatus === "approved")
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);

  const approvalRate = stats?.totalProducts > 0 ? Math.round((stats.approvedProducts / stats.totalProducts) * 100) : 0;
  const avgPrice = products.length > 0 ? products.reduce((s: number, p: any) => s + p.price, 0) / products.length : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-600" /> Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Insights into your store performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: fmt(stats?.totalRevenue || 0), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Items Sold", value: stats?.totalSoldItems || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg. Price", value: fmt(avgPrice), icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Approval Rate", value: `${approvalRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((c) => (
          <div key={c.label} className="bg-background rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
              <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center`}><c.icon className={`h-4 w-4 ${c.color}`} /></div>
            </div>
            <p className="text-xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Product Status Breakdown */}
      <div className="bg-background rounded-xl border border-border p-5">
        <h2 className="text-base font-bold text-foreground mb-4">Product Status Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Approved", count: stats?.approvedProducts || 0, total: stats?.totalProducts || 1, color: "bg-emerald-500" },
            { label: "Pending", count: stats?.pendingProducts || 0, total: stats?.totalProducts || 1, color: "bg-amber-500" },
            { label: "Rejected", count: (stats?.totalProducts || 0) - (stats?.approvedProducts || 0) - (stats?.pendingProducts || 0), total: stats?.totalProducts || 1, color: "bg-red-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.count} / {stats?.totalProducts || 0}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${(item.count / Math.max(item.total, 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-background rounded-xl border border-border p-5">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-emerald-600" /> Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p: any, i: number) => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{i + 1}</span>
                {p.image ? <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{fmt(p.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{p.sold || 0} sold</p>
                  <p className="text-xs text-emerald-600 font-medium">{fmt((p.sold || 0) * p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Insights */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5">
        <h2 className="text-base font-bold text-emerald-800 mb-3">Revenue Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-emerald-600 font-medium">Lifetime Revenue</p>
            <p className="text-2xl font-bold text-emerald-800">{fmt(stats?.totalRevenue || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-medium">Revenue per Product</p>
            <p className="text-2xl font-bold text-emerald-800">{stats?.approvedProducts > 0 ? fmt((stats?.totalRevenue || 0) / stats.approvedProducts) : "$0"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
