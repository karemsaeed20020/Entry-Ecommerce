import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  Settings,
  Menu,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "../../lib/utils";
import useAuthStore from "../../store/useAuthStore";

type SellerSidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const navItems = [
  { to: "/seller", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/seller/products", icon: ShoppingBag, label: "My Products" },
  { to: "/seller/orders", icon: Package, label: "Orders" },
  { to: "/seller/analytics", icon: TrendingUp, label: "Analytics" },
  { to: "/seller/profile", icon: Store, label: "Store Profile" },
  { to: "/seller/settings", icon: Settings, label: "Settings" },
];

export default function SellerSidebar({ open, setOpen }: SellerSidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 bg-[#0f172a] lg:bg-transparent border-b border-white/5 lg:border-none shadow-sm lg:shadow-none shrink-0 relative mt-2">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-2.5 pl-2"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                <Store size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-white tracking-tight">Seller Hub</span>
                <span className="text-[10px] text-emerald-400/80 font-medium">Manage Your Store</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!open && (
          <div className="flex items-center justify-center w-full">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <Store size={18} className="text-white" />
            </div>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-50 bg-white border border-slate-200 rounded-full shadow-sm"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-500 p-0"
          >
            {open ? (
              <ChevronLeft size={14} strokeWidth={2} />
            ) : (
              <ChevronRight size={14} strokeWidth={2} />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-[#0f172a] text-white">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden my-0.5",
                  "hover:bg-white/5",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-white/60 hover:text-white",
                  open ? "px-3" : "justify-center px-0 w-14 mx-auto"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="seller-nav-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "relative z-10 transition-colors duration-200",
                      open && "mr-3",
                      isActive
                        ? "text-emerald-400"
                        : "text-white/60 group-hover:text-white"
                    )}
                  >
                    <item.icon size={20} />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: -10, width: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className={cn(
                          "relative z-10 font-medium truncate whitespace-nowrap overflow-hidden transition-colors",
                          isActive
                            ? "text-white"
                            : "text-white/60 group-hover:text-white"
                        )}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer - User Info + Logout */}
      <div className="p-4 border-t border-white/10 bg-[#0f172a] shrink-0">
        <motion.div
          className={cn(
            "flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-white/5 border border-white/10",
            open ? "justify-start" : "justify-center"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-semibold overflow-hidden shadow-md ring-2 ring-white/20 shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                className="flex flex-col min-w-0 flex-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </span>
                <span className="text-xs text-emerald-400/80 font-medium px-2 py-0.5 rounded-md w-fit mt-0.5 bg-emerald-500/10">
                  Seller
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size={open ? "default" : "icon"}
            onClick={logout}
            className={cn(
              "w-full border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all backdrop-blur-sm font-medium",
              !open && "justify-center"
            )}
          >
            <LogOut
              size={16}
              strokeWidth={1.5}
              className={cn(open && "mr-2")}
            />
            {open && "Logout"}
          </Button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="default"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl bg-gradient-to-br from-[#0f172a] to-slate-800 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
      >
        <Menu size={22} />
      </Button>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-20 flex-col bg-[#0f172a] shadow-xl"
        initial={false}
        animate={{
          width: open ? 260 : 80,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          type: "tween",
        }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={open && isMobile} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-[#0f172a]">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
