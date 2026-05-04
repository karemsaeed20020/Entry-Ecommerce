import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const clearProducts = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected successfully.");

    console.log("Deleting seeded products...");
    const result = await Product.deleteMany({
      $or: [
        { name: { $regex: " - Unit " } },
        { name: { $regex: "Premium Product " } },
        { name: { $regex: "Dummy Product " } }
      ]
    });
    console.log(`Successfully deleted ${result.deletedCount} seeded products.`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error clearing products:", error);
    process.exit(1);
  }
};

clearProducts();
