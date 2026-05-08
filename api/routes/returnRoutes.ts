import express from "express";
import {
  createReturnRequest,
  getMyReturns,
  getSellerReturns,
  updateReturnStatus,
} from "../controllers/returnController.js";
import { protect, seller } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createReturnRequest);
router.get("/", getMyReturns);
router.get("/seller", seller, getSellerReturns);
router.put("/:id", updateReturnStatus);

export default router;
