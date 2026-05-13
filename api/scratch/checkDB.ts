import connectDB from "../config/db.js";
import { Coupon } from "../models/couponModel.js";
import Order from "../models/orderModel.js";
import dotenv from "dotenv";

dotenv.config();

async function checkData() {
  await connectDB();
  
  const coupons = await Coupon.find({});
  console.log(`Found ${coupons.length} coupons.`);
  coupons.forEach(c => console.log(`- ${c.code} (Active: ${c.isActive})`));
  
  const orders = await Order.find({}).limit(5);
  console.log(`Found ${orders.length} orders (sample).`);
  orders.forEach(o => console.log(`- ${o._id} (Status: ${o.status})`));
  
  process.exit(0);
}

checkData();
