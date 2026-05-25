import rateLimit from "express-rate-limit";

/**
 * Rate limiter cho các endpoint auth nhạy cảm:
 * login, register, forgot-password — tối đa 10 request / IP / 15 phút
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    data: null,
  },
  // Không count những request thành công (chỉ count failures) — optional, bỏ comment nếu cần
  // skipSuccessfulRequests: true,
});

/**
 * Rate limiter nhẹ hơn cho refresh token: 30 request / IP / 5 phút
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu làm mới token. Vui lòng thử lại sau.",
    data: null,
  },
});
