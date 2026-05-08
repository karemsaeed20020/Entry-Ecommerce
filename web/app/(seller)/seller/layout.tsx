"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SellerDashboardLayout from "@/components/layouts/SellerDashboardLayout";
import { useUserStore } from "@/lib/store";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, authUser, auth_token, verifyAuth } = useUserStore();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) {
        await verifyAuth();
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !authUser)) {
      router.replace("/auth/signin");
      return;
    }
    // Check if user is a seller
    if (!authLoading && authUser && authUser.role !== "seller") {
      router.replace("/user/dashboard");
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authUser || authUser.role !== "seller") {
    return null;
  }

  return <SellerDashboardLayout>{children}</SellerDashboardLayout>;
}
