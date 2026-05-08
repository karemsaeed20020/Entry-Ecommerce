import { LogOut, ChevronDown, Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function SellerHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const getInitials = (name?: string) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b border-gray-100 px-4 md:px-6 w-full gap-3">
      {/* Left - Page context */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center lg:hidden">
          <Store size={16} className="text-white" />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: User profile */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">Store Active</span>
        </div>

        <div className="hidden md:block h-8 w-px bg-gray-200 mx-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="User menu"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
                />
              ) : (
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-emerald-100">
                  {getInitials(user?.name)}
                </span>
              )}

              <div className="hidden md:flex flex-col items-start leading-tight text-left">
                <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                  {user?.name ?? "Seller"}
                </span>
                <span className="text-xs text-emerald-600 font-medium">Seller</span>
              </div>

              <ChevronDown
                size={14}
                className="hidden md:block text-gray-400 shrink-0"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/seller/profile")}
              className="cursor-pointer"
            >
              Store Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/seller/settings")}
              className="cursor-pointer"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
