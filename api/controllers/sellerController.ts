import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import Seller from "../models/sellerModel.js";
import SellerConfig from "../models/sellerConfigModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// @desc    Register a new seller (user applies to become a seller)
// @route   POST /api/sellers
// @access  Private
const registerSeller: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Check if user already has a seller profile
  const existingSeller = await Seller.findOne({ userId });
  if (existingSeller) {
    res.status(400);
    throw new Error(
      `You already have a seller application with status: ${existingSeller.status}`
    );
  }

  const { storeName, description, contactEmail, contactPhone, address, logo } =
    req.body;

  if (!storeName || !description || !contactEmail) {
    res.status(400);
    throw new Error("Store name, description, and contact email are required");
  }

  // Check if store name is taken
  const storeNameExists = await Seller.findOne({ storeName });
  if (storeNameExists) {
    res.status(400);
    throw new Error("A store with this name already exists");
  }

  // Check seller config for approval requirement
  let config = await SellerConfig.findOne();
  if (!config) {
    config = await SellerConfig.create({});
  }

  if (!config.sellerEnabled || !config.allowSellerRegistration) {
    res.status(403);
    throw new Error("Seller registration is currently disabled");
  }

  const sellerStatus = config.requireApproval ? "pending" : "approved";

  const seller = await Seller.create({
    userId,
    storeName,
    description,
    contactEmail,
    contactPhone: contactPhone || "",
    logo: logo || "",
    address: address || {},
    status: sellerStatus,
  });

  // Update the user's role to "seller"
  await User.findByIdAndUpdate(userId, { role: "seller" });

  res.status(201).json({
    success: true,
    message:
      sellerStatus === "pending"
        ? "Your seller application has been submitted and is pending approval."
        : "Your seller account has been approved! You can now start selling.",
    data: seller,
  });
});

// @desc    Create a new seller by admin
// @route   POST /api/sellers/create
// @access  Private/Admin
const createSellerByAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const { userId, storeName, description, contactEmail, contactPhone, address, logo } =
    req.body;

  if (!userId || !storeName || !description || !contactEmail) {
    res.status(400);
    throw new Error(
      "User ID, store name, description, and contact email are required"
    );
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if user already has a seller profile
  const existingSeller = await Seller.findOne({ userId });
  if (existingSeller) {
    res.status(400);
    throw new Error("This user already has a seller profile");
  }

  const seller = await Seller.create({
    userId,
    storeName,
    description,
    contactEmail,
    contactPhone: contactPhone || "",
    logo: logo || "",
    address: address || {},
    status: "approved",
  });

  // Update the user's role
  await User.findByIdAndUpdate(userId, { role: "seller" });

  res.status(201).json({
    success: true,
    message: "Seller created and approved successfully",
    data: seller,
  });
});

// @desc    Get all seller requests (with optional status filter)
// @route   GET /api/sellers
// @route   GET /api/sellers/requests
// @access  Private/Admin
const getSellerRequests: RequestHandler = asyncHandler(async (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;

  const filter: Record<string, any> = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [sellers, total] = await Promise.all([
    Seller.find(filter)
      .populate("userId", "name email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Seller.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: sellers.length,
    total,
    sellers,
    data: sellers,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      hasMore: pageNum * limitNum < total,
    },
  });
});

// @desc    Get seller status for current user
// @route   GET /api/sellers/me
// @access  Private
const getMySellerStatus: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user._id });

  if (!seller) {
    res.json({
      success: true,
      data: null,
      isSeller: false,
      message: "You have not applied to become a seller yet.",
    });
    return;
  }

  res.json({
    success: true,
    data: seller,
    isSeller: true,
    isApproved: seller.status === "approved",
  });
});

