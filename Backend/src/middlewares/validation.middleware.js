import Joi from "joi";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

const BIRTHDAY_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const passwordField = () =>
  Joi.string()
    .min(6)
    .max(128)
    .messages({
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
      "string.max": "Mật khẩu không được quá 128 ký tự",
      "any.required": "Mật khẩu là bắt buộc",
      "string.empty": "Mật khẩu không được để trống",
    });

// -------------------------------------------------------
// Schemas
// -------------------------------------------------------

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Họ tên phải có ít nhất 2 ký tự",
    "string.max": "Họ tên không được quá 100 ký tự",
    "any.required": "Họ tên là bắt buộc",
    "string.empty": "Họ tên không được để trống",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
    "string.empty": "Email không được để trống",
  }),
  password: passwordField().required(),
  phone: Joi.string().trim().max(20).allow("").optional(),
  gender: Joi.string().valid("", "Nam", "Nữ", "Khác", "male", "female", "other").allow("").optional(),
  birthday: Joi.string()
    .pattern(BIRTHDAY_REGEX)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Ngày sinh phải có định dạng YYYY-MM-DD (ví dụ: 1999-12-31)",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
    "string.empty": "Email không được để trống",
  }),
  password: Joi.string().required().messages({
    "any.required": "Mật khẩu là bắt buộc",
    "string.empty": "Mật khẩu không được để trống",
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
  token: Joi.string().trim().allow("").optional(),
  otp: Joi.string().trim().pattern(/^\d{6}$/).optional().messages({
    "string.pattern.base": "Mã OTP phải gồm 6 chữ số",
  }),
  password: passwordField().required(),
}).or("token", "otp").messages({
  "object.missing": "Mã OTP là bắt buộc",
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "Họ tên phải có ít nhất 2 ký tự",
    "string.max": "Họ tên không được quá 100 ký tự",
  }),
  phone: Joi.string().trim().max(20).allow("").optional(),
  gender: Joi.string().valid("", "Nam", "Nữ", "Khác").allow("").optional(),
  birthday: Joi.string()
    .pattern(BIRTHDAY_REGEX)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Ngày sinh phải có định dạng YYYY-MM-DD (ví dụ: 1999-12-31)",
    }),
  avatar: Joi.alternatives()
    .try(
      Joi.string().uri({ scheme: ["http", "https"] }).max(2000),
      Joi.string()
        .pattern(/^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/)
        .max(3 * 1024 * 1024),
      Joi.valid("")
    )
    .optional()
    .messages({
      "alternatives.match": "Avatar phải là URL hợp lệ hoặc dữ liệu ảnh hợp lệ",
    }),
  password: passwordField().optional(),
});

// -------------------------------------------------------
// Middleware factory
// -------------------------------------------------------

/**
 * Tạo middleware validate request body theo schema Joi.
 * Trả về 400 với message lỗi đầu tiên nếu không hợp lệ.
 */
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,   // chỉ lấy lỗi đầu tiên
    stripUnknown: true, // bỏ các field không khai báo trong schema
  });

  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0]?.message || "Dữ liệu đầu vào không hợp lệ",
      data: null,
    });
  }

  // Gán lại req.body đã được strip + coerce bởi Joi
  req.body = value;
  return next();
};
