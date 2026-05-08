import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Purchase from "../models/purchaseModel.js";
import Product from "../models/productModel.js";
import { PurchaseStatus } from "../types/index.js";

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private/Admin
export const getPurchases = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, supplierId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};
  if (status) filter.status = status;
  if (supplierId) filter["supplier.supplierId"] = supplierId;

  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Purchase.countDocuments(filter);

  res.json({
    success: true,
    data: purchases,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get purchase by ID
// @route   GET /api/purchases/:id
// @access  Private/Admin
export const getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  res.json({ success: true, data: purchase });
});

// @desc    Create purchase requisition
// @route   POST /api/purchases
// @access  Private/Admin
export const createPurchaseRequisition = asyncHandler(async (req: any, res: Response) => {
  const { items, supplier, notes, expectedDeliveryDate } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Purchase items are required");
  }

  if (!supplier || !supplier.name) {
    res.status(400);
    throw new Error("Supplier information is required");
  }

  const purchase = await Purchase.create({
    items,
    supplier,
    notes,
    expectedDeliveryDate,
    createdBy: {
      id: req.user._id,
      name: req.user.name,
    },
    statusHistory: [
      {
        status: "requisition",
        changedBy: {
          id: req.user._id,
          name: req.user.name,
        },
        notes: "Initial requisition created",
      },
    ],
  });

  res.status(201).json({ success: true, data: purchase });
});

// @desc    Update purchase status
// @route   PATCH /api/purchases/:id/status
// @access  Private/Admin
export const updatePurchaseStatus = asyncHandler(async (req: any, res: Response) => {
  const { status, notes } = req.body;
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  const prevStatus = purchase.status;
  const validTransitions: Record<PurchaseStatus, PurchaseStatus[]> = {
    requisition: ["approved", "cancelled"],
    approved: ["purchased", "cancelled"],
    purchased: ["received", "cancelled"],
    received: [],
    cancelled: [],
  };

  if (!validTransitions[prevStatus].includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${prevStatus} to ${status}`);
  }

  purchase.status = status;
  
  // Track who performed the action
  const actionDetails = {
    id: req.user._id,
    name: req.user.name,
    at: new Date(),
    notes,
  };

  if (status === "approved") purchase.approvedBy = actionDetails;
  if (status === "purchased") purchase.purchasedBy = actionDetails;
  if (status === "received") {
    purchase.receivedBy = actionDetails;
    purchase.actualDeliveryDate = new Date();

    // UPDATE PRODUCT STOCK AND PRICES
    for (const item of purchase.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Increment stock
        product.stock += item.quantity;
        // Update purchase price and selling price
        product.purchasePrice = item.purchasePrice;
        product.profitMargin = item.profitMargin;
        product.price = item.sellingPrice;
        await product.save();
      }
    }
  }

  purchase.statusHistory.push({
    status,
    changedBy: {
      id: req.user._id,
      name: req.user.name,
    },
    notes,
  });

  await purchase.save();

  res.json({ success: true, data: purchase });
});

// @desc    Update purchase details (only for requisition status)
// @route   PUT /api/purchases/:id
// @access  Private/Admin
export const updatePurchase = asyncHandler(async (req: Request, res: Response) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  if (purchase.status !== "requisition") {
    res.status(400);
    throw new Error("Can only update purchase details when in requisition status");
  }

  const updatedPurchase = await Purchase.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: updatedPurchase });
});

// @desc    Delete purchase
// @route   DELETE /api/purchases/:id
// @access  Private/Admin
export const deletePurchase = asyncHandler(async (req: Request, res: Response) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  if (purchase.status !== "requisition" && purchase.status !== "cancelled") {
    res.status(400);
    throw new Error("Cannot delete purchase that has been approved or processed");
  }

  await purchase.deleteOne();

  res.json({ success: true, message: "Purchase deleted successfully" });
});

// @desc    Get purchase stats
// @route   GET /api/purchases/stats
// @access  Private/Admin
export const getPurchaseStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Purchase.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalValue: { $sum: "$totalAmount" },
      },
    },
  ]);

  res.json({ success: true, data: stats });
});
