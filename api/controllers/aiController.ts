import { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import Product from "../models/productModel.js";
import { Review } from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import { Coupon } from "../models/couponModel.js";
import mongoose from "mongoose";

// Initialize Gemini
export const chatWithShopper = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({
        reply:
          "⚠️ The AI is currently offline. Please add your GEMINI_API_KEY to the api/.env file to enable the Personal Shopper!",
      });
      return;
    }

    // Initialize Gemini inside the function so dotenv has time to load process.env.GEMINI_API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const { message } = req.body;

    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    // 1. Fetch a simplified list of active products to send to the AI
    // We only send name, category, and price to save tokens
    const products = await Product.find({
      approvalStatus: "approved",
      stock: { $gt: 0 },
    })
      .populate("category", "name")
      .select("name price discountPercentage")
      .limit(50); // Limit to top 50 to avoid huge payloads

    // Format products for AI
    const productListContext = products
      .map((p: any) => {
        const finalPrice = p.discountPercentage
          ? (p.price - p.price * (p.discountPercentage / 100)).toFixed(2)
          : p.price;
        const categoryName = p.category?.name || "General";
        return `- ID: ${p._id}, Name: ${p.name}, Category: ${categoryName}, Price: $${finalPrice}`;
      })
      .join("\n");

    // 2. Build the prompt
    const prompt = `
You are an expert personal shopper and customer support agent for an e-commerce store. 
A customer asks you: "${message}"

Here is the list of products available in our store:
${productListContext}

You have the ability to RECOMMEND products AND you have the ability to CANCEL ORDERS.
- If the customer wants product recommendations, recommend 1 to 3 products from the list above. 
- If the customer wants to cancel an order and provides an Order ID, you MUST use the 'cancelOrder' tool.
- If the customer wants to track their order and provides an Order ID, you MUST use the 'trackOrder' tool.
- If the customer asks for discounts, deals, or coupons, you MUST use the 'getAvailableCoupons' tool.
- If they want to cancel or track an order but didn't provide an ID, ask them for the Order ID.
- Your response should be friendly, helpful, and concise. 
`;

    // 3. Call Gemini API with Tools
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [
          {
            functionDeclarations: [
              {
                name: "cancelOrder",
                description: "Cancel a customer's order by its Order ID.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    orderId: {
                      type: Type.STRING,
                      description: "The Order ID to cancel",
                    },
                  },
                  required: ["orderId"],
                },
              },
              {
                name: "trackOrder",
                description:
                  "Get the real-time shipping status and items of an order by its Order ID.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    orderId: {
                      type: Type.STRING,
                      description: "The Order ID to track",
                    },
                  },
                  required: ["orderId"],
                },
              },
              {
                name: "getAvailableCoupons",
                description:
                  "Fetch a list of all active discount coupons and deals available in the store.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                },
              },
            ],
          },
        ],
      },
    });

    // 4. Handle Function Calls (The "Agent" part)
    const functionCalls =
      (response as any).functionCalls ||
      response.candidates?.[0]?.content?.parts
        ?.filter((p: any) => p.functionCall)
        ?.map((p: any) => p.functionCall);

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];

      // TOOL: CANCEL ORDER
      if (call.name === "cancelOrder") {
        const args = call.args as any;
        const orderId = args.orderId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
          res
            .status(200)
            .json({
              reply: `I tried to cancel the order, but "${orderId}" is not a valid Order ID format.`,
            });
          return;
        }

        const order = await Order.findById(orderId);

        if (!order) {
          res
            .status(200)
            .json({
              reply: `I couldn't find an order with the ID: ${orderId}. Please check the number and try again.`,
            });
          return;
        }

        if (order.status === "cancelled") {
          res
            .status(200)
            .json({ reply: `Order ${orderId} is already canceled!` });
          return;
        }

        if (order.status === "delivered" || order.status === "completed") {
          res
            .status(200)
            .json({
              reply: `I'm sorry, I cannot cancel order ${orderId} because it has already been delivered.`,
            });
          return;
        }

        order.status = "cancelled";
        await order.save();

        res
          .status(200)
          .json({
            reply: `✅ Success! I have officially canceled order ${orderId} for you. The database has been updated.`,
          });
        return;
      }

      // TOOL: TRACK ORDER
      if (call.name === "trackOrder") {
        const args = call.args as any;
        const orderId = args.orderId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
          res
            .status(200)
            .json({
              reply: `"${orderId}" doesn't look like a valid Order ID. Could you double-check it?`,
            });
          return;
        }

        const order = await Order.findById(orderId);

        if (!order) {
          res
            .status(200)
            .json({
              reply: `I couldn't find any order matching ID: ${orderId}.`,
            });
          return;
        }

        const itemsSummary = order.items
          .map((item: any) => `${item.quantity}x ${item.name}`)
          .join(", ");
        const statusEmoji: any = {
          pending: "⏳",
          confirmed: "✅",
          packed: "📦",
          delivering: "🚚",
          delivered: "🏁",
          cancelled: "❌",
        };

        const emoji = statusEmoji[order.status] || "ℹ️";

        res.status(200).json({
          reply: `🔎 **Order Tracking Found!**\n\n**Status:** ${emoji} ${order.status.toUpperCase()}\n**Items:** ${itemsSummary}\n**Total:** $${order.total}\n\nIs there anything else you'd like to know about this order?`,
        });
        return;
      }

      // TOOL: GET COUPONS
      if (call.name === "getAvailableCoupons") {
        const coupons = await Coupon.find({
          isActive: true,
          expiryDate: { $gt: new Date() },
        }).limit(5);

        if (coupons.length === 0) {
          res
            .status(200)
            .json({
              reply:
                "I checked our system, and we don't have any active discount codes right now. But stay tuned for our next sale!",
            });
          return;
        }

        const couponList = coupons
          .map(
            (c) =>
              `- **${c.code}**: ${c.description} (${c.discountType === "percent" ? c.discountValue + "%" : "$" + c.discountValue} off)`,
          )
          .join("\n");

        res.status(200).json({
          reply: `🎁 **Current Deals & Coupons:**\n\n${couponList}\n\nYou can apply these at checkout to save on your order!`,
        });
        return;
      }
    }

    // If no function was called, just return the text
    res.status(200).json({
      reply: response.text,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    const errorMessage = error?.status === 429 
      ? "API Rate Limit Exceeded. The free tier of Gemini has reached its limit. Please wait a moment and try again." 
      : "Failed to process AI request";
    res.status(500).json({ message: errorMessage, error: error.message });
  }
};

