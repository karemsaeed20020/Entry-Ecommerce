"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/lib/store";
import { fetchWithConfig } from "@/lib/config";

// Containers
import WelcomeBanner from "./_containers/WelcomeBanner";
import StatsGrid from "./_containers/StatsGrid";
import QuickActions from "./_containers/QuickActions";
import PerformanceOverview from "./_containers/PerformanceOverview";

interface DashboardStats {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalSoldItems: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sellerData] = await Promise.all([
          fetchWithConfig<any>("/sellers/dashboard/stats"),
          fetchWithConfig<any>("/sellers/me"),
        ]);
        setStats(statsData);
        setSellerInfo(sellerData.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <WelcomeBanner sellerInfo={sellerInfo} />
      
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <PerformanceOverview stats={stats} />
      </div>
    </div>
  );
}
