import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProductReviews,
  createReview,
  deleteReview,
  toggleHelpful,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
} from "../controllers/reviewController.js";
import { admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────────────────────
// GET /api/reviews?productId=xxx&page=1&limit=5
router.get("/", getProductReviews);

// ── Private ─────────────────────────────────────────────────────────────────
// IMPORTANT: static paths (/my-reviews) must be registered BEFORE dynamic
// params (/:reviewId) so Express doesn't swallow them as param values.

// GET /api/reviews/my-reviews
router.get("/my-reviews", protect, getMyReviews);

// POST /api/reviews  — productId comes from request body
router.post("/", protect, createReview);

// POST /api/reviews/:reviewId/helpful
router.post("/:reviewId/helpful", protect, toggleHelpful);

// DELETE /api/reviews/:reviewId
router.delete("/:reviewId", protect, deleteReview);

// ── Admin ──────────────────────────────────────────────────────────────────
// GET /api/reviews/all
router.get("/all", protect, admin, getAllReviews);

// PUT /api/reviews/:reviewId/status
router.put("/:reviewId/status", protect, admin, updateReviewStatus);

export default router;