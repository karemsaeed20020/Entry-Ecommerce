import { Request, Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/reviewModel.js";
import { notificationService } from "../services/notificationService.js";

const syncProductRating = async (productId: string) => {
  try {
    const Product = mongoose.model("Product");
    const agg = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    const avg = agg[0]?.avg ?? 0;
    const count = agg[0]?.count ?? 0;
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(avg * 10) / 10,
      numReviews: count,
    });
  } catch (err) {
    console.error("syncProductRating error:", err);
  }
};

// GET /api/reviews?productId=xxx&page=1&limit=5
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 5);
    const skip = (page - 1) * limit;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const filter = { product: productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    const dist = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isApproved: true,
        },
      },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    dist.forEach((d) => { distribution[d._id] = d.count; });

    const avgRating =
      total > 0
        ? Object.entries(distribution).reduce(
            (sum, [star, cnt]) => sum + parseInt(star) * cnt,
            0
          ) / total
        : 0;

    return res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      total,
      distribution,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: skip + reviews.length < total,
    });
  } catch (err) {
    console.error("getProductReviews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/reviews  — productId from body
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Comment must be at least 5 characters" });
    }
    if (title && title.length > 100) {
      return res.status(400).json({ success: false, message: "Title must not exceed 100 characters" });
    }

    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reviewed this product" });
    }

    let verifiedPurchase = false;
    try {
      const Order = mongoose.model("Order");
      const order = await Order.findOne({
        user: userId,
        "items.product": productId,
        status: { $in: ["delivered", "completed"] },
      });
      verifiedPurchase = !!order;
    } catch {
      // Order model may not exist yet
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      title: title?.trim() || "",
      comment: comment.trim(),
      verifiedPurchase,
      isApproved: true,
    });

    await syncProductRating(productId);
    await review.populate("user", "name email avatar");

    // Notify Admins about new review
    try {
      await notificationService.notifyAdminReviewPosted(userId as any, review);
    } catch (notifError) {
      console.error("❌ Notification error:", notifError);
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (err: any) {
    console.error("createReview error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this product" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/reviews/:reviewId
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    const productId = review.product.toString();
    await review.deleteOne();
    await syncProductRating(productId);

    return res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/reviews/:reviewId/helpful
export const toggleHelpful = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const alreadyVoted = review.helpful.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
    );

    if (alreadyVoted) {
      review.helpful = review.helpful.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== userId.toString()
      );
    } else {
      review.helpful.push(userId as unknown as mongoose.Types.ObjectId);
    }

    await review.save();

    return res.status(200).json({
      success: true,
      helpfulCount: review.helpful.length,
      isHelpful: !alreadyVoted,
    });
  } catch (err) {
    console.error("toggleHelpful error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/reviews/my-reviews
export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const reviews = await Review.find({ user: userId })
      .populate("product", "name images slug price")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error("getMyReviews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /api/reviews/all
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate("user", "name email avatar")
        .populate("product", "name images slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/reviews/:reviewId/approve
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isApproved = !!isApproved;
    await review.save();

    // Sync product rating
    await syncProductRating(review.product.toString());

    return res.status(200).json({
      success: true,
      message: `Review ${isApproved ? "approved" : "rejected"} successfully`,
      review,
    });
  } catch (err) {
    console.error("updateReviewStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
