import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import ProductType from "../models/productTypeModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const productsData = [
  {
    name: "Apple iPhone 15 Pro",
    description: "Experience the ultimate iPhone with A17 Pro chip, Titanium design, and professional camera system.",
    price: 999,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "The most powerful Galaxy yet with AI-powered features, S Pen, and stunning 200MP camera.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1610945415295-d9bff067e59c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "MacBook Pro 14 M3",
    description: "Supercharged by M3 chip, with advanced thermal architecture and Liquid Retina XDR display.",
    price: 1599,
    image: "https://images.unsplash.com/photo-1517336714467-d23784a3782d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancellation with exceptional sound quality and 30-hour battery life.",
    price: 349,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Nike Air Max 270",
    description: "Legendary Air cushioning meets modern design for ultimate comfort and style.",
    price: 150,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Sony PlayStation 5",
    description: "Experience lightning-fast loading with an ultra-high speed SSD and deeper immersion.",
    price: 499,
    image: "https://images.unsplash.com/photo-1606813907291-d86ebb9c74ad?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Logitech MX Master 3S",
    description: "An iconic mouse remastered for ultimate precision and performance.",
    price: 99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop"
  },
  {
    name: "Smart Watch Elite",
    description: "Stay connected and track your fitness with our most advanced smartwatch yet.",
    price: 299,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
  }
];

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected successfully.");

    // Ensure we have a category and brand
    let category = await Category.findOne({ name: "Electronics" });
    if (!category) {
      category = await Category.create({ name: "Electronics", description: "All things electronic", isActive: true });
    }

    let brand = await Brand.findOne({ name: "Global" });
    if (!brand) {
      brand = await Brand.create({ name: "Global", description: "Global brands", isActive: true });
    }

    let productType = await ProductType.findOne({ name: "Standard" });
    if (!productType) {
      productType = await ProductType.create({ name: "Standard", type: "standard", isActive: true });
    }

    const dummyProducts = [];
    
    // Generate 40 products
    for (let i = 0; i < 40; i++) {
      const template = productsData[i % productsData.length];
      const rating = (i % 5) + 1; // 1 to 5 stars
      
      dummyProducts.push({
        name: `${template.name} - ${Date.now() + i} - Unit ${i + 1}`,
        description: template.description,
        price: template.price + (i * 5),
        category: category._id,
        brand: brand._id,
        productType: [productType._id],
        image: template.image,
        images: [template.image],
        averageRating: rating,
        numReviews: Math.floor(Math.random() * 200) + 10,
        stock: Math.floor(Math.random() * 100) + 5,
        approvalStatus: "approved"
      });
    }

    console.log(`Creating ${dummyProducts.length} realistic products...`);
    for (const productData of dummyProducts) {
      await Product.create(productData);
    }
    console.log("Successfully seeded dummy data with WORKING images.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seed();
