"use client";

import React from "react";
import { Eye, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";
import WishlistButton from "./WishlistButton";
import { useCompareStore } from "@/lib/compareStore";

interface ProductCardActionsProps {
  product: Product;
}

const ActionBtn = ({
  children,
  title,
  onClick,
  className,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  active?: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-white hover:border-accent hover:shadow-md transition-all duration-200 active:scale-95",
          active && "bg-accent text-white border-accent",
          className
        )}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="left" className="font-medium">
      <p>{title}</p>
    </TooltipContent>
  </Tooltip>
);

const ProductCardActions = ({ product }: ProductCardActionsProps) => {
  const router = useRouter();
  const { addToCompare, removeFromCompare, isInCompare, compareItems, toggleDrawer } =
    useCompareStore();

  const inCompare = isInCompare(product._id);
  const isFull = compareItems.length >= 4 && !inCompare;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Already in compare → remove it
    if (inCompare) {
      removeFromCompare(product._id);
      toast.info("Removed from compare", {
        description: `${product.name.substring(0, 40)}${product.name.length > 40 ? "…" : ""} removed.`,
        duration: 2000,
      });
      return;
    }

    // List is full → warn
    if (isFull) {
      toast.error("Compare list is full", {
        description: "Remove a product before adding another (max 4).",
        duration: 3000,
      });
      return;
    }

    // Add to compare and open the drawer
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.slug || product._id}`);
  };

  return (
    <TooltipProvider>
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
        {/* Wishlist */}
        <WishlistButton
          product={product}
          className="h-9 w-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-white hover:border-accent hover:shadow-md transition-all duration-200 active:scale-95"
        />

        {/* Compare — now fully wired */}
        <ActionBtn
          title={
            inCompare
              ? "Remove from compare"
              : isFull
              ? "Compare list full (max 4)"
              : "Add to compare"
          }
          onClick={handleCompareClick}
          active={inCompare}
        >
          <GitCompareArrows className="h-4 w-4" />
        </ActionBtn>

        {/* Quick View */}
        <ActionBtn title="Quick View" onClick={handleQuickView}>
          <Eye className="h-4 w-4" />
        </ActionBtn>
      </div>
    </TooltipProvider>
  );
};

export default ProductCardActions;