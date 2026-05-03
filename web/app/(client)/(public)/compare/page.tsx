"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  GitCompareArrows,
  Check,
  X,
  Plus,
  Heart,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/lib/compareStore";
import { useCartStore, useUserStore, useWishlistStore } from "@/lib/store";
import { getProductUrl } from "@/lib/productHelpers";
import { Product } from "@/lib/types";
import { useIsHydrated } from "@/hooks/useHydration";
import { addToWishlist, removeFromWishlist } from "@/lib/wishlistApi";

// ── Star display ─────────────────────────────────────────────────────────────
const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

// ── Best value helper ─────────────────────────────────────────────────────────
const getBestIdx = (vals: (number | null)[], mode: "low" | "high") => {
  const valid = vals
    .map((v, i) => (v !== null && !isNaN(v as number) ? { v: v as number, i } : null))
    .filter(Boolean) as { v: number; i: number }[];
  if (valid.length < 2) return -1;
  return mode === "low"
    ? valid.reduce((a, b) => (b.v < a.v ? b : a)).i
    : valid.reduce((a, b) => (b.v > a.v ? b : a)).i;
};

// ── Spec row ──────────────────────────────────────────────────────────────────
const SpecRow = ({
  label,
  cells,
}: {
  label: string;
  cells: { value: React.ReactNode; best?: boolean }[];
}) => (
  <tr className="border-b border-border">
    <td className="py-4 px-5 text-sm font-semibold text-foreground bg-muted/40 whitespace-nowrap w-40 border-r border-border">
      {label}
    </td>
    {cells.map((cell, i) => (
      <td
        key={i}
        className={`py-4 px-5 text-sm text-center align-middle transition-colors ${
          cell.best ? "bg-green-50/60 dark:bg-green-950/20" : "bg-background"
        }`}
      >
        {cell.value}
      </td>
    ))}
    {/* empty fill columns */}
    {Array.from({ length: Math.max(0, 4 - cells.length) }).map((_, i) => (
      <td key={`ef-${i}`} className="bg-background border-l border-border/40" />
    ))}
  </tr>
);

