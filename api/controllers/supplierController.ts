import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Supplier from "../models/supplierModel.js";

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin
export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, isActive } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const suppliers = await Supplier.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Supplier.countDocuments(filter);

  res.json({
    success: true,
    data: suppliers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private/Admin
export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  res.json({ success: true, data: supplier });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private/Admin
export const createSupplier = asyncHandler(async (req: any, res: Response) => {
  const { name, email, contact, address, paymentSystem, paymentDetails, taxId, website, notes } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error("Name and email are required");
  }

  const supplierExists = await Supplier.findOne({ email });
  if (supplierExists) {
    res.status(400);
    throw new Error("Supplier with this email already exists");
  }

  const supplier = await Supplier.create({
    name,
    email,
    contact,
    address,
    paymentSystem,
    paymentDetails,
    taxId,
    website,
    notes,
    createdBy: {
      id: req.user._id,
      name: req.user.name,
    },
  });

  res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  const updatedSupplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: updatedSupplier });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  await supplier.deleteOne();

  res.json({ success: true, message: "Supplier deleted successfully" });
});
