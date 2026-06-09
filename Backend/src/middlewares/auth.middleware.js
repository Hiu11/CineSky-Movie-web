import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";
import UserModel from "../models/user.model.js";

const getBearerToken = (authorizationHeader = "") => {
  const [scheme = "", token = ""] = String(authorizationHeader).trim().split(" ");

  if (scheme.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Authorization token is required",
        data: null,
      });
    }

    const jwtSecret = getJwtSecret();

    if (!jwtSecret) {
      return res.status(500).send({
        success: false,
        message: "JWT secret is not configured",
        data: null,
      });
    }

    const payload = jwt.verify(token, jwtSecret);
    // Exclude avatar (can be large base64 string) to keep auth middleware lightweight.
    // Avatar is still available via the /api/v1/auth/me endpoint when explicitly needed.
    const user = await UserModel.findById(payload.userId).select("-avatar");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found or token is invalid",
        data: null,
      });
    }

    req.authUser = user;
    req.authToken = token;
    return next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
      data: null,
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const jwtSecret = getJwtSecret();

    if (!token || !jwtSecret) {
      return next();
    }

    const payload = jwt.verify(token, jwtSecret);
    const user = await UserModel.findById(payload.userId).select("-avatar");

    if (user) {
      req.authUser = user;
      req.authToken = token;
    }

    return next();
  } catch {
    return next();
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  const userRole = req.authUser?.role || "";

  if (!roles.includes(userRole)) {
    return res.status(403).send({
      success: false,
      message: "You do not have permission to access this resource",
      data: null,
    });
  }

  return next();
};
