"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Store,
  ShoppingBag,
  Package,
  TrendingUp,
  Settings,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/common/Container";
import { useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { authUser, logoutUser } = useUserStore();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const navItems: NavItem[] = [
    {
      href: "/seller",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      href: "/seller/products",
      label: "Products",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      href: "/seller/orders",
      label: "Orders",
      icon: <Package className="w-4 h-4" />,
    },
    {
      href: "/seller/analytics",
      label: "Analytics",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      href: "/seller/messages",
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      href: "/seller/returns",
      label: "Returns",
      icon: <RotateCcw className="w-4 h-4" />,
    },
    {
      href: "/seller/profile",
      label: "Store Settings",
      icon: <Store className="w-4 h-4" />,
    },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/seller") return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1a1a2c] text-white">
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-[#d52245] rounded-lg flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform shadow-lg shadow-[#d52245]/20">
            E
          </div>
          <span className="font-bold text-xl tracking-tight">Entry<span className="text-[#d52245]/80">Seller</span></span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 mx-2 mt-4 mb-6 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#d52245] to-[#1a1a2c] p-0.5">
          <div className="h-full w-full rounded-full bg-[#1a1a2c] flex items-center justify-center overflow-hidden">
            {authUser?.avatar ? (
              <Image src={authUser.avatar} alt="avatar" width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <span className="font-bold text-xs">{authUser?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{authUser?.name}</p>
          <p className="text-[10px] text-white/50 font-medium truncate italic">{authUser?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Main Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all group",
                active
                  ? "bg-[#d52245] text-white shadow-lg shadow-[#d52245]/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-white/40 group-hover:text-white")}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-white/5 space-y-1">
        <Link 
          href="/user/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LayoutDashboard className="w-4 h-4 text-white/40" />
          <span>Exit to Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 sticky top-0 h-screen flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Mobile Only */}
        <header className="lg:hidden bg-[#1a1a2c] text-white p-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="font-bold text-lg">Entry<span className="text-[#d52245]">Seller</span></Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
