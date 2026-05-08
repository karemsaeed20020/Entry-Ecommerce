"use client";

import { ShoppingBag, Package, TrendingUp, Eye, BarChart3, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function QuickActions() {
  const actions = [
    { label: "Inventory", icon: ShoppingBag, href: "/seller/products", color: "text-[#1a1a2c]", bg: "bg-slate-50", border: "border-slate-100" },
    { label: "Orders", icon: Package, href: "/seller/orders", color: "text-[#d52245]", bg: "bg-[#fbe9ec]", border: "border-[#fbe9ec]" },
    { label: "Analytics", icon: TrendingUp, href: "/seller/analytics", color: "text-[#1a1a2c]", bg: "bg-slate-50", border: "border-slate-100" },
    { label: "Store", icon: Eye, href: "/seller/profile", color: "text-[#1a1a2c]", bg: "bg-slate-50", border: "border-slate-100" },
  ];

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#d52245]" /> Actions
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store Management</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {actions.map((a, idx) => (
            <Link 
              key={a.label}
              href={a.href} 
              className={`flex flex-col gap-3 p-5 rounded-2xl ${a.bg} border ${a.border} hover:bg-white transition-all group active:scale-95 h-full`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm`}>
                  <a.icon className={`h-5 w-5 ${a.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
              <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{a.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