// @desc    Update seller status (approve/reject)
// @route   PUT /api/sellers/:id/status
// @access  Private/Admin
const updateSellerStatus: RequestHandler = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !["approved", "rejected", "pending"].includes(status)) {
    res.status(400);
    throw new Error("Valid status is required (approved, rejected, pending)");
  }

  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    res.status(404);
    throw new Error("Seller not found");
  }

  seller.status = status;
  await seller.save();

  // Update user role based on status
  if (status === "approved") {
    await User.findByIdAndUpdate(seller.userId, { role: "seller" });
  } else if (status === "rejected") {
    await User.findByIdAndUpdate(seller.userId, { role: "user" });
  }

  const updatedSeller = await Seller.findById(req.params.id).populate(
    "userId",
    "name email avatar role"
  );

  res.json({
    success: true,
    message: `Seller has been ${status}`,
    data: updatedSeller,
  });
});

// @desc    Get seller by ID (Admin)
// @route   GET /api/sellers/:id
// @access  Private/Admin
const getSellerById: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate(
    "userId",
    "name email avatar role createdAt"
  );

  if (!seller) {
    res.status(404);
    throw new Error("Seller not found");
  }

  // Get product count for this seller
  const productCount = await Product.countDocuments({ seller: seller._id });

  res.json({
    success: true,
    data: { ...seller.toObject(), productCount },
  });
});

// @desc    Update seller details by admin
// @route   PUT /api/sellers/:id
// @access  Private/Admin
const updateSellerDetails: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    res.status(404);
    throw new Error("Seller not found");
  }

  const { storeName, description, contactEmail, contactPhone, address, logo } =
    req.body;

  if (storeName) seller.storeName = storeName;
  if (description) seller.description = description;
  if (contactEmail) seller.contactEmail = contactEmail;
  if (contactPhone !== undefined) seller.contactPhone = contactPhone;
  if (address) seller.address = address;
  if (logo !== undefined) seller.logo = logo;

  await seller.save();

  const updatedSeller = await Seller.findById(req.params.id).populate(
    "userId",
    "name email avatar role"
  );

  res.json({
    success: true,
    message: "Seller details updated",
    data: updatedSeller,
  });
});

// @desc    Get seller configuration
// @route   GET /api/sellers/config
// @access  Public
const getSellerConfig: RequestHandler = asyncHandler(async (_req, res) => {
  let config = await SellerConfig.findOne();
  if (!config) {
    config = await SellerConfig.create({});
  }

  res.json({
    success: true,
    data: config,
  });
});

// @desc    Update seller configuration
// @route   PUT /api/sellers/config
// @access  Private/Admin
const updateSellerConfig: RequestHandler = asyncHandler(async (req, res) => {
  let config = await SellerConfig.findOne();
  if (!config) {
    config = await SellerConfig.create({});
  }

  const {
    sellerEnabled,
    defaultCommissionRate,
    minOrderAmount,
    allowSellerRegistration,
    requireApproval,
    maxProductsPerSeller,
  } = req.body;

  if (sellerEnabled !== undefined) config.sellerEnabled = sellerEnabled;
  if (defaultCommissionRate !== undefined)
    config.defaultCommissionRate = defaultCommissionRate;
  if (minOrderAmount !== undefined) config.minOrderAmount = minOrderAmount;
  if (allowSellerRegistration !== undefined)
    config.allowSellerRegistration = allowSellerRegistration;
  if (requireApproval !== undefined) config.requireApproval = requireApproval;
  if (maxProductsPerSeller !== undefined)
    config.maxProductsPerSeller = maxProductsPerSeller;

  await config.save();

  res.json({
    success: true,
    message: "Seller configuration updated",
    data: config,
  });
});

// @desc    Create a new product as seller
// @route   POST /api/sellers/products
// @access  Private (Approved Sellers only)
const createSellerProduct: RequestHandler = asyncHandler(async (req, res) => {
  // Check if user is an approved seller
  const seller = await Seller.findOne({
    userId: req.user._id,
    status: "approved",
  });

  if (!seller) {
    res.status(403);
    throw new Error("Only approved sellers can create products");
  }

  // Check product limit
  const config = await SellerConfig.findOne();
  if (config && config.maxProductsPerSeller) {
    const currentCount = await Product.countDocuments({ seller: seller._id });
    if (currentCount >= config.maxProductsPerSeller) {
      res.status(403);
      throw new Error(
        `You have reached the maximum product limit of ${config.maxProductsPerSeller}`
      );
    }
  }

  const product = await Product.create({
    ...req.body,
    seller: seller._id,
    approvalStatus: "pending", // Seller products need admin approval
  });

  res.status(201).json({
    success: true,
    message: "Product created and submitted for approval",
    data: product,
  });
});

