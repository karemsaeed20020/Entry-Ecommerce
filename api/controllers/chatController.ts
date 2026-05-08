import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

/**
 * @desc    Get all conversations for a user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user?._id] },
  })
    .populate("participants", "name email avatar role")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: conversations,
  });
});

/**
 * @desc    Get messages for a specific conversation
 * @route   GET /api/chat/messages/:conversationId
 * @access  Private
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  // Check if user is part of conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: { $in: [req.user?._id] },
  });

  if (!conversation) {
    res.status(403);
    throw new Error("Not authorized to view this conversation");
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: messages,
  });
});

/**
 * @desc    Start or get a conversation with another user
 * @route   POST /api/chat/conversation
 * @access  Private
 */
export const startConversation = asyncHandler(async (req: Request, res: Response) => {
  const { participantId } = req.body;

  if (!participantId) {
    res.status(400);
    throw new Error("Participant ID is required");
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user?._id, participantId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user?._id, participantId],
    });
  }

  res.status(201).json({
    success: true,
    data: conversation,
  });
});
/**
 * @desc    Start or get a conversation with an admin (Support)
 * @route   POST /api/chat/support
 * @access  Private
 */
export const startSupportConversation = asyncHandler(async (req: Request, res: Response) => {
  // Find first available admin
  const admin = await User.findOne({ role: "admin" });

  if (!admin) {
    res.status(404);
    throw new Error("No support agents available at the moment");
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user?._id, admin._id] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user?._id, admin._id],
    });
  }

  res.status(201).json({
    success: true,
    data: conversation,
  });
});
