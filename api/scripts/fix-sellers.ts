import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Seller from "../models/sellerModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const fixSellers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB.");

    let seller = await Seller.findOne({ status: "approved" });
    
    if (!seller) {
      console.log("No approved seller found. Checking for seller users...");
      let sellerUser = await User.findOne({ role: "seller" });
      
      if (!sellerUser) {
        console.log("No seller user found. Creating one...");
        sellerUser = await User.create({
          name: "Default Seller",
          email: "seller@example.com",
          password: "password123",
          role: "seller",
          emailVerified: true
        });
      }

      console.log("Creating Seller profile...");
      seller = await Seller.create({
        userId: sellerUser._id,
        storeName: "Entry Official Store",
        description: "The official Entry marketplace store.",
        status: "approved",
        contactEmail: sellerUser.email
      });
    }

    console.log(`Using Seller: ${seller.storeName} (${seller._id})`);

    const result = await Product.updateMany(
      { $or: [{ seller: { $exists: false } }, { seller: null }] },
      { $set: { seller: seller._id } }
    );

    console.log(`Updated ${result.modifiedCount} products with seller ID.`);

    await mongoose.connection.close();
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixSellers();
