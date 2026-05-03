"use client";

import React, { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Product } from "@/lib/types";
import { useIsHydrated } from "@/hooks/useHydration";
import { useUserStore, useWishlistStore } from "@/lib/store";
import { addToWishlist, removeFromWishlist } from "@/lib/wishlistApi";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  /** When true renders a full button with text label instead of icon-only */
  showLabel?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = "",
  showLabel = false,
}) => {
  const isHydrated = useIsHydrated();
  const { isAuthenticated, auth_token } = useUserStore();
  const {
    wishlistIds,
    addToWishlist: addToLocalWishlist,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(false);

  const isInWishlist = wishlistIds.includes(product._id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !auth_token) {
      toast.error("Please login to save items to your wishlist", {
        description: "You need to be logged in to use the wishlist feature.",
        action: {
          label: "Login",
          onClick: () => { window.location.href = "/auth/signin"; },
        },
        duration: 5000,
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(product._id, auth_token);
        if (response.success) {
          removeFromLocalWishlist(product._id);
          toast.success("Removed from wishlist", {
            description: `${product.name.substring(0, 50)}${product.name.length > 50 ? "…" : ""} removed.`,
            duration: 3000,
          });
        } else {
          toast.error("Failed to remove", {
            description: response.message || "Could not remove from wishlist",
          });
        }
      } else {
        const response = await addToWishlist(product._id, auth_token);
        if (response.success) {
          addToLocalWishlist(product);
          toast.success("Added to wishlist!", {
            description: `${product.name.substring(0, 50)}${product.name.length > 50 ? "…" : ""} saved.`,
            action: {
              label: "View Wishlist",
              onClick: () => { window.location.href = "/user/wishlist"; },
            },
            duration: 4000,
          });
        } else {
          toast.error("Failed to add", {
            description: response.message || "Could not add to wishlist",
          });
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) return null;

  // ── Label variant (product detail page) ──────────────────────────────────
  if (showLabel) {
    return (
      <button
        onClick={handleWishlistToggle}
        disabled={isLoading}
        className={cn(
          "transition-all duration-200 active:scale-[0.98] disabled:opacity-60",
          isInWishlist
            ? "text-accent border-accent/40 bg-accent/5"
            : "",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart
            className="w-4 h-4"
            fill={isInWishlist ? "currentColor" : "none"}
          />
        )}
        <span>{isInWishlist ? "Wishlisted" : "Wishlist"}</span>
      </button>
    );
  }

  // ── Icon-only variant (product card) ─────────────────────────────────────
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-full transition-colors hover:bg-accent hover:text-white",
            isInWishlist
              ? "text-accent bg-accent/10"
              : "text-muted-foreground hover:text-accent",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart
              size={20}
              fill={isInWishlist ? "currentColor" : "none"}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        <p>{isInWishlist ? "Remove from wishlist" : "Save to wishlist"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default WishlistButton;