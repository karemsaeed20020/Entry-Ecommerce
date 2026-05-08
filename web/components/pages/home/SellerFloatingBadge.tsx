"use client";

import { useUserStore } from "@/lib/store";
import { Store, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SellerFloatingBadge() {
  const { authUser, isAuthenticated } = useUserStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only if user is authenticated and is a seller
    if (isAuthenticated && authUser && authUser.role === "seller") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isAuthenticated, authUser]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-6 right-6 z-[60]"
      >
        <Link
          href="/seller"
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1 active:scale-95"
        >
          {/* Pulse Effect */}
          <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
          
          <div className="relative h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Store className="h-5 w-5" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Store Panel</span>
            <span className="text-sm font-bold flex items-center gap-1.5">
              Seller Dashboard
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Badge Decor */}
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
