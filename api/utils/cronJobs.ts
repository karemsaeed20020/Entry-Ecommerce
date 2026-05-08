import cron from "node-cron";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";
import { sendAbandonedCartEmail } from "./emailService.js";

// Setup cron jobs
export const setupCronJobs = () => {
  // Run every hour to check for abandoned carts
  // An abandoned cart is one that has items, hasn't been updated in 24 hours, and hasn't received an email yet.
  cron.schedule("0 * * * *", async () => {
    console.log("CRON: Checking for abandoned carts...");
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find carts that:
      // 1. Have items
      // 2. Were last updated more than 24 hours ago
      // 3. Haven't received the abandoned email yet
      const abandonedCarts = await Cart.find({
        "items.0": { $exists: true },
        updatedAt: { $lt: twentyFourHoursAgo },
        abandonedEmailSent: { $ne: true },
      });

      console.log(`CRON: Found ${abandonedCarts.length} abandoned carts to process.`);

      for (const cart of abandonedCarts) {
        try {
          const user = await User.findById(cart.userId);
          if (user && user.email) {
            // Send the recovery email
            const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
            const cartLink = `${clientUrl}/cart`;
            
            await sendAbandonedCartEmail(user.email, user.name || "Customer", cartLink);
            
            // Mark as sent to prevent spamming
            cart.abandonedEmailSent = true;
            await cart.save();
            console.log(`CRON: Abandoned cart email sent successfully to ${user.email}`);
          }
        } catch (emailErr) {
          console.error(`CRON: Failed to send abandoned cart email for cart ${cart._id}:`, emailErr);
        }
      }
    } catch (err) {
      console.error("CRON: Error in abandoned cart job:", err);
    }
  });

  console.log("Cron jobs successfully initialized.");
};