// ═══════════════════════════════════════════════════════════════════════════════
const ComparePageClient = () => {
  const isHydrated = useIsHydrated();
  const router = useRouter();
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart, isInCart } = useCartStore();
  const { isAuthenticated, auth_token } = useUserStore();
  const {
    wishlistIds,
    addToWishlist: addLocal,
    removeFromWishlist: removeLocal,
  } = useWishlistStore();

  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);
  const [wishLoadingId, setWishLoadingId] = useState<string | null>(null);

  const products = compareItems;
  const n = products.length;

  // ── add to cart ─────────────────────────────────────────────────────────────
  const handleCart = async (product: Product) => {
    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to add to cart");
      return;
    }
    if (cartLoadingId) return;
    setCartLoadingId(product._id);
    try {
      await addToCart(product, 1);
      toast.success("Added to cart", {
        action: { label: "View Cart", onClick: () => router.push("/cart") },
        duration: 3000,
      });
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  // ── wishlist toggle ──────────────────────────────────────────────────────────
  const handleWishlist = async (product: Product) => {
    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to save to wishlist");
      return;
    }
    if (wishLoadingId) return;
    setWishLoadingId(product._id);
    const inWish = wishlistIds.includes(product._id);
    try {
      if (inWish) {
        const res = await removeFromWishlist(product._id, auth_token);
        if (res.success) {
          removeLocal(product._id);
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist(product._id, auth_token);
        if (res.success) {
          addLocal(product);
          toast.success("Added to wishlist");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setWishLoadingId(null);
    }
  };

  // ── derived highlights ───────────────────────────────────────────────────────
  const salePrices = products.map((p) =>
    p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price
  );
  const ratings = products.map((p) => p.averageRating ?? p.rating ?? null);
  const stocks = products.map((p) => p.stock ?? null);

  const bestPrice = getBestIdx(salePrices, "low");
  const bestRating = getBestIdx(ratings as (number | null)[], "high");
  const bestStock = getBestIdx(stocks, "high");

  // ── empty state ──────────────────────────────────────────────────────────────
  if (!isHydrated || n === 0) {
    return (
      <Container className="py-8">
        <PageBreadcrumb
          items={[{ label: "Home", href: "/" }]}
          currentPage="Compare"
          showSocialShare={false}
        />

        <div className="my-16 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <GitCompareArrows className="w-9 h-9 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Compare Products
            </h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              Add up to 4 products to compare their features, prices, and
              ratings side by side to make the best purchasing decision.
            </p>
          </div>
          <Link href="/shop">
            <Button className="rounded-full px-8 gap-2 bg-accent hover:bg-accent/90 text-white">
              <Plus className="w-4 h-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageBreadcrumb
        items={[{ label: "Home", href: "/" }]}
        currentPage="Compare"
        showSocialShare={false}
      />

      {/* Page title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Compare Products
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comparing {n} product{n > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/shop">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              Add more
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="rounded-full gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </Button>
        </div>
      </div>

      {/* ── Comparison table ── */}
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full min-w-[600px] border-collapse">
          <colgroup>
            <col style={{ width: "160px", minWidth: "160px" }} />
            {products.map((_, i) => (
              <col key={i} style={{ width: `${Math.floor(840 / Math.max(n, 1))}px` }} />
            ))}
            {n < 4 && <col />}
          </colgroup>

          {/* ── Product header cards ─────────────────────────────────────── */}
          <thead>
            <tr className="border-b-2 border-border">
              {/* Label column header */}
              <th className="bg-muted/40 border-r border-border" />

              {/* Product columns */}
              {products.map((product) => {
                const inCart = isInCart(product._id);
                const inWish = wishlistIds.includes(product._id);

                return (
                  <th
                    key={product._id}
                    className="px-4 pt-5 pb-4 bg-background border-l border-border/40 align-top"
                  >
                    <div className="flex flex-col items-center gap-3 relative">
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCompare(product._id)}
                        className="absolute -top-1 right-0 p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Remove from compare"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product image */}
                      <Link href={getProductUrl(product)}>
                        <div className="w-[130px] h-[130px] rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden hover:border-accent transition-colors">
                          <Image
                            src={product.images?.[0] || product.image || ""}
                            alt={product.name}
                            width={120}
                            height={120}
                            className="object-contain w-[110px] h-[110px] transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>

                      {/* Product name */}
                      <Link href={getProductUrl(product)}>
                        <h3 className="text-sm font-semibold text-foreground text-center line-clamp-2 leading-snug hover:text-accent transition-colors max-w-[160px]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        {product.discountPercentage && product.discountPercentage > 0 ? (
                          <>
                            <span className="text-base font-bold text-accent">
                              $
                              {(
                                product.price *
                                (1 - product.discountPercentage / 100)
                              ).toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full">
                        {/* Add to cart */}
                        <button
                          onClick={() => handleCart(product)}
                          disabled={inCart || cartLoadingId === product._id}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            inCart
                              ? "bg-green-500 text-white cursor-default"
                              : "bg-accent hover:bg-accent/90 text-white active:scale-95"
                          } disabled:opacity-70`}
                        >
                          {cartLoadingId === product._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : inCart ? (
                            <><Check className="w-3.5 h-3.5" /> In Cart</>
                          ) : (
                            <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                          )}
                        </button>

                        {/* Wishlist */}
                        <button
                          onClick={() => handleWishlist(product)}
                          disabled={wishLoadingId === product._id}
                          className={`p-2 rounded-lg border transition-all duration-200 active:scale-95 ${
                            inWish
                              ? "border-accent/40 bg-accent/10 text-accent"
                              : "border-border text-muted-foreground hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
                          } disabled:opacity-50`}
                          aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {wishLoadingId === product._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Heart
                              className="w-3.5 h-3.5"
                              fill={inWish ? "currentColor" : "none"}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Empty add-product slot */}
              {n < 4 && (
                <th className="px-4 py-5 bg-background border-l border-border/40 align-middle">
                  <Link href="/shop" className="flex flex-col items-center gap-3 group">
                    <div className="w-[130px] h-[130px] rounded-xl border-2 border-dashed border-border flex items-center justify-center group-hover:border-accent transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="w-7 h-7 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors font-medium">
                          Add product
                        </span>
                      </div>
                    </div>
                  </Link>
                </th>
              )}
            </tr>
          </thead>

          {/* ── Spec rows ──────────────────────────────────────────────────── */}
          <tbody>
            {/* Availability */}
            <SpecRow
              label="Availability"
              cells={products.map((p, i) => {
                const stock = p.stock ?? 0;
                return {
                  best: i === bestStock && n > 1,
                  value: (
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        stock > 10
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : stock > 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }`}
                    >
                      {stock > 10
                        ? "In Stock"
                        : stock > 0
                        ? `Only ${stock} left`
                        : "Out of Stock"}
                    </span>
                  ),
                };
              })}
            />

            {/* Price */}
            <SpecRow
              label="Price"
              cells={products.map((p, i) => {
                const sale = p.discountPercentage
                  ? p.price * (1 - p.discountPercentage / 100)
                  : p.price;
                return {
                  best: i === bestPrice && n > 1,
                  value: (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold text-foreground text-sm">
                        ${sale.toFixed(2)}
                      </span>
                      {p.discountPercentage && p.discountPercentage > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                      {i === bestPrice && n > 1 && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5 mt-0.5">
                          <Check className="w-3 h-3" /> Best price
                        </span>
                      )}
                    </div>
                  ),
                };
              })}
            />

            {/* Discount */}
            <SpecRow
              label="Discount"
              cells={products.map((p) => ({
                best: false,
                value: p.discountPercentage && p.discountPercentage > 0 ? (
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    -{p.discountPercentage}%
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                ),
              }))}
            />

            {/* Rating */}
            <SpecRow
              label="Rating"
              cells={products.map((p, i) => {
                const r = p.averageRating ?? p.rating ?? 0;
                return {
                  best: i === bestRating && n > 1,
                  value: (
                    <div className="flex flex-col items-center gap-1">
                      <Stars rating={r} />
                      <span className="text-xs text-muted-foreground">
                        {r > 0 ? `${Number(r).toFixed(1)} / 5` : "No ratings"}
                      </span>
                      {p.numReviews && p.numReviews > 0 && (
                        <span className="text-xs text-muted-foreground/70">
                          ({p.numReviews} reviews)
                        </span>
                      )}
                      {i === bestRating && n > 1 && r > 0 && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Top rated
                        </span>
                      )}
                    </div>
                  ),
                };
              })}
            />

            {/* Category */}
            <SpecRow
              label="Category"
              cells={products.map((p) => ({
                best: false,
                value: (
                  <span className="text-sm text-foreground font-medium">
                    {typeof p.category === "string"
                      ? p.category
                      : p.category?.name || "—"}
                  </span>
                ),
              }))}
            />

            {/* Brand */}
            <SpecRow
              label="Brand"
              cells={products.map((p) => ({
                best: false,
                value: (
                  <span className="text-sm text-foreground font-medium">
                    {typeof p.brand === "string"
                      ? p.brand
                      : p.brand?.name || "—"}
                  </span>
                ),
              }))}
            />

            {/* Description */}
            <SpecRow
              label="Description"
              cells={products.map((p) => ({
                best: false,
                value: (
                  <p className="text-xs text-muted-foreground text-left leading-relaxed line-clamp-3 max-w-[200px] mx-auto">
                    {p.description || "—"}
                  </p>
                ),
              }))}
            />
          </tbody>
        </table>
      </div>

      {/* Bottom nav */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full px-6 gap-2 border-border"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Button>

        {n >= 2 && (
          <p className="text-xs text-muted-foreground">
            🟢 Green highlights indicate the best value in each category
          </p>
        )}
      </div>
    </Container>
  );
};

export default ComparePageClient;