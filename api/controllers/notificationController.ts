import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";
import { notificationService } from "../services/notificationService.js";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: any, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === "true";

  const result = await notificationService.getUserNotifications(req.user._id, {
    limit,
    skip,
    unreadOnly,
  });

  res.json({
    success: true,
    ...result,
    page,
    totalPages: Math.ceil(result.total / limit),
  });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req: any, res: Response) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });
  res.json({ success: true, count });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: any, res: Response) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json({ success: true, notification });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: any, res: Response) => {
  await notificationService.markAllAsRead(req.user._id);
  res.json({ success: true, message: "All notifications marked as read" });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req: any, res: Response) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.user._id
  );

  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json({ success: true, message: "Notification deleted" });
});

// Utility function to create notifications (internal use)
export const createNotification = async (data: any) => {
  try {
    // Map recipient to userId for backward compatibility with my previous implementation plan
    if (data.recipient && !data.userId) data.userId = data.recipient;
    if (data.sender && !data.senderId) data.senderId = data.sender;
    
    await notificationService.createNotification(data);
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};
