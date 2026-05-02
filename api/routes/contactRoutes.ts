import express, { Router } from "express";
import {
  createContactMessage,
  getContactMessages,
  deleteContactMessage,
  replyContactMessage,
} from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router
  .route("/")
  .post(createContactMessage)
  .get(protect, admin, getContactMessages);

router.route("/:id").delete(protect, admin, deleteContactMessage);
router.route("/:id/reply").post(protect, admin, replyContactMessage);

export default router;
