"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Heart,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  Award,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import {
  useUserStore,
  useCartStore,
  useWishlistStore,
  useOrderStore,
} from "@/lib/store";
import { useRouter } from "next/navigation";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Order } from "@/lib/orderApi";

/* ─── Helpers ─── */
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function getMonthlySpend(orders: Order[]) {
  const now = new Date();
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const total = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      })
      .reduce((s, o) => s + (o.total || 0), 0);
    months.push({ label, total });
  }
  return months;
}

function getCategoryBreakdown(orders: Order[]) {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const cat = (item as { category?: string }).category || "Uncategorised";
      map[cat] = (map[cat] || 0) + item.price * item.quantity;
    });
  });
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

const BAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

/* ─── Skeleton ─── */
function AnalyticsSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} text-white p-2.5 rounded-xl shadow-sm`}>{icon}</div>
        {trend === "up" && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" /> Up
          </span>
        )}
        {trend === "down" && (
          <span className="flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
            <TrendingDown className="w-3 h-3" /> Down
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} id={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

/* ─── Bar Chart ─── */
function MiniBarChart({ data }: { data: { label: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((d, i) => {
        const pct = Math.max((d.total / max) * 100, d.total > 0 ? 8 : 2);
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1.5">
            <span className="text-[9px] text-gray-400 font-medium truncate">
              {d.total > 0 ? `$${Math.round(d.total)}` : ""}
            </span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-700 min-h-[4px]"
              style={{ height: `${pct}%` }}
            />
            <span className="text-[9px] text-gray-500 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function UserAnalyticsPage() {
  const { authUser, auth_token } = useUserStore();
  const { cartItems } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const { orders, loadOrders } = useOrderStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!auth_token) { router.push("/auth/signin"); return; }
      try { await loadOrders(auth_token); } catch { /* silent */ }
      finally { setLoading(false); }
    };
    init();
  }, [auth_token, router, loadOrders]);

  /* Derived stats */
  const totalSpent = useMemo(
    () => orders.reduce((s, o) => s + (o.total || 0), 0),
    [orders],
  );
  const delivered = useMemo(
    () => orders.filter((o) => o.status === "delivered" || o.status === "completed").length,
    [orders],
  );
  const pending = useMemo(
    () => orders.filter((o) => o.status === "pending" || o.status === "processing").length,
    [orders],
  );
  const cancelled = useMemo(
    () => orders.filter((o) => o.status === "cancelled").length,
    [orders],
  );
  const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
  const monthlyData = useMemo(() => getMonthlySpend(orders), [orders]);
  const categoryData = useMemo(() => getCategoryBreakdown(orders), [orders]);
  const recentOrders = useMemo(() => [...orders].reverse().slice(0, 5), [orders]);

  /* Badges */
  const badges = [];
  if (orders.length >= 1) badges.push({ icon: "🛍️", label: "First Purchase" });
  if (orders.length >= 5) badges.push({ icon: "⭐", label: "Regular Shopper" });
  if (orders.length >= 10) badges.push({ icon: "💎", label: "VIP Member" });
  if (totalSpent >= 500) badges.push({ icon: "🏆", label: "High Spender" });
  if (delivered >= 3) badges.push({ icon: "✅", label: "Trusted Buyer" });

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
    processing: { label: "Processing", color: "bg-purple-100 text-purple-700", icon: <RefreshCw className="w-3 h-3" /> },
    shipped: { label: "Shipped", color: "bg-cyan-100 text-cyan-700", icon: <Truck className="w-3 h-3" /> },
    delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" /> },
    completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { label: "Cancelled", color: "bg-rose-100 text-rose-700", icon: <XCircle className="w-3 h-3" /> },
  };

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          My Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          A personal overview of your shopping activity on Entry.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Spent"
          value={<PriceFormatter amount={totalSpent} />}
          sub={`Avg ${formatCurrency(avgOrderValue)} / order`}
          color="bg-violet-500"
          href="/user/orders"
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Total Orders"
          value={orders.length}
          sub={`${delivered} delivered`}
          trend={orders.length > 0 ? "up" : "neutral"}
          color="bg-blue-500"
          href="/user/orders"
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5" />}
          label="Cart Items"
          value={cartItems.length}
          sub="Items waiting for you"
          color="bg-emerald-500"
          href="/user/cart"
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="Wishlist"
          value={wishlistIds.length}
          sub="Saved products"
          color="bg-rose-500"
          href="/user/wishlist"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Monthly Spending</h3>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-violet-500" />
          </div>
          {monthlyData.every((m) => m.total === 0) ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
              No spending data yet
            </div>
          ) : (
            <MiniBarChart data={monthlyData} />
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Order Breakdown</h3>
              <p className="text-xs text-gray-400">Status distribution</p>
            </div>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          {orders.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
              No orders placed yet
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Delivered / Completed", count: delivered, color: "bg-emerald-500" },
                { label: "Pending / Processing", count: pending, color: "bg-amber-500" },
                { label: "Cancelled", count: cancelled, color: "bg-rose-500" },
                {
                  label: "Other",
                  count: orders.length - delivered - pending - cancelled,
                  color: "bg-blue-400",
                },
              ]
                .filter((s) => s.count > 0)
                .map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-600 shrink-0">{s.label}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color} transition-all duration-700`}
                        style={{ width: `${(s.count / orders.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-700 w-6 text-right">
                      {s.count}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Top Categories Purchased</h3>
              <p className="text-xs text-gray-400">By total spend</p>
            </div>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-3">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                />
                <div className="w-32 text-xs text-gray-600 truncate shrink-0">{c.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-700`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-gray-700 w-10 text-right">
                  {c.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements / Badges */}
      {badges.length > 0 && (
        <div className="bg-gradient-to-br from-[#1a1a2c] to-[#2d2d4e] rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Your Achievements</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white"
              >
                <span>{b.icon}</span>
                <span className="font-medium text-xs">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-gray-800 text-sm">Recent Orders</h3>
          </div>
          <Link
            href="/user/orders"
            id="analytics-view-all-orders"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center text-gray-400 gap-3">
            <ShoppingBag className="w-10 h-10" />
            <p className="text-sm">No orders yet. Start shopping!</p>
            <Link
              href="/shop"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => {
              const s = statusConfig[order.status] ?? statusConfig["pending"];
              return (
                <Link
                  key={order._id}
                  href={`/user/orders/${order._id}`}
                  id={`recent-order-${order._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatDate(order.createdAt)} · {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${s.color}`}
                    >
                      {s.icon}
                      {s.label}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      <PriceFormatter amount={order.total || 0} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
