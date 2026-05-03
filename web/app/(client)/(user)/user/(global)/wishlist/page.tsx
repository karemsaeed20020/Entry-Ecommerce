"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useUserStore, useWishlistStore, useCartStore } from "@/lib/store";
import { getProductUrl } from "@/lib/productHelpers";
import { Product } from "@/lib/types";
import {
  clearWishlist,
  getUserWishlist,
  getWishlistProducts,
  removeFromWishlist,
} from "@/lib/wishlistApi";

const WishlistPageClient = () => {
  const router = useRouter();
  const { auth_token, isAuthenticated } = useUserStore();
  const {
    wishlistIds,
    clearWishlist: clearStoreWishlist,
    setWishlistIds,
    removeFromWishlist: removeFromLocalWishlist,
  } = useWishlistStore();
  const { addToCart, isInCart } = useCartStore();

  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isMoveAllLoading, setIsMoveAllLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showMoveAllDialog, setShowMoveAllDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasMore: false,
    limit: 10,
  });

  const removingInFlightRef = useRef<Set<string>>(new Set());

  // ── Load wishlist ──────────────────────────────────────────────────────────
  const loadWishlist = useCallback(
    async (page = 1, refreshIds = false) => {
      if (!auth_token) return;
      try {
        setIsLoading(true);
        let ids = wishlistIds;
        if (ids.length === 0 || refreshIds) {
          const r = await getUserWishlist(auth_token);
          if (r.success && r.wishlist) {
            ids = r.wishlist;
            setWishlistIds(ids);
          }
        }
        if (ids.length === 0) {
          setWishlistItems([]);
          setPagination((p) => ({ ...p, totalProducts: 0, totalPages: 1 }));
          return;
        }
        const res = await getWishlistProducts(ids, auth_token, page, 10);
        if (res.success && res.products) {
          setWishlistItems(res.products);
          if (res.pagination) setPagination(res.pagination);
        } else {
          setWishlistItems([]);
        }
      } catch {
        toast.error("Failed to load wishlist");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth_token]
  );

  useEffect(() => {
    if (!isAuthenticated || !auth_token) {
      router.push("/auth/signin?redirect=/user/wishlist");
      return;
    }
    loadWishlist(1, true);
  }, [isAuthenticated, auth_token, router, loadWishlist]);

  // ── Add single item to cart ────────────────────────────────────────────────
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !auth_token) {
      toast.error("Please login to add items to cart", {
        action: { label: "Login", onClick: () => { window.location.href = "/auth/signin"; } },
        duration: 5000,
      });
      return;
    }
    if (isAddingToCart === product._id) return;
    setIsAddingToCart(product._id);
    try {
      await addToCart(product, 1);
      toast.success("Added to cart", {
        description: `${product.name.substring(0, 50)}${product.name.length > 50 ? "…" : ""} added.`,
        action: { label: "View Cart", onClick: () => { window.location.href = "/cart"; } },
        duration: 3000,
      });
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(null);
    }
  };

  // ── Move ALL to cart ───────────────────────────────────────────────────────
  const handleMoveAllToCart = async () => {
    if (!auth_token) return;
    setIsMoveAllLoading(true);
    setShowMoveAllDialog(false);

    const itemsToMove = wishlistItems.filter((p) => !isInCart(p._id));
    let successCount = 0;
    let failCount = 0;

    // Add all items concurrently then clear wishlist
    await Promise.allSettled(
      itemsToMove.map(async (product) => {
        try {
          await addToCart(product, 1);
          successCount++;
        } catch {
          failCount++;
        }
      })
    );

    // Clear wishlist after moving
    if (successCount > 0) {
      try {
        const res = await clearWishlist(auth_token);
        if (res.success) {
          setWishlistItems([]);
          setPagination((p) => ({ ...p, totalProducts: 0, totalPages: 1 }));
          clearStoreWishlist();
          toast.success(`${successCount} item${successCount > 1 ? "s" : ""} moved to cart!`, {
            description: failCount > 0
              ? `${failCount} item${failCount > 1 ? "s" : ""} could not be added.`
              : "Your wishlist has been cleared.",
            action: { label: "View Cart", onClick: () => { window.location.href = "/cart"; } },
            duration: 5000,
          });
        }
      } catch {
        toast.error("Items added to cart but wishlist could not be cleared.");
      }
    } else {
      toast.error("Could not add items to cart. Please try again.");
    }

    setIsMoveAllLoading(false);
  };

  // ── Remove item ────────────────────────────────────────────────────────────
  const handleRemoveItem = async (productId: string, productName: string) => {
    if (removingInFlightRef.current.has(productId) || !auth_token) return;
    removingInFlightRef.current.add(productId);

    // Optimistic
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    setPagination((prev) => ({
      ...prev,
      totalProducts: Math.max(0, prev.totalProducts - 1),
    }));
    setRemovingIds((prev) => new Set(prev).add(productId));
    removeFromLocalWishlist(productId);

    try {
      const response = await removeFromWishlist(productId, auth_token);
      if (response.success) {
        if (response.wishlist) setWishlistIds(response.wishlist);
        toast.success("Removed from wishlist", {
          description: `${productName.substring(0, 50)}${productName.length > 50 ? "…" : ""} removed.`,
          duration: 3000,
        });
      } else {
        toast.error(response.message || "Could not remove from wishlist");
        await loadWishlist(pagination.currentPage, true);
      }
    } catch {
      toast.error("Failed to remove. Please try again.");
      await loadWishlist(pagination.currentPage, true);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      removingInFlightRef.current.delete(productId);
    }
  };

  // ── Clear all ──────────────────────────────────────────────────────────────
  const handleClearWishlist = async () => {
    if (!auth_token) return;
    setIsClearing(true);
    try {
      const res = await clearWishlist(auth_token);
      if (res.success) {
        setWishlistItems([]);
        setPagination((p) => ({ ...p, totalProducts: 0, totalPages: 1 }));
        clearStoreWishlist();
        setShowClearDialog(false);
        toast.success("Wishlist cleared", { duration: 3000 });
      } else {
        toast.error(res.message || "Could not clear wishlist");
      }
    } catch {
      toast.error("Failed to clear wishlist");
    } finally {
      setIsClearing(false);
    }
  };

  // ── Infinite scroll ────────────────────────────────────────────────────────
  const loadMoreItems = useCallback(async () => {
    if (!auth_token || isLoading || !pagination.hasMore) return;
    const nextPage = pagination.currentPage + 1;
    try {
      setIsLoading(true);
      const ids = wishlistIds.length > 0 ? wishlistIds :
        (await getUserWishlist(auth_token)).wishlist || [];
      const res = await getWishlistProducts(ids, auth_token, nextPage, 10);
      if (res.success && res.products) {
        setWishlistItems((prev) => [...prev, ...res.products]);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch {
      console.error("Failed to load more");
    } finally {
      setIsLoading(false);
    }
  }, [auth_token, isLoading, pagination.hasMore, pagination.currentPage, wishlistIds]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500 &&
        !isLoading && pagination.hasMore
      ) loadMoreItems();
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMoreItems, isLoading, pagination.hasMore]);

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading && wishlistItems.length === 0) {
    return (
      <Container className="py-8">
        <PageBreadcrumb items={[{ label: "User", href: "/user/profile" }]} currentPage="Wishlist" showSocialShare={false} />
        <div className="mb-8"><Skeleton className="h-10 w-32 mb-2" /><Skeleton className="h-4 w-48" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="bg-background rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-3/4" />
                <div className="flex justify-between"><Skeleton className="h-6 w-20" /><Skeleton className="h-9 w-9 rounded-full" /></div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (wishlistItems.length === 0 && !isLoading) {
    return (
      <Container className="py-16">
        <div className="bg-background rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
              <Heart className="w-16 h-16 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">Save your favorite items here and come back to them anytime.</p>
            <Link href="/shop">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const itemsNotInCart = wishlistItems.filter((p) => !isInCart(p._id));
  const allInCart = itemsNotInCart.length === 0;

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <Container className="py-8">
      <PageBreadcrumb items={[{ label: "User", href: "/user/profile" }]} currentPage="Wishlist" showSocialShare={false} />

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-500">
            {pagination.totalProducts} {pagination.totalProducts === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* ── Move All to Cart ── */}
          {wishlistItems.length > 0 && (
            <Button
              onClick={() => setShowMoveAllDialog(true)}
              disabled={isMoveAllLoading || allInCart}
              className="rounded-full px-5 gap-2 bg-black hover:bg-gray-800 text-white"
            >
              {isMoveAllLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Moving…</>
              ) : allInCart ? (
                <><CheckCheck className="w-4 h-4" />All in Cart</>
              ) : (
                <><ShoppingBag className="w-4 h-4" />Move All to Cart</>
              )}
            </Button>
          )}

          {/* Clear all */}
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(true)}
              className="rounded-full px-5 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const isRemoving = removingIds.has(product._id);
          const inCart = isInCart(product._id);

          return (
            <div
              key={product._id}
              className="group bg-background rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              style={{
                opacity: isRemoving ? 0.5 : 1,
                transform: isRemoving ? "scale(0.97)" : "scale(1)",
                transition: "opacity 200ms ease, transform 200ms ease",
                pointerEvents: isRemoving ? "none" : "auto",
              }}
            >
              <Link href={getProductUrl(product)} className="block relative">
                <div className="relative h-64 w-full bg-gray-50 overflow-hidden">
                  {product.images?.[0] || product.image ? (
                    <Image
                      src={product.images?.[0] || product.image || ""}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                      -{product.discountPercentage}%
                    </div>
                  )}
                  {/* In-cart badge */}
                  {inCart && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> In Cart
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4 flex flex-col gap-2">
                {(product.averageRating || product.rating) && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.averageRating || product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    {product.numReviews && product.numReviews > 0 && (
                      <span className="text-xs text-gray-500">({product.numReviews})</span>
                    )}
                  </div>
                )}

                <Link href={getProductUrl(product)}>
                  <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-5 hover:text-blue-600 transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {product.discountPercentage && product.discountPercentage > 0 ? (
                      <>
                        <PriceFormatter amount={product.price} className="text-sm font-semibold text-gray-900" />
                        <span className="text-xs text-gray-400 line-through">
                          <PriceFormatter amount={product.price / (1 - product.discountPercentage / 100)} />
                        </span>
                      </>
                    ) : (
                      <PriceFormatter amount={product.price} className="text-base font-semibold text-gray-900" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Add to Cart */}
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={isAddingToCart === product._id || inCart}
                      className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                        inCart
                          ? "text-green-500 bg-green-50"
                          : "text-gray-500 hover:bg-green-100 hover:text-green-600"
                      }`}
                      aria-label={inCart ? "Already in cart" : "Add to cart"}
                    >
                      {isAddingToCart === product._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : inCart ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(product._id, product.name)}
                      disabled={isRemoving}
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && wishlistItems.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 size={20} className="animate-spin" />
            Loading more items...
          </div>
        </div>
      )}

      {!pagination.hasMore && wishlistItems.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You&apos;ve viewed all {pagination.totalProducts} items in your wishlist
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/shop">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* ── Move All Dialog ── */}
      <AlertDialog open={showMoveAllDialog} onOpenChange={setShowMoveAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move All to Cart</AlertDialogTitle>
            <AlertDialogDescription>
              This will add all{" "}
              <strong>{itemsNotInCart.length} item{itemsNotInCart.length > 1 ? "s" : ""}</strong>{" "}
              to your cart and clear your wishlist. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMoveAllToCart}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Move All to Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Clear All Dialog ── */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all items from your wishlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearWishlist}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isClearing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Clearing…</>
              ) : "Clear Wishlist"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default WishlistPageClient;