export const getProductReviewSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({
        summary:
          "AI Review Summaries are currently offline. Please add your GEMINI_API_KEY to the backend .env file.",
      });
      return;
    }

    // Fetch reviews for the product
    const reviews = await Review.find({ product: productId, isApproved: true })
      .select("rating comment title")
      .limit(20); // Only process up to the latest 20 reviews to save AI tokens

    if (reviews.length < 2) {
      res.status(200).json({
        summary:
          "Not enough reviews to generate a meaningful summary. Be the first to leave a detailed review!",
      });
      return;
    }

    // Format reviews for the prompt
    const reviewContext = reviews
      .map(
        (r, i) =>
          `Review ${i + 1}: Rating: ${r.rating}/5. "${r.title || ""} - ${r.comment}"`,
      )
      .join("\n\n");

    const prompt = `
  You are an AI assistant for an e-commerce platform. Your job is to read the following customer reviews for a product and generate a single, concise paragraph summarizing what customers think. 
  Highlight the most common pros and cons. Do not use bullet points. Keep it professional, engaging, and under 4 sentences. Start your response with "Overall, customers..." or something similar.
  
  Reviews:
  ${reviewContext}
  `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.status(200).json({
      summary: response.text,
    });
  } catch (error) {
    console.error("AI Review Summary Error:", error);
    res.status(500).json({ message: "Failed to generate AI summary" });
  }
};
