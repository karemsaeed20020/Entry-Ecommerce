"use client";

import { ShoppingBag, CheckCircle, Clock, DollarSign, TrendingUp, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatsGridProps {
  stats: any;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const cards = stats ? [
    { title: "Total Products", value: stats.totalProducts, icon: ShoppingBag, color: "text-[#1a1a2c]", bg: "bg-slate-50" },
    { title: "Approved", value: stats.approvedProducts, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Pending", value: stats.pendingProducts, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Total Revenue", value: fmt(stats.totalRevenue), icon: DollarSign, color: "text-[#d52245]", bg: "bg-[#fbe9ec]" },
    { title: "Items Sold", value: stats.totalSoldItems, icon: TrendingUp, color: "text-[#1a1a2c]", bg: "bg-slate-50" },
    { title: "Total Orders", value: stats.totalOrders, icon: Package, color: "text-[#1a1a2c]", bg: "bg-slate-50" },
  ] : [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <Card key={card.title} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {card.value}
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a1a2c] w-[65%] rounded-full" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase">65% Target</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