// @desc    Get seller's own products
// @route   GET /api/sellers/products
// @access  Private (Seller)
const getSellerProducts: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user._id });

  if (!seller) {
    res.status(404);
    throw new Error("Seller profile not found");
  }

  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;

  const filter: Record<string, any> = { seller: seller._id };
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.approvalStatus = status;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    data: products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      hasMore: pageNum * limitNum < total,
    },
  });
});

// @desc    Update seller product
// @route   PUT /api/sellers/products/:id
// @access  Private (Seller - own products only)
const updateSellerProduct: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({
    userId: req.user._id,
    status: "approved",
  });

  if (!seller) {
    res.status(403);
    throw new Error("Only approved sellers can update products");
  }

  const product = await Product.findOne({
    _id: req.params.id,
    seller: seller._id,
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found or you don't have permission to edit it");
  }

  // Don't allow changing the seller field
  const { seller: _ignored, ...updateData } = req.body;

  // Reset approval status on edit
  Object.assign(product, updateData);
  product.approvalStatus = "pending";
  await product.save();

  res.json({
    success: true,
    message: "Product updated and resubmitted for approval",
    data: product,
  });
});

// @desc    Delete seller product
// @route   DELETE /api/sellers/products/:id
// @access  Private (Seller - own products only)
const deleteSellerProduct: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user._id });

  if (!seller) {
    res.status(403);
    throw new Error("Seller profile not found");
  }

  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    seller: seller._id,
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found or you don't have permission to delete it");
  }

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Get seller dashboard statistics
// @route   GET /api/sellers/dashboard/stats
// @access  Private (Seller)
const getSellerDashboardStats: RequestHandler = asyncHandler(
  async (req, res) => {
    const seller = await Seller.findOne({ userId: req.user._id });

    if (!seller) {
      res.status(404);
      throw new Error("Seller profile not found");
    }

    const [totalProducts, pendingProducts, approvedProducts] = await Promise.all([
      Product.countDocuments({ seller: seller._id }),
      Product.countDocuments({
        seller: seller._id,
        approvalStatus: "pending",
      }),
      Product.countDocuments({
        seller: seller._id,
        approvalStatus: "approved",
      }),
    ]);

    // Calculate sold items and revenue from approved products
    const soldData = await Product.aggregate([
      {
        $match: {
          seller: seller._id,
          approvalStatus: "approved",
        },
      },
      {
        $group: {
          _id: null,
          totalSoldItems: { $sum: "$sold" },
          totalRevenue: {
            $sum: { $multiply: ["$price", "$sold"] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      totalProducts,
      pendingProducts,
      approvedProducts,
      totalSoldItems: soldData[0]?.totalSoldItems || 0,
      totalRevenue: soldData[0]?.totalRevenue || 0,
      totalOrders: 0,
    });
  }
);

// @desc    Get orders that contain seller's products
// @route   GET /api/sellers/orders
// @access  Private (Seller)
const getSellerOrders: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user._id });

  if (!seller) {
    res.status(404);
    throw new Error("Seller profile not found");
  }

  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const Order = (await import("../models/orderModel.js")).default;
  const Product = (await import("../models/productModel.js")).default;

  // Find all product IDs belonging to this seller to use as a fallback
  const sellerProducts = await Product.find({ seller: seller._id }).select("_id");
  const sellerProductIds = sellerProducts.map((p) => p._id.toString());

  // Filter orders where at least one item belongs to this seller
  const filter: Record<string, any> = {
    $or: [
      { "items.seller": seller._id },
      { "items.productId": { $in: sellerProductIds } },
    ],
  };

  if (
    status &&
    [
      "pending",
      "address_confirmed",
      "confirmed",
      "packed",
      "delivering",
      "delivered",
      "completed",
      "cancelled",
    ].includes(status)
  ) {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  // Filter order items to only include seller's products
  const sellerOrders = orders.map((order: any) => {
    const orderObj = order.toObject();
    const sellerItems = orderObj.items.filter(
      (item: any) =>
        (item.seller && item.seller.toString() === seller._id.toString()) ||
        (item.productId && sellerProductIds.includes(item.productId.toString())),
    );
    const sellerTotal = sellerItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    return {
      ...orderObj,
      items: sellerItems,
      sellerTotal,
      originalTotal: orderObj.total,
    };
  });

  res.json({
    success: true,
    orders: sellerOrders,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      hasMore: pageNum * limitNum < total,
    },
  });
});

