import NotificationModel from "../models/notification.model.js";

const serializeNotification = (notification) => ({
  id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  sourceId: notification.sourceId || null,
  sourceType: notification.sourceType || "",
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  scheduledFor: notification.scheduledFor,
});

const notificationsController = {
  getMyNotifications: async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
      const dueFilter = {
        userId: req.authUser._id,
        $or: [{ scheduledFor: null }, { scheduledFor: { $lte: new Date() } }],
      };
      const notifications = await NotificationModel.find(dueFilter)
        .sort({ createdAt: -1 })
        .limit(limit);
      const unreadCount = await NotificationModel.countDocuments({ ...dueFilter, readAt: null });

      return res.status(200).send({
        success: true,
        message: "Get notifications successfully",
        data: {
          notifications: notifications.map(serializeNotification),
          unreadCount,
        },
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const unreadCount = await NotificationModel.countDocuments({
        userId: req.authUser._id,
        readAt: null,
        $or: [{ scheduledFor: null }, { scheduledFor: { $lte: new Date() } }],
      });

      return res.status(200).send({
        success: true,
        message: "Get unread notifications successfully",
        data: { unreadCount },
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const notification = await NotificationModel.findOneAndUpdate(
        { _id: req.params.notificationId, userId: req.authUser._id },
        { readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return res.status(404).send({
          success: false,
          message: "Notification not found",
          data: null,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Mark notification as read successfully",
        data: serializeNotification(notification),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await NotificationModel.updateMany(
        { userId: req.authUser._id, readAt: null },
        { readAt: new Date() }
      );

      return res.status(200).send({
        success: true,
        message: "Mark all notifications as read successfully",
        data: { unreadCount: 0 },
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default notificationsController;
