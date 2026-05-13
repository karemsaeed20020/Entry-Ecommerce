import mongoose from "mongoose";
import dotenv from "dotenv";
import { Review } from "./models/reviewModel.js";
import User from "./models/userModel.js";
import Product from "./models/productModel.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to DB...");

    let user = await User.findOne();
    let products = await Product.find().limit(5);

    if (!user) {
      console.log("Creating dummy user...");
      user = await User.create({
        name: "Test User",
        email: "testuser123@example.com",
        password: "password123",
      });
    }

    if (products.length === 0) {
      console.log("Creating dummy product...");
      const product = await Product.create({
        name: "Premium Test Product",
        slug: "premium-test-product",
        price: 99.99,
        description: "A great product",
        stock: 100,
        approvalStatus: "approved",
      });
      products = [product];
    }

    const user2 = await User.findOne({ _id: { $ne: user._id } });

    const reviews = [
      {
        product: products[0]._id,
        user: user._id,
        rating: 5,
        title: "Absolutely Amazing!",
        comment: "This product exceeded all my expectations. The quality is fantastic and delivery was super fast. Highly recommend to everyone!",
        isApproved: true,
        verifiedPurchase: true,
      },
      {
        product: products[0]._id,
        user: user2?._id || user._id,
        rating: 4,
        title: "Great value for money",
        comment: "Very good product overall. Missing one small feature but for the price, it's unbeatable.",
        isApproved: true,
        verifiedPurchase: true,
      },
      {
        product: products[1]?._id || products[0]._id,
        user: user._id,
        rating: 5,
        title: "Best purchase this year",
        comment: "I use this every single day. The build quality is premium.",
        isApproved: false, // Pending review
        verifiedPurchase: false,
      },
      {
        product: products[2]?._id || products[0]._id,
        user: user2?._id || user._id,
        rating: 2,
        title: "Disappointed",
        comment: "It didn't really meet my expectations and the color was slightly off from the pictures.",
        isApproved: true,
        verifiedPurchase: true,
      },
      {
        product: products[3]?._id || products[0]._id,
        user: user._id,
        rating: 5,
        title: "Perfect gift!",
        comment: "Bought this as a gift for my partner and they absolutely love it. Will buy again.",
        isApproved: false, // Pending review
        verifiedPurchase: true,
      }
    ];

    // Clear existing to avoid duplicates if running multiple times
    await Review.deleteMany({});
    console.log("Cleared old reviews...");

    await Review.insertMany(reviews);
    console.log(`Successfully added ${reviews.length} reviews for testing!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
