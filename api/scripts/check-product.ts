import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const checkProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const product = await Product.findOne().populate("seller");
    console.log("Product Sample:", JSON.stringify({
      _id: product?._id,
      name: product?.name,
      seller: product?.seller,
      vendor: (product as any).vendor
    }, null, 2));
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

checkProduct();
