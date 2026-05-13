import { useState } from "react";
import SellerSidebar from "../seller/SellerSidebar";
import SellerHeader from "../seller/SellerHeader";
import { cn } from "../../lib/utils";
import { Outlet } from "react-router-dom";

export default function SellerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out overflow-hidden shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-none bg-slate-50",
          "lg:ml-20",
          sidebarOpen && "lg:ml-[260px]"
        )}
      >
        <SellerHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
