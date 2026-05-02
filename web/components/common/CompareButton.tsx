"use client";

import React from "react";
import { GitCompareArrows, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Product } from "@/lib/types";
import { useIsHydrated } from "@/hooks/useHydration";
import { useCompareStore } from "@/lib/compareStore";
import { cn } from "@/lib/utils";

interface CompareButtonProps {
  product: Product;
  className?: string;
  /** When true renders a full button with text label */
  showLabel?: boolean;
}

const CompareButton: React.FC<CompareButtonProps> = ({
  product,
  className = "",
  showLabel = false,
}) => {
  const isHydrated = useIsHydrated();
  const router = useRouter();
  const {
    addToCompare,
    removeFromCompare,
    isInCompare,
    compareItems,
    toggleDrawer,
  } = useCompareStore();

  const inCompare = isInCompare(product._id);
  const isFull = compareItems.length >= 4 && !inCompare;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(product._id);
      toast.info("Removed from compare", {
        description: `${product.name.substring(0, 40)}${product.name.length > 40 ? "…" : ""} removed.`,
        duration: 2000,
      });
      return;
    }

    if (isFull) {
      toast.error("Compare list is full", {
        description: "Remove a product before adding another (max 4).",
        duration: 3000,
      });
      return;
    }

    const added = addToCompare(product);
    if (added) {
      toggleDrawer(true);
      toast.success("Added to compare", {
        description: `${product.name.substring(0, 40)}${product.name.length > 40 ? "…" : ""} added.`,
        action: {
          label: "Compare now",
          onClick: () => router.push("/compare"),
        },
        duration: 4000,
      });
    }
  };

  if (!isHydrated) return null;

  // ── Label variant ─────────────────────────────────────────────────────────
  if (showLabel) {
    return (
      <button
        onClick={handleToggle}
        disabled={isFull}
        aria-label={inCompare ? "Remove from compare" : "Add to compare"}
        className={cn(
          "transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
          inCompare ? "text-accent border-accent/40 bg-accent/5" : "",
          className
        )}
      >
        {inCompare ? (
          <Check className="w-4 h-4" />
        ) : (
          <GitCompareArrows className="w-4 h-4" />
        )}
        <span>{inCompare ? "Comparing" : "Compare"}</span>
      </button>
    );
  }

  // ── Icon-only variant (product cards) ─────────────────────────────────────
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleToggle}
          disabled={isFull}
          aria-label={inCompare ? "Remove from compare" : "Add to compare"}
          className={cn(
            "flex items-center gap-1.5 p-2 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
            inCompare
              ? "bg-accent text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent/10 hover:text-accent",
            className
          )}
        >
          {inCompare ? <Check size={18} /> : <GitCompareArrows size={18} />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium text-xs">
        {inCompare
          ? "Remove from compare"
          : isFull
          ? "Compare list full (max 4)"
          : "Add to compare"}
      </TooltipContent>
    </Tooltip>
  );
};

export default CompareButton;