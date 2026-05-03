import { Request, Response } from "express";
import { Coupon } from "../models/couponModel.js";
import asyncHandler from "express-async-handler";
import { ICoupon } from "../types/index.js";

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    res.json({ success: true, coupon });
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minAmount,
    maxDiscount,
    expiryDate,
    usageLimit,
    isActive,
  } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

  if (couponExists) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minAmount,
    maxDiscount,
    expiryDate,
    usageLimit,
    isActive,
  });

  res.status(201).json({ success: true, coupon });
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.description = req.body.description || coupon.description;
    coupon.discountType = req.body.discountType || coupon.discountType;
    coupon.discountValue = req.body.discountValue ?? coupon.discountValue;
    coupon.minAmount = req.body.minAmount ?? coupon.minAmount;
    coupon.maxDiscount = req.body.maxDiscount ?? coupon.maxDiscount;
    coupon.expiryDate = req.body.expiryDate || coupon.expiryDate;
    coupon.usageLimit = req.body.usageLimit ?? coupon.usageLimit;
    coupon.isActive = req.body.isActive ?? coupon.isActive;

    if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
      const codeExists = await Coupon.findOne({ code: req.body.code.toUpperCase() });
      if (codeExists) {
        res.status(400);
        throw new Error("Coupon code already exists");
      }
      coupon.code = req.body.code.toUpperCase();
    }

    const updatedCoupon = await coupon.save();
    res.json({ success: true, coupon: updatedCoupon });
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ success: true, message: "Coupon removed" });
  } else {
    res.status(404);
    throw new Error("Coupon not found");
  }
});

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, amount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    res.status(400);
    throw new Error("Coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error("Coupon usage limit reached");
  }

  if (amount < coupon.minAmount) {
    res.status(400);
    throw new Error(`Minimum amount of $${coupon.minAmount} required for this coupon`);
  }

  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed total amount
  discount = Math.min(discount, amount);

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
    },
  });
});
