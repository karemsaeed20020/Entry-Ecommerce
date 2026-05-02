import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    image: {
      type: String,
    },
    actionUrl: {
      type: String,
    },
    actionText: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isBulkSent: {
      type: Boolean,
      default: false,
    },
    bulkSendId: {
      type: String,
    },
    targetAudience: {
      type: String,
      enum: ["all", "specific"],
      default: "specific",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for getting unread count and latest notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
