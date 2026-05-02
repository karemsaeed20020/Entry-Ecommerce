import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    images: [
      {
        type: String,
      },
    ],
    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);