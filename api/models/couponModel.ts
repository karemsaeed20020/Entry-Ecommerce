import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minAmount: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // Only relevant for percent discounts
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by code
couponSchema.index({ code: 1, isActive: 1, expiryDate: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);
