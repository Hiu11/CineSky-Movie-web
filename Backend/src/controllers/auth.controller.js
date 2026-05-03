import crypto from "crypto";
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

const hashPassword = (password = "") =>
  crypto.createHash("sha256").update(password).digest("hex");

const isPasswordMatch = (storedPassword = "", plainPassword = "") =>
  storedPassword === plainPassword || storedPassword === hashPassword(plainPassword);

const serializeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || "",
  gender: user.gender || "",
  birthday: user.birthday || "",
  role: user.role,
  avatar: user.avatar || "",
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

      const user = await UserModel.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashPassword(password),
        phone: phone.trim(),
        gender: normalizeGender(gender),
        birthday: birthday || "",
      });

      return res.status(201).send({
        success: true,
        message: "Register successfully",
        data: serializeUser(user),
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
      const user = await UserModel.findOne({ email: normalizedEmail });

      if (!user || !isPasswordMatch(user.password, password)) {
        return res.status(401).send({
          success: false,
          message: "Invalid email or password",
          data: null,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Login successfully",
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
};

export default authController;
