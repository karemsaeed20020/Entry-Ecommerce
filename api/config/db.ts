import mongoose from "mongoose";
import dns from 'dns';
// Set mongoose options to avoid deprecation warnings
mongoose.set("strictQuery", false);
const connectDB = async (): Promise<void> => {
  try {
    // 1. Set DNS servers BEFORE attempting to connect
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    console.log("DNS servers set to Cloudflare/Google");

    // 2. Now connect using those DNS settings
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
