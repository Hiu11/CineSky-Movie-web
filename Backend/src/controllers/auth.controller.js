import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getBackendPublicUrl,
  getFacebookClientId,
  getFacebookClientSecret,
  getFrontendUrl,
  getGoogleClientId,
  getGoogleClientSecret,
  getJwtExpiresIn,
  getJwtRefreshExpiresIn,
  getJwtRefreshSecret,
  getJwtSecret,
} from "../config/env.js";
import UserModel from "../models/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarUploadDir = path.resolve(__dirname, "../../public/uploads/avatars");
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

const normalizeGenderSafe = (gender = "") => {
  const normalizedValue = String(gender)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["male", "nam"].includes(normalizedValue)) return "Nam";
  if (["female", "nu"].includes(normalizedValue)) return "Nữ";
  if (["other", "khac"].includes(normalizedValue)) return "Khác";
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

const hashResetToken = (token = "") =>
  crypto.createHash("sha256").update(token).digest("hex");

const createResetPasswordToken = () => crypto.randomBytes(32).toString("hex");

const slugify = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getImageExtension = (mimeType = "") => {
  const extensionMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return extensionMap[mimeType] || "";
};

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
  membership: {
    tier: user.membership?.tier || "Member",
    points: Number(user.membership?.points || 0),
    totalTickets: Number(user.membership?.totalTickets || 0),
  },
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

const encodeRedirectPayload = (payload) =>
  Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const getOAuthRedirectUri = (provider) =>
  `${getBackendPublicUrl()}/api/v1/auth/${provider}/callback`;

const redirectWithAuthSession = (res, session) =>
  res.redirect(`${getFrontendUrl()}/login?authSession=${encodeRedirectPayload(session)}`);

const redirectWithOAuthError = (res, message = "Social login failed") =>
  res.redirect(`${getFrontendUrl()}/login?authError=${encodeURIComponent(message)}`);

const buildAvatarFileName = (user, rawName = "", mimeType = "") => {
  const parsedName = path.parse(String(rawName || "avatar"));
  const safeUserName = slugify(user.fullName || user.email || user._id.toString()) || "user";
  const safeBaseName = slugify(parsedName.name || "avatar") || "avatar";
  const safeExtension = getImageExtension(mimeType) || parsedName.ext.toLowerCase() || ".jpg";

  return `${safeUserName}-${Date.now()}-${safeBaseName}${safeExtension}`;
};

