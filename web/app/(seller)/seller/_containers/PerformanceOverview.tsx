"use client";

import { TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface PerformanceOverviewProps {
  stats: any;
}

export default function PerformanceOverview({ stats }: PerformanceOverviewProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (!stats) return null;

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#d52245]" /> Performance
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            Real-time
            <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="space-y-8">
          {/* Approval Rate */}
          <div className="group">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product Approval Rate</p>
                <h4 className="text-slate-900 font-black text-2xl">
                  {stats.totalProducts > 0 ? `${Math.round((stats.approvedProducts / stats.totalProducts) * 100)}%` : "N/A"}
                </h4>
              </div>
              <ArrowUpRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: stats.totalProducts > 0 ? `${(stats.approvedProducts / stats.totalProducts) * 100}%` : "0%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#1a1a2c] rounded-full shadow-lg shadow-slate-200"
              />
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Avg. Sale</p>
              <p className="text-lg font-black text-[#1a1a2c] group-hover:text-[#d52245] transition-colors">
                {stats.totalSoldItems > 0 ? `$${Math.round(stats.totalRevenue / stats.totalSoldItems)}` : "$0"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total Sales</p>
              <p className="text-lg font-black text-[#1a1a2c] group-hover:text-[#d52245] transition-colors">
                {stats.totalSoldItems}
              </p>
            </div>
          </div>

          {/* Lifetime Revenue */}
          <div className="relative group overflow-hidden">
            <div className="bg-[#1a1a2c] rounded-2xl p-6 text-white shadow-lg shadow-slate-200 transition-all duration-300 group-hover:bg-[#d52245]">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Lifetime Revenue</span>
              </div>
              <p className="text-3xl font-black tracking-tight">
                {fmt(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
