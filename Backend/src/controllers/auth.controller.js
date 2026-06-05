import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  getBackendPublicUrl,
  getFacebookClientId,
  getFacebookClientSecret,
  getFrontendUrl,
  getGoogleClientId,
  getGoogleClientSecret,
  getGoogleRedirectUri,
  getFacebookRedirectUri,
  getJwtExpiresIn,
  getJwtRefreshExpiresIn,
  getJwtRefreshSecret,
  getJwtSecret,
} from "../config/env.js";
import UserModel from "../models/user.model.js";
import PromotionModel from "../models/promotion.model.js";
import { serializePromotion } from "./promotions.controller.js";

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
  if (["female", "nu", "nữ"].includes(normalizedValue)) return "Nữ";
  if (["other", "khac", "khác"].includes(normalizedValue)) return "Khác";
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
  savedPromotionIds: (user.savedPromotionIds || []).map((id) => String(id)),
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

const createOAuthRedirectPayload = (session = {}) => {
  const user = session.user || {};
  const avatar = String(user.avatar || "");

  return {
    ...session,
    user: {
      ...user,
      // OAuth callback passes the session through a redirect URL. Large data URL avatars
      // can exceed browser/proxy header limits, so keep the handoff payload compact.
      avatar: avatar.startsWith("data:") ? "" : avatar,
    },
  };
};

const getOAuthRedirectUri = (provider) => {
  if (provider === "google" && getGoogleRedirectUri()) {
    return getGoogleRedirectUri();
  }

  if (provider === "facebook" && getFacebookRedirectUri()) {
    return getFacebookRedirectUri();
  }

  return `${getBackendPublicUrl().replace(/\/+$/, "")}/api/v1/auth/${provider}/callback`;
};

const redirectWithAuthSession = (res, session) =>
  res.redirect(`${getFrontendUrl()}/login?authSession=${encodeRedirectPayload(createOAuthRedirectPayload(session))}`);

const redirectWithOAuthError = (res, message = "Social login failed") =>
  res.redirect(`${getFrontendUrl()}/login?authError=${encodeURIComponent(message)}`);

