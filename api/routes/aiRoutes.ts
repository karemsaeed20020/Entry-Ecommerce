import express from "express";
import { chatWithShopper, getProductReviewSummary } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chatWithShopper);
router.get("/product-summary/:productId", getProductReviewSummary);

export default router;
