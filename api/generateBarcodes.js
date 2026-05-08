import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function generateBarcodesForExistingProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    const products = await Product.find({ 
      $or: [
        { barcode: { $exists: false } },
        { barcode: null },
        { barcode: "" }
      ]
    });

    console.log(`Found ${products.length} products without barcodes.`);

    for (const product of products) {
      // The pre-save hook we added earlier will handle the generation
      // if we mark the document as modified or just trigger a save.
      // But let's be explicit here to be safe.
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      product.barcode = `${timestamp}${random}`;
      
      await product.save();
      console.log(`Generated barcode for product: ${product.name} -> ${product.barcode}`);
    }

    console.log("All products updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error generating barcodes:", error);
    process.exit(1);
  }
}

generateBarcodesForExistingProducts();
