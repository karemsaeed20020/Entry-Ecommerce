"use client";

import { useUserStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Sparkles, Store, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  sellerInfo: any;
}

export default function WelcomeBanner({ sellerInfo }: WelcomeBannerProps) {
  const { authUser } = useUserStore();

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
      {/* Decorative subtle background icon */}
      <Store className="absolute -right-8 -bottom-8 h-48 w-48 text-slate-50 rotate-12 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-[#d52245]" />
            Seller Portal
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-[#1a1a2c] tracking-tight">
              Welcome back, {authUser?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium max-w-xl leading-relaxed">
              {sellerInfo?.storeName
                ? `Manage ${sellerInfo.storeName}'s products, orders, and business growth from one central hub.`
                : "Your store dashboard is ready. Start by managing your inventory or checking latest orders."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="bg-[#1a1a2c] hover:bg-[#d52245] text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all duration-300">
              <Link href="/seller/products">
                Add New Product
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all duration-300">
              <Link href="/" target="_blank">
                View Shop
                <ExternalLink className="ml-2 h-4 w-4 opacity-50" />
              </Link>
            </Button>
          </div>
        </div>

        {sellerInfo && (
          <div className="flex flex-col items-center gap-4 bg-slate-50 rounded-2xl p-6 border border-slate-200 w-full sm:w-64">
            <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#1a1a2c] text-3xl font-black shadow-sm">
              {sellerInfo.storeName?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-[#1a1a2c] font-bold text-lg">{sellerInfo.storeName}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{sellerInfo.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
