import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getMessages,
  startConversation,
  startSupportConversation,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/conversation", startConversation);
router.post("/support", startSupportConversation);

export default router;
