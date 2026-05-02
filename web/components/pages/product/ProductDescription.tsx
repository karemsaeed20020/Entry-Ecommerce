"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";
import { Package, Tag, Star, ChevronLeft, ChevronRight, Loader2, User, ThumbsUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  getProductReviews,
  getMyReviews,
  createReview,
  toggleHelpful,
  type Review,
} from "@/lib/reviewApi";

interface ProductDescriptionProps {
  product?: Product;
  onReviewSubmitted?: () => void;
}

const ProductDescription = ({
  product,
  onReviewSubmitted,
}: ProductDescriptionProps) => {
  const router = useRouter();
  const { isAuthenticated, auth_token } = useUserStore();
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, title: "", comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const brandName = product?.brand
    ? typeof product.brand === "object"
      ? product.brand.name
      : product.brand
    : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch paginated reviews
  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!product?._id) return;
      
      try {
        setLoading(true);
        const data = await getProductReviews(product._id, page);
        
        if (page === 1) {
          setReviews(data.reviews || []);
        } else {
          setReviews((prev) => [...prev, ...(data.reviews || [])]);
        }
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.total || 0);
        setHasMore(page < (data.totalPages || 0));
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    },
    [product?._id]
  );

  // Check if user has reviewed
  const checkUserReview = useCallback(async () => {
    if (!isAuthenticated || !auth_token || !product?._id) return;
    try {
      const data = await getMyReviews(auth_token);
      const hasReviewed = data.reviews?.some(
        (review) => review.product === product._id
      );
      setUserHasReviewed(hasReviewed ?? false);
    } catch (error) {
      console.error("Failed to check user review:", error);
    }
  }, [isAuthenticated, auth_token, product?._id]);

  // Initial load
  useEffect(() => {
    if (product?._id) {
      fetchReviews(1);
      checkUserReview();
    }
  }, [product?._id, fetchReviews, checkUserReview]);

  // Handle helpful vote
  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to mark reviews as helpful", {
        action: { label: "Sign In", onClick: () => router.push("/auth/signin") },
      });
      return;
    }
    try {
      await toggleHelpful(auth_token, reviewId);
      toast.success("Thanks for your feedback!");
      fetchReviews(currentPage);
    } catch (error) {
      console.error("Failed to mark as helpful:", error);
      toast.error("Something went wrong");
    }
  };

  // Submit new review - THIS WILL CLOSE THE SHEET
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to write a review", {
        action: { label: "Sign In", onClick: () => router.push("/auth/signin") },
      });
      return;
    }
    
    if (userHasReviewed) {
      toast.error("You have already reviewed this product");
      setShowReviewSheet(false); // Close sheet
      return;
    }
    
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!newReview.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      await createReview(auth_token, {
        productId: product!._id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
      });
      
      toast.success("Review submitted successfully!");

      // Reset form
      setNewReview({ rating: 0, title: "", comment: "" });
      
      // CLOSE THE SHEET
      setShowReviewSheet(false);
      
      // Update UI - button will disappear
      setUserHasReviewed(true);
      
      // Refresh reviews
      await fetchReviews(1);
      
      // Call parent callback
      onReviewSubmitted?.();
      
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast.error(error?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Star rating component for form
  const StarRating = ({ rating, onRatingChange, hoverRating, onHoverChange, disabled = false }: any) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onRatingChange(star)}
          onMouseEnter={() => !disabled && onHoverChange(star)}
          onMouseLeave={() => !disabled && onHoverChange(0)}
          className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  // Rating breakdown
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const rating = Number(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  });

  if (!mounted) {
    return (
      <div className="w-full space-y-8">
        <div className="h-96 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Description Section */}
      <section id="description" className="scroll-mt-20">
        <div className="bg-background border border-border/50 shadow-sm rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Package className="text-primary" size={24} />
            </div>
            Product Description
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/85 leading-relaxed text-base">
              {product?.description || "No description available for this product."}
            </p>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specifications" className="scroll-mt-20">
        <div className="bg-background border border-border/50 shadow-sm rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Tag className="text-primary" size={24} />
            </div>
            Product Specifications
          </h2>
          <div className="bg-muted/30 rounded-xl border border-border/50 overflow-hidden">
            <div className="divide-y divide-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 p-5">
                <span className="font-medium text-foreground mb-1 md:mb-0">Product Name</span>
                <span className="text-foreground/80">{product?.name || "N/A"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 p-5">
                <span className="font-medium text-foreground mb-1 md:mb-0">Price</span>
                <span className="text-foreground font-semibold text-lg">${product?.price || "N/A"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 p-5">
                <span className="font-medium text-foreground mb-1 md:mb-0">Stock Status</span>
                <span className={`font-medium ${product?.stock && product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {product?.stock && product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
              </div>
              {product?.category && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5">
                  <span className="font-medium text-foreground mb-1 md:mb-0">Category</span>
                  <span className="text-foreground/80">{product.category.name}</span>
                </div>
              )}
              {brandName && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5">
                  <span className="font-medium text-foreground mb-1 md:mb-0">Brand</span>
                  <span className="text-foreground/80">{brandName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION - Displayed directly on page */}
      <section id="reviews" className="scroll-mt-20">
        <div className="bg-background border border-border/50 shadow-sm rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Star className="text-primary" size={24} />
              </div>
              Customer Reviews ({totalReviews})
            </h2>

            {/* Write Review Button - Hidden after user reviews */}
            {isAuthenticated && !userHasReviewed && (
              <Button onClick={() => setShowReviewSheet(true)} className="shadow-md font-semibold">
                <Star size={18} className="mr-2" />
                Write a Review
              </Button>
            )}

            {/* Show "Reviewed" badge after user submits */}
            {userHasReviewed && (
              <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full font-medium">
                ✓ You've reviewed this product
              </div>
            )}

            {/* Sign in button for non-auth users */}
            {!isAuthenticated && (
              <Button onClick={() => router.push("/auth/signin")} variant="outline">
                Sign in to Review
              </Button>
            )}
          </div>

          {/* Rating Statistics */}
          {totalReviews > 0 && (
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl border border-border/30">
                  <div className="text-6xl font-extrabold text-foreground mb-3">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={22}
                        className={i < Math.round(averageRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingCounts[rating - 1];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground w-12">{rating} ★</span>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {loading && reviews.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-muted rounded-lg border border-muted-foreground/20 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Star size={48} className="text-muted-foreground/40" />
                <p className="text-foreground/70">No reviews yet. Be the first to share your experience!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-background rounded-xl border border-border/50 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{review.user?.name || "Anonymous"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < Number(review.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>}
                  <p className="text-foreground/80 leading-relaxed text-sm mb-3">{review.comment}</p>
                  <button
                    onClick={() => handleHelpful(review._id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful ({review.helpful?.length || 0})
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && reviews.length > 0 && (
            <div className="text-center pt-6">
              <Button variant="outline" onClick={() => fetchReviews(currentPage + 1)}>
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* REVIEW FORM SHEET - Opens when clicking "Write a Review" */}
      <Sheet open={showReviewSheet} onOpenChange={setShowReviewSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">Write a Review</SheetTitle>
            <SheetDescription>
              Share your experience with <strong className="text-primary">{product?.name}</strong>
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Your Rating *</label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating: number) => setNewReview({ ...newReview, rating })}
                hoverRating={hoverRating}
                onHoverChange={setHoverRating}
              />
            </div>

            <div>
              <label htmlFor="review-title" className="block text-sm font-semibold mb-2 text-foreground">
                Review Title (Optional)
              </label>
              <input
                type="text"
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-semibold mb-2 text-foreground">
                Your Review *
              </label>
              <textarea
                id="review-comment"
                rows={5}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="What did you like or dislike about this product?"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowReviewSheet(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProductDescription;