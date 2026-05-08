import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "received", "refunded", "cancelled"],
      default: "pending",
    },
    reason: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    adminNotes: {
      type: String,
    },
    sellerNotes: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);

export default ReturnRequest;