const getOrCreateSocialUser = async ({ email, fullName, avatar }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Social account does not provide an email address");
  }

  // Login máº¡ng xĂ£ há»™i Ä‘Æ°á»£c ná»‘i theo email: email Ä‘Ă£ cĂ³ thĂ¬ dĂ¹ng láº¡i tĂ i khoáº£n cÅ©,
  // email má»›i thĂ¬ táº¡o user má»›i vá»›i máº­t kháº©u random Ä‘Ă£ hash vĂ  cáº¥p JWT nhÆ° bĂ¬nh thÆ°á»ng.
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
          message: "Email lĂ  báº¯t buá»™c",
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

        // Demo: chÆ°a cĂ³ SMTP â†’ chá»‰ log link trĂªn server Ä‘á»ƒ dev test, KHĂ”NG tráº£ vá» trong response
        console.log(`[DEV] Password reset link for ${normalizedEmail}: ${resetUrl}`);

        return res.status(200).send({
          success: true,
          message: "Náº¿u email tá»“n táº¡i, há»‡ thá»‘ng Ä‘Ă£ táº¡o liĂªn káº¿t Ä‘áº·t láº¡i máº­t kháº©u vĂ  gá»­i qua email.",
          data: {
            email: normalizedEmail,
            expiresInMinutes: 15,
            // resetUrl khĂ´ng Ä‘Æ°á»£c tráº£ vá» client vĂ¬ lĂ½ do báº£o máº­t
          },
        });
      }

      return res.status(200).send({
        success: true,
        message: "Náº¿u email tá»“n táº¡i, há»‡ thá»‘ng Ä‘Ă£ táº¡o liĂªn káº¿t Ä‘áº·t láº¡i máº­t kháº©u.",
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
          message: "Email, token vĂ  máº­t kháº©u má»›i lĂ  báº¯t buá»™c",
          data: null,
        });
      }

      if (String(password).length < 6) {
        return res.status(400).send({
          success: false,
          message: "Máº­t kháº©u má»›i pháº£i cĂ³ Ă­t nháº¥t 6 kĂ½ tá»±",
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
          message: "LiĂªn káº¿t Ä‘áº·t láº¡i máº­t kháº©u khĂ´ng há»£p lá»‡ hoáº·c Ä‘Ă£ háº¿t háº¡n",
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
        message: "Äáº·t láº¡i máº­t kháº©u thĂ nh cĂ´ng",
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

      // Äá»•i code má»™t láº§n cá»§a Google láº¥y access token, rá»“i dĂ¹ng token Ä‘Ă³ láº¥y profile.
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

      // Äá»•i profile Google thĂ nh session Ä‘Äƒng nháº­p chuáº©n cá»§a app.
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
      // App demo chÆ°a Ä‘Æ°á»£c Meta duyá»‡t quyá»n email, nĂªn chá»‰ xin public_profile Ä‘á»ƒ trĂ¡nh lá»—i Invalid Scopes.
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

      // Äá»•i code má»™t láº§n cá»§a Facebook láº¥y access token, rá»“i dĂ¹ng token Ä‘Ă³ láº¥y profile.
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
        // KhĂ´ng láº¥y email vĂ¬ quyá»n email cáº§n Meta xĂ©t duyá»‡t; app váº«n lÆ°u user báº±ng email ná»™i bá»™ bĂªn dÆ°á»›i.
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

      // Äá»•i profile Facebook thĂ nh session Ä‘Äƒng nháº­p chuáº©n cá»§a app.
      const session = await getOrCreateSocialUser({
        // Náº¿u Facebook khĂ´ng tráº£ email, táº¡o email ná»™i bá»™ á»•n Ä‘á»‹nh theo Facebook ID Ä‘á»ƒ lÆ°u vĂ o collection users.
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
    const savedPromotions = req.authUser?.savedPromotionIds?.length
      ? await PromotionModel.find({ _id: { $in: req.authUser.savedPromotionIds }, isActive: true })
      : [];

    return res.status(200).send({
      success: true,
      message: "Get profile successfully",
      data: {
        ...serializeUser(req.authUser),
        savedPromotions: savedPromotions.map(serializePromotion),
      },
    });
  },

  savePromotion: async (req, res) => {
    try {
      const { promotionId } = req.params || {};

      if (!mongoose.Types.ObjectId.isValid(promotionId)) {
        return res.status(400).send({ success: false, message: "Promotion id is invalid", data: null });
      }

      const promotion = await PromotionModel.findOne({ _id: promotionId, isActive: true });

      if (!promotion) {
        return res.status(404).send({ success: false, message: "Promotion not found", data: null });
      }

      req.authUser.savedPromotionIds = [
        ...new Set([...(req.authUser.savedPromotionIds || []).map(String), String(promotion._id)]),
      ];
      await req.authUser.save();

      return res.status(200).send({
        success: true,
        message: "Lưu ưu đãi thành công",
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

  unsavePromotion: async (req, res) => {
    try {
      const { promotionId } = req.params || {};

      if (!mongoose.Types.ObjectId.isValid(promotionId)) {
        return res.status(400).send({ success: false, message: "Promotion id is invalid", data: null });
      }

      req.authUser.savedPromotionIds = (req.authUser.savedPromotionIds || []).filter(
        (id) => String(id) !== String(promotionId)
      );
      await req.authUser.save();

      return res.status(200).send({
        success: true,
        message: "Bỏ lưu ưu đãi thành công",
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
        if (String(password).length < 6) {
          return res.status(400).send({
            success: false,
            message: 'M\u1eadt kh\u1ea9u m\u1edbi ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t 6 k\u00fd t\u1ef1',
            data: null,
          });
        }

        if (String(password).length > 128) {
          return res.status(400).send({
            success: false,
            message: 'M\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u01b0\u1ee3c qu\u00e1 128 k\u00fd t\u1ef1',
            data: null,
          });
        }

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
      const { fileData = "" } = req.body || {};

      // Frontend sends a data URL; MongoDB stores the value so production does not write runtime files.
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

      req.authUser.avatar = `data:${mimeType};base64,${base64Data}`;
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
