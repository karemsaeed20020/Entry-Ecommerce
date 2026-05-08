import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ReturnRequest from "../models/returnRequestModel.js";
import Order from "../models/orderModel.js";
import Notification from "../models/notificationModel.js";

/**
 * @desc    Create a return request
 * @route   POST /api/returns
 * @access  Private
 */
export const createReturnRequest = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, items, reason, explanation, images } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if user owns the order
  if (order.userId.toString() !== req.user?._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Find unique sellers for the items being returned
  let sellerId = order.items && order.items.length > 0 
    ? (order.items[0] as any).seller 
    : (order as any).seller;

  // Fallback: If seller is not stored in the order item, look it up from the Product model
  if (!sellerId && order.items && order.items.length > 0) {
    const Product = (await import("../models/productModel.js")).default;
    const product = await Product.findById(order.items[0].productId);
    sellerId = product?.seller;
  }

  if (!sellerId) {
    res.status(400);
    throw new Error("Could not identify seller for this order. Please contact support.");
  }

  // Resolve User ID if sellerId is a Seller model ID
  const Seller = (await import("../models/sellerModel.js")).default;
  const sellerDoc = await Seller.findById(sellerId);
  const sellerUserId = sellerDoc ? sellerDoc.userId : sellerId;

  const returnRequest = await ReturnRequest.create({
    orderId,
    customerId: req.user?._id,
    sellerId: sellerId, // Keep original reference for the model
    items,
    reason,
    explanation,
    images,
  });

  // Notify seller using the resolved User ID
  await Notification.create({
    userId: sellerUserId,
    senderId: req.user?._id,
    type: "return_request",
    title: "New Return Request",
    message: `A customer has requested a return for order #${order._id.toString().substring(0, 8)}`,
    actionUrl: "/seller/returns",
  });

  res.status(201).json({
    success: true,
    data: returnRequest,
  });
});

/**
 * @desc    Get return requests for the authenticated user
 * @route   GET /api/returns
 * @access  Private
 */
export const getMyReturns = asyncHandler(async (req: Request, res: Response) => {
  const returns = await ReturnRequest.find({ customerId: req.user?._id })
    .populate("orderId", "totalPrice createdAt")
    .populate("items.productId", "name image")
    .sort("-createdAt");

  res.json({
    success: true,
    data: returns,
  });
});

/**
 * @desc    Get return requests for a seller
 * @route   GET /api/returns/seller
 * @access  Private/Seller
 */
export const getSellerReturns = asyncHandler(async (req: Request, res: Response) => {
  // Get the seller profile for the authenticated user
  const Seller = (await import("../models/sellerModel.js")).default;
  const seller = await Seller.findOne({ userId: req.user?._id });

  if (!seller) {
    res.status(404);
    throw new Error("Seller profile not found");
  }

  const returns = await ReturnRequest.find({ sellerId: seller._id })
    .populate("orderId", "totalPrice createdAt")
    .populate("customerId", "name email")
    .populate("items.productId", "name image")
    .sort("-createdAt");

  res.json({
    success: true,
    data: returns,
  });
});

/**
 * @desc    Update return request status
 * @route   PATCH /api/returns/:id
 * @access  Private/Seller/Admin
 */
export const updateReturnStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, sellerNotes, refundAmount } = req.body;
  const { id } = req.params;

  console.log(`Updating return request ${id} to status ${status}`);

  const returnRequest = await ReturnRequest.findById(id);

  if (!returnRequest) {
    res.status(404);
    throw new Error("Return request not found");
  }

  const oldStatus = returnRequest.status;

  returnRequest.status = status || returnRequest.status;
  returnRequest.sellerNotes = sellerNotes || returnRequest.sellerNotes;
  returnRequest.refundAmount = refundAmount || returnRequest.refundAmount;

  try {
    await returnRequest.save();

    // Update payment status only when actually refunded
    if (status === "refunded" && oldStatus !== "refunded") {
      const Order = (await import("../models/orderModel.js")).default;
      await Order.findByIdAndUpdate(returnRequest.orderId, {
        paymentStatus: "refunded"
      });
    }

    // Restock the items as soon as the return is approved (or refunded if skipped straight to refunded)
    const isRestockStatus = status === "approved" || status === "refunded" || status === "received";
    const wasRestockStatus = oldStatus === "approved" || oldStatus === "refunded" || oldStatus === "received";

    if (isRestockStatus && !wasRestockStatus) {
      const Product = (await import("../models/productModel.js")).default;
      for (const item of returnRequest.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { 
            stock: item.quantity,
            sold: -item.quantity 
          }
        });
      }
    }

    // Notify customer
    await Notification.create({
      userId: returnRequest.customerId,
      senderId: req.user?._id,
      type: "return_update",
      title: `Return Request ${returnRequest.status.toUpperCase()}`,
      message: `Your return request for order #${returnRequest.orderId.toString().substring(0, 8)} has been ${returnRequest.status}`,
      actionUrl: "/user/orders",
    });

    res.json({
      success: true,
      data: returnRequest,
    });
  } catch (error: any) {
    console.error("Error updating return status:", error);
    res.status(500);
    throw new Error(error.message || "Failed to update return status");
  }
});
