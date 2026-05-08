import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getJwtExpiresIn,
  getJwtRefreshExpiresIn,
  getJwtRefreshSecret,
  getJwtSecret,
} from "../config/env.js";
import UserModel from "../models/user.model.js";

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const normalizeGender = (gender = "") => {
  const normalizedValue = String(gender).trim().toLowerCase();

  if (["male", "nam"].includes(normalizedValue)) {
    return "Nam";
  }

  if (["female", "nu", "nữ"].includes(normalizedValue)) {
    return "Nữ";
  }

  if (["other", "khac", "khác"].includes(normalizedValue)) {
    return "Khác";
  }

  return "";
};

const hashLegacyPassword = (password = "") =>
  crypto.createHash("sha256").update(password).digest("hex");

const isLegacyPasswordMatch = (storedPassword = "", plainPassword = "") =>
  storedPassword === plainPassword || storedPassword === hashLegacyPassword(plainPassword);

const isBcryptHash = (hashedPassword = "") =>
  String(hashedPassword).startsWith("$2a$") ||
  String(hashedPassword).startsWith("$2b$") ||
  String(hashedPassword).startsWith("$2y$");

const hashPassword = async (password = "") => bcrypt.hash(password, 10);

const isPasswordMatch = async (storedPassword = "", plainPassword = "") => {
  if (!storedPassword || !plainPassword) {
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return isLegacyPasswordMatch(storedPassword, plainPassword);
};

const serializeUser = (user) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || "",
  gender: user.gender || "",
  birthday: user.birthday || "",
  role: user.role,
  avatar: user.avatar || "",
});

const createAccessToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
    },
    getJwtRefreshSecret(),
    {
      expiresIn: getJwtRefreshExpiresIn(),
    }
  );

const createAuthPayload = (user, accessToken, refreshToken) => ({
  user: serializeUser(user),
  accessToken,
  refreshToken,
});

const authController = {
  register: async (req, res) => {
    try {
      const {
        fullName = "",
        email = "",
        password = "",
        phone = "",
        gender = "",
        birthday = "",
      } = req.body || {};

      if (!fullName.trim() || !email.trim() || !password) {
        return res.status(400).send({
          success: false,
          message: "Full name, email and password are required",
          data: null,
        });
      }

      const normalizedEmail = normalizeEmail(email);
      const existingUser = await UserModel.findOne({ email: normalizedEmail });

      if (existingUser) {
        return res.status(409).send({
          success: false,
          message: "Email already in use",
          data: null,
        });
      }

      const hashedPassword = await hashPassword(password);

      const user = await UserModel.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone.trim(),
        gender: normalizeGender(gender),
        birthday: birthday || "",
      });

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      return res.status(201).send({
        success: true,
        message: "Register successfully",
        data: createAuthPayload(user, accessToken, refreshToken),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).send({
          success: false,
          message: "Email already in use",
          data: null,
        });
      }

      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email = "", password = "" } = req.body || {};

      if (!email.trim() || !password) {
        return res.status(400).send({
          success: false,
          message: "Email and password are required",
          data: null,
        });
      }

      const normalizedEmail = normalizeEmail(email);
      const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");

      if (!user || !(await isPasswordMatch(user.password, password))) {
        return res.status(401).send({
          success: false,
          message: "Invalid email or password",
          data: null,
        });
      }

      if (!isBcryptHash(user.password)) {
        user.password = await hashPassword(password);
      }

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).send({
        success: true,
        message: "Login successfully",
        data: createAuthPayload(user, accessToken, refreshToken),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken = "" } = req.body || {};

      if (!refreshToken) {
        return res.status(400).send({
          success: false,
          message: "Refresh token is required",
          data: null,
        });
      }

      const payload = jwt.verify(refreshToken, getJwtRefreshSecret());
      const user = await UserModel.findById(payload.userId).select("+refreshToken");

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).send({
          success: false,
          message: "Refresh token is invalid",
          data: null,
        });
      }

      const nextAccessToken = createAccessToken(user);
      const nextRefreshToken = createRefreshToken(user);

      user.refreshToken = nextRefreshToken;
      await user.save();

      return res.status(200).send({
        success: true,
        message: "Refresh token successfully",
        data: createAuthPayload(user, nextAccessToken, nextRefreshToken),
      });
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Refresh token is invalid or expired",
        data: null,
      });
    }
  },

  getProfile: async (req, res) => {
    return res.status(200).send({
      success: true,
      message: "Get profile successfully",
      data: serializeUser(req.authUser),
    });
  },

  updateProfile: async (req, res) => {
    try {
      const {
        fullName,
        phone,
        gender,
        birthday,
        avatar,
        password = "",
      } = req.body || {};

      const user = req.authUser;

      if (typeof fullName === "string" && fullName.trim()) {
        user.fullName = fullName.trim();
      }

      if (typeof phone === "string") {
        user.phone = phone.trim();
      }

      if (typeof gender === "string") {
        user.gender = normalizeGender(gender);
      }

      if (typeof birthday === "string") {
        user.birthday = birthday;
      }

      if (typeof avatar === "string") {
        user.avatar = avatar.trim();
      }

      if (password) {
        user.password = await hashPassword(password);
      }

      await user.save();

      return res.status(200).send({
        success: true,
        message: "Update profile successfully",
        data: serializeUser(user),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  logout: async (req, res) => {
    try {
      req.authUser.refreshToken = "";
      await req.authUser.save();

      return res.status(200).send({
        success: true,
        message: "Logout successfully",
        data: null,
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

export default authController;
