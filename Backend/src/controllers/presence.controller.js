import PresenceModel from "../models/presence.model.js";

const ONLINE_WINDOW_MS = 90 * 1000;
const MAX_PATH_LENGTH = 220;
const MAX_AGENT_LENGTH = 320;

const sanitizeText = (value = "", maxLength = 160) =>
  String(value || "").trim().slice(0, maxLength);

const getClientIp = (req) => {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwardedFor || req.ip || "";
};

const serializePresence = (presence, now = Date.now()) => {
  const lastSeenAt = presence.lastSeenAt ? new Date(presence.lastSeenAt) : null;
  const secondsAgo = lastSeenAt ? Math.max(0, Math.round((now - lastSeenAt.getTime()) / 1000)) : null;

  return {
    id: presence.visitorId,
    visitorId: presence.visitorId,
    userId: presence.userId || null,
    fullName: presence.fullName || "",
    email: presence.email || "",
    role: presence.role || "guest",
    currentPath: presence.currentPath || "/",
    userAgent: presence.userAgent || "",
    ipAddress: presence.ipAddress || "",
    firstSeenAt: presence.firstSeenAt,
    lastSeenAt: presence.lastSeenAt,
    secondsAgo,
    isOnline: lastSeenAt ? now - lastSeenAt.getTime() <= ONLINE_WINDOW_MS : false,
  };
};

const presenceController = {
  heartbeat: async (req, res) => {
    try {
      const authUser = req.authUser || null;
      const visitorId = sanitizeText(
        authUser?._id ? `user-${authUser._id}` : req.body?.visitorId,
        96
      );

      if (!visitorId) {
        return res.status(400).send({
          success: false,
          message: "visitorId is required",
          data: null,
        });
      }

      const now = new Date();
      const update = {
        userId: authUser?._id || null,
        fullName: authUser?.fullName || "",
        email: authUser?.email || "",
        role: authUser?.role || "guest",
        currentPath: sanitizeText(req.body?.currentPath || "/", MAX_PATH_LENGTH) || "/",
        userAgent: sanitizeText(req.headers["user-agent"] || req.body?.userAgent || "", MAX_AGENT_LENGTH),
        ipAddress: sanitizeText(getClientIp(req), 80),
        lastSeenAt: now,
      };

      const presence = await PresenceModel.findOneAndUpdate(
        { visitorId },
        {
          $set: update,
          $setOnInsert: {
            visitorId,
            firstSeenAt: now,
          },
        },
        { new: true, upsert: true }
      );

      return res.status(200).send({
        success: true,
        message: "Presence heartbeat recorded",
        data: serializePresence(presence),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getOnlineVisitors: async (req, res) => {
    try {
      const thresholdSeconds = Math.min(Math.max(Number(req.query?.thresholdSeconds || 90), 30), 300);
      const limit = Math.min(Math.max(Number(req.query?.limit || 100), 1), 300);
      const since = new Date(Date.now() - thresholdSeconds * 1000);
      const visitors = await PresenceModel.find({ lastSeenAt: { $gte: since } })
        .sort({ lastSeenAt: -1 })
        .limit(limit)
        .lean();
      const now = Date.now();

      return res.status(200).send({
        success: true,
        message: "Get online visitors successfully",
        data: {
          thresholdSeconds,
          onlineCount: visitors.length,
          visitors: visitors.map((presence) => serializePresence(presence, now)),
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
};

export default presenceController;
