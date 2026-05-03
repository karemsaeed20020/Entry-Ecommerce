import { fetchWithConfig, getAuthHeaders } from "./config";

export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  product: string;
  user: ReviewUser;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: string[];
  verifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  averageRating: number;
  total: number;
  distribution: Record<number, number>;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export interface MyReviewsResponse {
  success: boolean;
  reviews: Review[];
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  review: Review;
}

export interface HelpfulResponse {
  success: boolean;
  helpfulCount: number;
  isHelpful: boolean;
}

// GET /api/reviews?productId=xxx&page=1&limit=5
export const getProductReviews = async (
  productId: string,
  page = 1,
  limit = 5
): Promise<ReviewsResponse> => {
  return fetchWithConfig<ReviewsResponse>(
    `/reviews?productId=${productId}&page=${page}&limit=${limit}`
  );
};

// GET /api/reviews/my-reviews  (private)
export const getMyReviews = async (token: string): Promise<MyReviewsResponse> => {
  return fetchWithConfig<MyReviewsResponse>("/reviews/my-reviews", {
    headers: getAuthHeaders(token),
  });
};

// POST /api/reviews  (private)
export const createReview = async (
  token: string,
  data: { productId: string; rating: number; title?: string; comment: string }
): Promise<CreateReviewResponse> => {
  return fetchWithConfig<CreateReviewResponse>("/reviews", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
};

// POST /api/reviews/:reviewId/helpful  (private)
export const toggleHelpful = async (
  token: string,
  reviewId: string
): Promise<HelpfulResponse> => {
  return fetchWithConfig<HelpfulResponse>(`/reviews/${reviewId}/helpful`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
};

// DELETE /api/reviews/:reviewId  (private)
export const deleteReview = async (
  token: string,
  reviewId: string
): Promise<{ success: boolean; message: string }> => {
  return fetchWithConfig(`/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
};
