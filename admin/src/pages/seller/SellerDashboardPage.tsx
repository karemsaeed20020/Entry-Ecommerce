import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Package, DollarSign, TrendingUp,
  Clock, CheckCircle, ArrowUpRight, BarChart3, Eye,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

interface DashboardStats {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalSoldItems: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function SellerDashboardPage() {
  const { axiosPrivate, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sellerRes] = await Promise.all([
          axiosPrivate.get("/sellers/dashboard/stats"),
          axiosPrivate.get("/sellers/me"),
        ]);
        setStats(statsRes.data);
        setSellerInfo(sellerRes.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosPrivate]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const cards = stats ? [
    { title: "Total Products", value: stats.totalProducts, icon: ShoppingBag, grad: "from-blue-500 to-blue-600" },
    { title: "Approved", value: stats.approvedProducts, icon: CheckCircle, grad: "from-emerald-500 to-emerald-600" },
    { title: "Pending", value: stats.pendingProducts, icon: Clock, grad: "from-amber-500 to-orange-500" },
    { title: "Revenue", value: fmt(stats.totalRevenue), icon: DollarSign, grad: "from-violet-500 to-purple-600" },
    { title: "Items Sold", value: stats.totalSoldItems, icon: TrendingUp, grad: "from-rose-500 to-pink-600" },
    { title: "Orders", value: stats.totalOrders, icon: Package, grad: "from-cyan-500 to-teal-600" },
  ] : [];

  return (
    <motion.div className="space-y-6 max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-slate-800 to-slate-900 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-400 mt-1.5 text-sm">
              {sellerInfo?.storeName ? `Here's what's happening with ${sellerInfo.storeName} today.` : "Your seller dashboard overview."}
            </p>
          </div>
          {sellerInfo && (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {sellerInfo.storeName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{sellerInfo.storeName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium capitalize">{sellerInfo.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-slate-200 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Product", icon: ShoppingBag, href: "/seller/products", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
              { label: "View Orders", icon: Package, href: "/seller/orders", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
              { label: "Analytics", icon: TrendingUp, href: "/seller/analytics", color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
              { label: "Store Profile", icon: Eye, href: "/seller/profile", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
            ].map((a) => (
              <a key={a.label} href={a.href} className={`flex items-center gap-3 p-4 rounded-xl ${a.color} transition-all group`}>
                <a.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{a.label}</span>
                <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> Performance
          </h2>
          {stats && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Approval Rate</span>
                  <span className="font-semibold">{stats.totalProducts > 0 ? `${Math.round((stats.approvedProducts / stats.totalProducts) * 100)}%` : "N/A"}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" initial={{ width: 0 }}
                    animate={{ width: stats.totalProducts > 0 ? `${(stats.approvedProducts / stats.totalProducts) * 100}%` : "0%" }}
                    transition={{ duration: 1, delay: 0.5 }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{stats.totalSoldItems}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Sold</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{stats.totalSoldItems > 0 ? `$${Math.round(stats.totalRevenue / stats.totalSoldItems)}` : "$0"}</p>
                  <p className="text-xs text-slate-500 mt-1">Avg. Price</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">Lifetime Revenue</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{fmt(stats.totalRevenue)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