// @desc    Get specific order details for seller
// @route   GET /api/sellers/orders/:id
// @access  Private (Seller)
const getSellerOrderById: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user._id });

  if (!seller) {
    res.status(404);
    throw new Error("Seller profile not found");
  }

  const Order = (await import("../models/orderModel.js")).default;
  const Product = (await import("../models/productModel.js")).default;

  // Find all product IDs belonging to this seller to use as a fallback
  const sellerProducts = await Product.find({ seller: seller._id }).select("_id");
  const sellerProductIds = sellerProducts.map((p) => p._id.toString());

  const order = await Order.findOne({
    _id: req.params.id,
    $or: [
      { "items.seller": seller._id },
      { "items.productId": { $in: sellerProductIds } },
    ],
  }).populate("userId", "name email avatar");

  if (!order) {
    res.status(404);
    throw new Error("Order not found or does not contain your products");
  }

  const orderObj = order.toObject();
  const sellerItems = orderObj.items.filter(
    (item: any) =>
      (item.seller && item.seller.toString() === seller._id.toString()) ||
      (item.productId && sellerProductIds.includes(item.productId.toString())),
  );
  const sellerTotal = sellerItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  res.json({
    success: true,
    data: {
      ...orderObj,
      items: sellerItems,
      sellerTotal,
      originalTotal: orderObj.total,
    },
  });
});

// @desc    Update seller's own profile
// @route   PUT /api/sellers/profile
// @access  Private (Seller)
const updateSellerProfile: RequestHandler = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user._id });

  if (!seller) {
    res.status(404);
    throw new Error("Seller profile not found");
  }

  const { storeName, description, contactEmail, contactPhone, address, logo } = req.body;

  if (storeName && storeName !== seller.storeName) {
    const storeNameExists = await Seller.findOne({ storeName, _id: { $ne: seller._id } });
    if (storeNameExists) {
      res.status(400);
      throw new Error("A store with this name already exists");
    }
    seller.storeName = storeName;
  }
  if (description) seller.description = description;
  if (contactEmail) seller.contactEmail = contactEmail;
  if (contactPhone !== undefined) seller.contactPhone = contactPhone;
  if (address) seller.address = address;
  if (logo !== undefined) seller.logo = logo;

  await seller.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: seller,
  });
});

// @desc    Get approved sellers (public)
// @route   GET /api/sellers/approved
// @access  Public
const getApprovedSellers: RequestHandler = asyncHandler(async (_req, res) => {
  const sellers = await Seller.find({ status: "approved" })
    .populate("userId", "name email avatar")
    .select("storeName description logo contactEmail")
    .sort({ createdAt: -1 });

  res.json(sellers);
});

export {
  registerSeller,
  createSellerByAdmin,
  getSellerRequests,
  getSellerById,
  getMySellerStatus,
  updateSellerStatus,
  updateSellerDetails,
  getSellerConfig,
  updateSellerConfig,
  createSellerProduct,
  getSellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerDashboardStats,
  getApprovedSellers,
  getSellerOrders,
  getSellerOrderById,
  updateSellerProfile,
};
