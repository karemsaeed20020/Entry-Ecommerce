"use client";

import React, { useState, useEffect } from "react";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Button } from "@/components/ui/button";
import {
  Star,
  Eye,
  FileQuestion,
  Share2,
  Package,
  Tag,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Link as LinkIcon,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  GitCompareArrows,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackProductView } from "@/lib/productApi";
import { useCartStore, useUserStore } from "@/lib/store";
import { Product } from "@/lib/types";
import WishlistButton from "@/components/common/products/WishlistButton";
import CompareButton from "@/components/common/CompareButton";

interface ProductDetailsClientProps {
  product: Product;
  discountedPrice: number;
}

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({
  product,
  discountedPrice,
}) => {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(product.viewCount || 0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // CRITICAL FIX: Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  const { addToCart, isInCart } = useCartStore();
  const { isAuthenticated, auth_token } = useUserStore();
  
  const stock = product?.stock ?? 0;
  const inCart = isInCart(product._id);

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track product view on component mount
  useEffect(() => {
    const trackView = async () => {
      try {
        const result = await trackProductView(product._id);
        if (result && typeof result === "object" && "viewCount" in result) {
          setViewCount(result.viewCount as number);
        }
      } catch (error) {
        console.warn("Failed to track product view:", error);
      }
    };

    trackView();
  }, [product._id]);

  // Quantity controls
  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQuantity = () => setQuantity((q) => Math.min(stock, q + 1));

  // Auth guard
  const requireAuth = () => {
    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to continue", {
        action: {
          label: "Sign In",
          onClick: () =>
            router.push(
              `/auth/signin?redirect=/product/${product.slug || product._id}`
            ),
        },
        duration: 4000,
      });
      return false;
    }
    return true;
  };

  const handleAskQuestion = () => {
    router.push("/help");
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!requireAuth()) return;
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      setAddedToCart(true);
      toast.success("Added to cart!", {
        description: `${quantity} × ${product.name.substring(0, 40)}${product.name.length > 40 ? "…" : ""}`,
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
        duration: 4000,
      });
      setTimeout(() => setAddedToCart(false), 3000);
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Buy now handler
  const handleBuyNow = async () => {
    if (!requireAuth()) return;
    if (isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      await addToCart(product, quantity);
      toast.success("Product added to cart! Redirecting...");
      router.push("/user/cart");
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      toast.error("Failed to add product to cart. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const productUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareText = `Check out ${product.name} - ${product.description?.substring(0, 100)}...`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
    instagram: `https://www.instagram.com/`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "instagram") {
      toast.info(
        "Instagram doesn't support direct sharing. Link copied to clipboard!"
      );
      handleCopyLink();
    } else {
      window.open(shareLinks[platform], "_blank", "width=600,height=400");
      setShareOpen(false);
    }
  };

  // Determine button color based on cart status
  const getAddToCartButtonColor = () => {
    if (isAddingToCart) return "bg-gray-500 hover:bg-gray-600";
    if (addedToCart || inCart) return "bg-green-600 hover:bg-green-700";
    return "bg-foreground hover:bg-foreground/90";
  };

  // Don't render the actual button content until mounted on client
  // This prevents hydration mismatch between server and client
  if (!mounted) {
    // Return a skeleton/placeholder that matches server render
    return (
      <TooltipProvider>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight flex-1">
            {product?.name}
          </h1>
          <div className="p-2 rounded-full bg-muted w-10 h-10" />
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <p className="text-sm font-semibold text-foreground">QUANTITY</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <div className="w-10 h-10 bg-muted" />
              <div className="w-12 h-10 bg-muted" />
              <div className="w-10 h-10 bg-muted" />
            </div>
            <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="flex items-start gap-5 justify-between border-y border-muted-foreground/30 py-5">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded-lg animate-pulse" />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      {/* Product Name with Heart Icon */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight flex-1">
          {product?.name}
        </h1>
        <WishlistButton
          product={product}
          className="p-2 rounded-full hover:bg-muted transition-colors shrink-0"
        />
      </div>
      
      {/* Quantity Section */}
      <div className="flex flex-col gap-3 pt-2">
        <p className="text-sm font-semibold text-foreground">QUANTITY</p>

        <div className="flex items-center gap-4">
          {/* Quantity stepper */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1 || stock === 0}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-foreground border-x border-border select-none">
              {quantity}
            </span>

            <button
              onClick={increaseQuantity}
              disabled={quantity >= stock || stock === 0}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button - dynamic color based on cart status */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || stock === 0}
            className={`flex-1 h-10 text-sm font-semibold rounded-lg text-white transition-all duration-300 ${getAddToCartButtonColor()}`}
          >
            {isAddingToCart ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Adding…</>
            ) : addedToCart || inCart ? (
              <><Check className="w-4 h-4 mr-2" /> Added to Cart</>
            ) : (
              <><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</>
            )}
          </Button>
        </div>

        {/* Wishlist + Compare buttons */}
        <div className="flex items-center gap-3 pt-2">
         
        </div>
      </div>

      {/* Price and Rating */}
      <div className="flex items-start gap-5 justify-between border-y border-muted-foreground/30 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {product?.discountPercentage && product.discountPercentage > 0 ? (
              <>
                <PriceFormatter
                  amount={discountedPrice}
                  className="text-primary text-3xl font-extrabold tracking-tight"
                />
                <PriceFormatter
                  amount={product.price}
                  className="text-muted-foreground line-through font-medium text-lg opacity-70"
                />
              </>
            ) : (
              <PriceFormatter
                amount={product?.price}
                className="text-foreground text-3xl font-extrabold tracking-tight"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                stock > 0 ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <p className="text-sm font-medium text-muted-foreground">
              {stock > 0 ? `${stock} items in stock` : "Out of stock"}
            </p>
          </div>
        </div>
      </div>

      {/* Product Description Preview */}
      <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <FileQuestion size={16} className="text-primary" />
          About This Product
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
          {product?.description || "No description available for this product."}
        </p>
      </div>

      {/* Product Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        {product?.category && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-muted-foreground/10">
            <Package className="text-primary mt-0.5 shrink-0" size={18} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium text-foreground text-sm truncate">
                {typeof product.category === "object"
                  ? product.category.name
                  : product.category}
              </p>
            </div>
          </div>
        )}
        {product?.brand && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-muted-foreground/10">
            <Tag className="text-primary mt-0.5 shrink-0" size={18} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Brand</p>
              <p className="font-medium text-foreground text-sm truncate">
                {typeof product.brand === "object"
                  ? product.brand.name
                  : product.brand}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User View Counter */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="bg-primary/10 rounded-full p-2">
          <Eye className="text-primary shrink-0" size={18} />
        </div>
        <p className="text-sm">
          <span className="font-semibold text-foreground">{viewCount}</span>{" "}
          <span className="text-muted-foreground">
            {viewCount === 1 ? "person has viewed" : "people have viewed"} this
            product
          </span>
        </p>
      </div>

      {/* Buy Now + Ask Question + Share Row */}
      <div className="flex items-center gap-3 flex-wrap pt-2">
        {/* Buy Now button */}
        <Button
          onClick={handleBuyNow}
          disabled={isBuyingNow || stock === 0}
          className="flex-1 h-10 bg-foreground hover:bg-foreground/90 text-background text-sm font-semibold rounded-lg transition-all duration-300"
        >
          {isBuyingNow ? (
            <><div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" /> Please wait…</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" /> Buy Now</>
          )}
        </Button>

        {/* Ask Question button */}
        <button
          onClick={handleAskQuestion}
          className="flex items-center gap-2 px-4 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted hover:border-primary/40 hover:text-primary transition-all duration-200"
        >
          <FileQuestion className="w-4 h-4" />
          Ask Question
        </button>

        {/* Share button with popover */}
        <Popover open={shareOpen} onOpenChange={setShareOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-4 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted hover:border-primary/40 hover:text-primary transition-all duration-200">
              <Share2 size={18} />
              Share
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Share this product
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                >
                  <Facebook size={18} />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors"
                >
                  <Twitter size={18} />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  <Linkedin size={18} />
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare("instagram")}
                  className="flex items-center gap-2 p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg transition-colors"
                >
                  <Instagram size={18} />
                  <span className="text-sm font-medium">Instagram</span>
                </button>
              </div>
              <div className="pt-2 border-t border-muted-foreground/20">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 p-3 bg-muted hover:bg-muted-foreground/20 text-foreground rounded-lg transition-colors w-full"
                >
                  {copied ? (
                    <>
                      <Check size={18} className="text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Link Copied!
                      </span>
                    </>
                  ) : (
                    <>
                      <LinkIcon size={18} />
                      <span className="text-sm font-medium">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
};

export default ProductDetailsClient;