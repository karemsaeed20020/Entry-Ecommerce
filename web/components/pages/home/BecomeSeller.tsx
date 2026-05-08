"use client";

import Link from "next/link";
import Container from "@/components/common/Container";
import { SellerConfig, isSellerSystemEnabled } from "@/lib/sellerConfig";
import { useUserStore } from "@/lib/store";
import { useAuthSidebarStore } from "@/lib/useAuthSidebarStore";
import { CheckCircle, Store, Package, TrendingUp } from "lucide-react";

interface BecomeSellerProps {
  config: SellerConfig;
  isVendor?: boolean;
}

const BecomeSeller = ({ config, isVendor }: BecomeSellerProps) => {
  const sellerEnabled = isSellerSystemEnabled(config);
  const { authUser } = useUserStore();
  const openLogin = useAuthSidebarStore((state) => state.openLogin);

  // Don't render anything if seller system is disabled
  if (!sellerEnabled) {
    return null;
  }

  // If user is a seller (from SSR prop) or from local auth store, don't show the 'Become a Seller' pitch
  if (isVendor || authUser?.role === "seller") {
    return null;
  }

  return (
    <Container className="relative my-10 overflow-hidden rounded-2xl bg-linear-to-r from-primary to-secondary px-8 py-8 md:px-12 md:py-10 shadow-lg">
      {/* Decorative Grid and Gradients */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      <div className="absolute -top-32 -end-32 w-120 h-120 bg-accent/20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-32 -start-32 w-120 h-120 bg-blue-500/10 blur-3xl rounded-full"></div>

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 text-xs font-medium text-white/90">
          <Store className="w-3.5 h-3.5" />
          <span>Partner with Entry</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
          Start your selling journey today
        </h2>

        <p className="text-gray-300 text-base md:text-lg mb-6 max-w-xl">
          Join thousands of sellers and reach millions of customers. We provide the tools you need to grow your business.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/seller"
            onClick={(e) => {
              if (!authUser) {
                e.preventDefault();
                openLogin();
              }
            }}
            className="group relative inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 hover:bg-accent/90 hover:scale-105"
          >
            Apply Now
            <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/seller-guide"
            className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-medium py-2.5 px-6 rounded-full transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Modern abstract animated illustration */}
      <div className="absolute end-0 top-0 opacity-15 hidden md:block w-1/3 h-full pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Animated floating circles */}
          <circle
            cx="280"
            cy="120"
            r="40"
            fill="currentColor"
            className="animate-pulse"
          />
          <circle
            cx="340"
            cy="240"
            r="60"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="10 10"
            className="animate-spin-slow origin-[340px_240px]"
          />
          <circle
            cx="200"
            cy="280"
            r="25"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-bounce"
            style={{ animationDuration: "3s" }}
          />

          {/* Dynamic wavy line */}
          <path
            d="M100 350 Q 200 300 250 200 T 400 50"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-70"
            style={{
              strokeDasharray: "600",
              strokeDashoffset: "600",
              animation: "dash 4s linear infinite alternate",
            }}
          />

          {/* Floating abstract accent elements */}
          <rect
            x="250"
            y="80"
            width="20"
            height="20"
            fill="currentColor"
            className="animate-spin origin-center"
            style={{ animationDuration: "8s" }}
          />
          <path
            d="M 330 150 L 350 180 L 310 180 Z"
            fill="currentColor"
            className="animate-bounce"
            style={{ animationDuration: "4s" }}
          />

          <style>
            {`
              @keyframes dash {
                to {
                  stroke-dashoffset: 0;
                }
              }
              .animate-spin-slow {
                animation: spin 12s linear infinite;
              }
            `}
          </style>
        </svg>
      </div>
    </Container>
  );
};

export default BecomeSeller;
