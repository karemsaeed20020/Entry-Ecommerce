"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, ThumbsUp, User, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import {
  getProductReviews,
  getMyReviews,
  createReview,
  toggleHelpful,
  type Review,
} from "@/lib/reviewApi";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const router = useRouter();
  const { isAuthenticated, auth_token } = useUserStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, title: "", comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch paginated reviews
  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const data = await getProductReviews(productId, page);
        
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
        toast.error("Could not load reviews");
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  // Check if logged-in user has already reviewed this product
  const checkUserReview = useCallback(async () => {
    if (!isAuthenticated || !auth_token) return;
    try {
      const data = await getMyReviews(auth_token);
      const hasReviewed = data.reviews?.some(
        (review) => review.product === productId
      );
      setUserHasReviewed(hasReviewed ?? false);
    } catch (error) {
      console.error("Failed to check user review:", error);
    }
  }, [isAuthenticated, auth_token, productId]);

  // Initial load
  useEffect(() => {
    if (productId) {
      fetchReviews(1);
      checkUserReview();
    }
  }, [productId, fetchReviews, checkUserReview]);

  // Toggle helpful vote
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

  // Submit new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to write a review", {
        action: { label: "Sign In", onClick: () => router.push("/auth/signin") },
        duration: 5000,
      });
      return;
    }
    
    if (userHasReviewed) {
      toast.error("You have already reviewed this product");
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
        productId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
      });
      
      toast.success("Review submitted successfully!");

      // Reset form and close
      setNewReview({ rating: 0, title: "", comment: "" });
      setShowWriteReview(false);
      setUserHasReviewed(true); // This removes the "Write a Review" button immediately
      
      // Refresh reviews from page 1
      await fetchReviews(1);
      
      // Scroll to reviews section
      document.getElementById('reviews-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
      
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast.error(error?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Load more reviews
  const loadMore = () => fetchReviews(currentPage + 1);

  // Star rating selector component
  const StarRating = ({
    rating,
    onRatingChange,
    hoverRating,
    onHoverChange,
    disabled = false,
  }: {
    rating: number;
    onRatingChange: (r: number) => void;
    hoverRating: number;
    onHoverChange: (r: number) => void;
    disabled?: boolean;
  }) => (
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

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="space-y-6" id="reviews-section">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 w-full bg-muted animate-pulse rounded" />
        <div className="h-24 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-8" id="reviews-section">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="reviews-section">
      {/* Reviews Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
          {totalReviews > 0 && (
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({totalReviews}{" "}
                {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {/* Write Review Button - ONLY shown when authenticated AND hasn't reviewed */}
        {isAuthenticated && !userHasReviewed && (
          <Button
            onClick={() => setShowWriteReview(!showWriteReview)}
            variant="outline"
            size="sm"
          >
            {showWriteReview ? "Cancel" : "Write a Review"}
          </Button>
        )}

        {/* Sign in button for non-authenticated users */}
        {!isAuthenticated && (
          <Button
            onClick={() => router.push("/auth/signin")}
            variant="outline"
            size="sm"
          >
            Sign in to Review
          </Button>
        )}

        {/* Badge showing user already reviewed */}
        {userHasReviewed && (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            You've reviewed this product
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && isAuthenticated && !userHasReviewed && (
        <div className="bg-muted/30 rounded-lg p-6 border border-border">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating *</label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                hoverRating={hoverRating}
                onHoverChange={setHoverRating}
              />
            </div>
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Summarize your experience"
              />
            </div>
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium mb-2">
                Your Review *
              </label>
              <textarea
                id="review-comment"
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="What did you like or dislike about this product?"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowWriteReview(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Login Prompt for non-authenticated users when no reviews exist */}
      {!isAuthenticated && reviews.length === 0 && (
        <div className="bg-gradient-to-r from-accent/5 to-purple-500/5 rounded-lg p-6 text-center border border-accent/20">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-md font-semibold text-foreground mb-2">
            Sign in to write a review
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Share your experience with other customers
          </p>
          <Button onClick={() => router.push("/auth/signin")} size="sm">
            Sign In to Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No reviews yet.</p>
          {isAuthenticated && !userHasReviewed && (
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to review this product!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    {review.user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!review.isApproved && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>

              {review.title && (
                <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
              )}

              <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((img, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => handleHelpful(review._id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Helpful ({review.helpful?.length || 0})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && reviews.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
              </>
            ) : (
              "Load More Reviews"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;