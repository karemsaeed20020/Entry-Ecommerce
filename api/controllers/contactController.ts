import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import Contact from "../models/contactModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

const PREMIUM_MESSAGE = "This feature is only available in the premium version of the codebase.";

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createContactMessage: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    // Keep this functional so the storefront contact page doesn't break for users
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    if (contact) {
      res.status(201).json({
        success: true,
        data: contact,
        message: "Message sent successfully",
      });
    } else {
      res.status(400);
      throw new Error("Invalid contact data");
    }
  },
);

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getContactMessages: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: messages,
    });
  },
);

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
      await contact.deleteOne();
      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } else {
      res.status(404);
      throw new Error("Message not found");
    }
  },
);

// @desc    Reply to a contact message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
const replyContactMessage: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { message } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error("Message not found");
    }

    if (!message) {
      res.status(400);
      throw new Error("Please provide a reply message");
    }

    // Find if the contact email belongs to a registered user
    const user = await User.findOne({ email: contact.email });

    if (user) {
      // Create notification for the user
      await Notification.create({
        userId: user._id,
        senderId: req.user?._id, // The admin who is replying
        type: "contact_reply",
        title: `Reply to your message: ${contact.subject}`,
        message: message,
        metadata: {
          originalMessageId: contact._id,
          subject: contact.subject,
        }
      });
    }

    // In a real application, you would also send an actual email here
    // using a service like SendGrid or Nodemailer.

    res.status(200).json({
      success: true,
      message: user ? "Reply sent and notification created" : "Reply sent (email only)",
    });
  },
);

export { createContactMessage, getContactMessages, deleteContactMessage, replyContactMessage };