const getOrCreateSocialUser = async ({ email, fullName, avatar }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Social account does not provide an email address");
  }

  // Login mạng xã hội được nối theo email: email đã có thì dùng lại tài khoản cũ,
  // email mới thì tạo user mới với mật khẩu random đã hash và cấp JWT như bình thường.
  let user = await UserModel.findOne({ email: normalizedEmail }).select("+refreshToken");

  if (!user) {
    user = await UserModel.create({
      fullName: String(fullName || normalizedEmail.split("@")[0]).trim(),
      email: normalizedEmail,
      password: await hashPassword(crypto.randomBytes(24).toString("hex")),
      avatar: String(avatar || "").trim(),
    });
  } else if (avatar && !user.avatar) {
    user.avatar = String(avatar).trim();
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return createAuthPayload(user, accessToken, refreshToken);
};

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
        gender: normalizeGenderSafe(gender),
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

  forgotPassword: async (req, res) => {
    try {
      const { email = "" } = req.body || {};
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        return res.status(400).send({
          success: false,
          message: "Email là bắt buộc",
          data: null,
        });
      }

      const user = await UserModel.findOne({ email: normalizedEmail }).select(
        "+resetPasswordTokenHash +resetPasswordExpiresAt"
      );

      if (user) {
        const resetToken = createResetPasswordToken();
        user.resetPasswordTokenHash = hashResetToken(resetToken);
        user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const resetUrl = `${getFrontendUrl()}/forgot-password?token=${resetToken}&email=${encodeURIComponent(
          normalizedEmail
        )}`;

        // Demo project chưa cấu hình SMTP, nên backend tạo token thật trong DB và log link để test luồng reset.
        console.log(`Password reset link for ${normalizedEmail}: ${resetUrl}`);

        return res.status(200).send({
          success: true,
          message: "Nếu email tồn tại, hệ thống đã tạo liên kết đặt lại mật khẩu.",
          data: {
            email: normalizedEmail,
            expiresInMinutes: 15,
            resetUrl,
          },
        });
      }

      return res.status(200).send({
        success: true,
        message: "Nếu email tồn tại, hệ thống đã tạo liên kết đặt lại mật khẩu.",
        data: {
          email: normalizedEmail,
          expiresInMinutes: 15,
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

  resetPassword: async (req, res) => {
    try {
      const { email = "", token = "", password = "" } = req.body || {};
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail || !token || !password) {
        return res.status(400).send({
          success: false,
          message: "Email, token và mật khẩu mới là bắt buộc",
          data: null,
        });
      }

      if (String(password).length < 6) {
        return res.status(400).send({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
          data: null,
        });
      }

      const user = await UserModel.findOne({ email: normalizedEmail }).select(
        "+password +resetPasswordTokenHash +resetPasswordExpiresAt +refreshToken"
      );

      if (
        !user ||
        !user.resetPasswordTokenHash ||
        user.resetPasswordTokenHash !== hashResetToken(token) ||
        !user.resetPasswordExpiresAt ||
        user.resetPasswordExpiresAt.getTime() < Date.now()
      ) {
        return res.status(400).send({
          success: false,
          message: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
          data: null,
        });
      }

      user.password = await hashPassword(password);
      user.refreshToken = "";
      user.resetPasswordTokenHash = "";
      user.resetPasswordExpiresAt = null;
      await user.save();

      return res.status(200).send({
        success: true,
        message: "Đặt lại mật khẩu thành công",
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

  redirectGoogle: (req, res) => {
    const clientId = getGoogleClientId();

    if (!clientId || !getGoogleClientSecret()) {
      return redirectWithOAuthError(res, "Google login is not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("google"),
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  },

  handleGoogleCallback: async (req, res) => {
    try {
      const { code = "" } = req.query || {};

      if (!code) {
        return redirectWithOAuthError(res, "Google login was cancelled");
      }

      // Đổi code một lần của Google lấy access token, rồi dùng token đó lấy profile.
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: getGoogleClientId(),
          client_secret: getGoogleClientSecret(),
          redirect_uri: getOAuthRedirectUri("google"),
          grant_type: "authorization_code",
        }),
      });
      const tokenPayload = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenPayload.access_token) {
        throw new Error(tokenPayload.error_description || "Google token exchange failed");
      }

      const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
        },
      });
      const profile = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profile.error?.message || "Google profile request failed");
      }

      // Đổi profile Google thành session đăng nhập chuẩn của app.
      const session = await getOrCreateSocialUser({
        email: profile.email,
        fullName: profile.name,
        avatar: profile.picture,
      });

      return redirectWithAuthSession(res, session);
    } catch (error) {
      return redirectWithOAuthError(res, error.message);
    }
  },

  redirectFacebook: (req, res) => {
    const clientId = getFacebookClientId();

    if (!clientId || !getFacebookClientSecret()) {
      return redirectWithOAuthError(res, "Facebook login is not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("facebook"),
      // App demo chưa được Meta duyệt quyền email, nên chỉ xin public_profile để tránh lỗi Invalid Scopes.
      scope: "public_profile",
    });

    return res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
  },

  handleFacebookCallback: async (req, res) => {
    try {
      const { code = "" } = req.query || {};

      if (!code) {
        return redirectWithOAuthError(res, "Facebook login was cancelled");
      }

      // Đổi code một lần của Facebook lấy access token, rồi dùng token đó lấy profile.
      const tokenParams = new URLSearchParams({
        client_id: getFacebookClientId(),
        client_secret: getFacebookClientSecret(),
        redirect_uri: getOAuthRedirectUri("facebook"),
        code,
      });
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`
      );
      const tokenPayload = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenPayload.access_token) {
        throw new Error(tokenPayload.error?.message || "Facebook token exchange failed");
      }

      const profileParams = new URLSearchParams({
        // Không lấy email vì quyền email cần Meta xét duyệt; app vẫn lưu user bằng email nội bộ bên dưới.
        fields: "id,name,picture.type(large)",
        access_token: tokenPayload.access_token,
      });
      const profileResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?${profileParams.toString()}`
      );
      const profile = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profile.error?.message || "Facebook profile request failed");
      }

      // Đổi profile Facebook thành session đăng nhập chuẩn của app.
      const session = await getOrCreateSocialUser({
        // Nếu Facebook không trả email, tạo email nội bộ ổn định theo Facebook ID để lưu vào collection users.
        email: profile.email || `facebook-${profile.id}@cinesky.local`,
        fullName: profile.name,
        avatar: profile.picture?.data?.url,
      });

      return redirectWithAuthSession(res, session);
    } catch (error) {
      return redirectWithOAuthError(res, error.message);
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
        user.gender = normalizeGenderSafe(gender);
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

  uploadAvatar: async (req, res) => {
    try {
      const { fileName = "", fileData = "" } = req.body || {};

      // Frontend gửi ảnh dưới dạng data URL, backend tách mime type và phần base64 để lưu file.
      const matchedDataUrl = String(fileData).match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);

      if (!matchedDataUrl) {
        return res.status(400).send({
          success: false,
          message: "Avatar image data is invalid",
          data: null,
        });
      }

      const [, mimeType, base64Data] = matchedDataUrl;
      const imageBuffer = Buffer.from(base64Data, "base64");

      if (!imageBuffer.length || imageBuffer.length > 2 * 1024 * 1024) {
        return res.status(400).send({
          success: false,
          message: "Avatar image must be smaller than 2MB",
          data: null,
        });
      }

      await fs.mkdir(avatarUploadDir, { recursive: true });

      // File được lưu trong Backend/public/uploads/avatars để express.static có thể public ra URL.
      const storedFileName = buildAvatarFileName(req.authUser, fileName, mimeType);
      const targetPath = path.join(avatarUploadDir, storedFileName);

      await fs.writeFile(targetPath, imageBuffer);

      // Database chỉ lưu URL ảnh, không lưu base64/file binary.
      const avatarUrl = `${getBackendPublicUrl()}/uploads/avatars/${storedFileName}`;
      req.authUser.avatar = avatarUrl;
      await req.authUser.save();

      return res.status(201).send({
        success: true,
        message: "Upload avatar successfully",
        data: serializeUser(req.authUser),
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
