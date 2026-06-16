import mongoose from "mongoose";
import crypto from "crypto";
import BookingModel from "../models/booking.model.js";
import MovieModel from "../models/movie.model.js";
import NotificationModel from "../models/notification.model.js";
import PromotionModel from "../models/promotion.model.js";
import PromotionRedemptionModel from "../models/promotionRedemption.model.js";
import SeatLockModel from "../models/seatLock.model.js";
import ShowtimeModel from "../models/showtime.model.js";
import { sendBookingConfirmationEmail } from "../services/mockEmail.service.js";
import { getMockPaymentSession } from "../services/mockPayment.service.js";

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");
const POINTS_PER_TICKET = 100;
const TICKET_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEAT_LOCK_MINUTES = 10;
const DEFAULT_SERVICE_FEE_PER_TICKET = 3000;
const WEEKEND_SURCHARGE_RATE = 0.18;
const HOLIDAY_SURCHARGE_RATE = 0.28;
const FIXED_HOLIDAY_DATES = new Set(["01-01", "04-30", "05-01", "09-02", "12-24", "12-25"]);
const SEASONAL_HOLIDAY_DATES = new Set([
  "2026-02-16",
  "2026-02-17",
  "2026-02-18",
  "2026-02-19",
  "2026-02-20",
  "2026-02-21",
  "2026-02-22",
]);

const buildTicketCode = (bookingId) =>
  `CSK${String(bookingId || "")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-10)
    .toUpperCase()
    .padStart(10, "0")}`;

const buildRandomTicketCode = () =>
  `CSK${Array.from({ length: 10 }, () => TICKET_ALPHABET[crypto.randomInt(TICKET_ALPHABET.length)]).join("")}`;

const createUniqueTicketCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const ticketCode = buildRandomTicketCode();
    const existingBooking = await BookingModel.exists({ ticketCode });

    if (!existingBooking) {
      return ticketCode;
    }
  }

  return buildTicketCode(new mongoose.Types.ObjectId());
};

const buildScreeningDateTime = (screeningDate = "", displayTime = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(screeningDate)) || !/^\d{2}:\d{2}$/.test(String(displayTime))) {
    return null;
  }

  const date = new Date(`${screeningDate}T${displayTime}:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getScreeningPriceMultiplier = (screeningDate = "") => {
  const normalizedDate = String(screeningDate || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    return 1;
  }

  const date = new Date(`${normalizedDate}T12:00:00+07:00`);
  const isWeekend = [0, 6].includes(date.getDay());
  const isHoliday = FIXED_HOLIDAY_DATES.has(normalizedDate.slice(5)) || SEASONAL_HOLIDAY_DATES.has(normalizedDate);

  if (isHoliday) {
    return 1 + HOLIDAY_SURCHARGE_RATE;
  }

  if (isWeekend) {
    return 1 + WEEKEND_SURCHARGE_RATE;
  }

  return 1;
};

const getEffectiveTicketPrice = (basePrice = 0, screeningDate = "") =>
  Math.round((Number(basePrice || 0) * getScreeningPriceMultiplier(screeningDate)) / 1000) * 1000;

const cinemaOffsetRules = [
  { pattern: /nguyen hue/i, minutes: 0 },
  { pattern: /hai ba trung/i, minutes: 10 },
  { pattern: /dien bien phu/i, minutes: 20 },
];

const getCinemaOffsetMinutes = (cinemaName = "") =>
  cinemaOffsetRules.find((rule) => rule.pattern.test(String(cinemaName)))?.minutes || 0;

const shiftTimeLabel = (timeLabel = "", offsetMinutes = 0) => {
  if (!/^\d{2}:\d{2}$/.test(String(timeLabel))) {
    return timeLabel || "";
  }

  const [hour, minute] = String(timeLabel).split(":").map(Number);
  const totalMinutes = (hour * 60 + minute + offsetMinutes + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinute = totalMinutes % 60;

  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
};

const getShowtimeAdjustedDisplayTime = (showtime) =>
  shiftTimeLabel(showtime?.displayTime || "", getCinemaOffsetMinutes(showtime?.cinemaName));

const getBookingDisplayTime = (booking, showtime) =>
  booking?.displayTime || getShowtimeAdjustedDisplayTime(showtime) || showtime?.displayTime || "";

const getBookingEffectiveStatus = (booking, showtime, movie) => {
  const durationMinutes = Number(movie?.duration || 0) || 120;
  const displayTime = getBookingDisplayTime(booking, showtime);
  const screeningStartFromBooking = booking.screeningDate
    ? buildScreeningDateTime(booking.screeningDate, displayTime)
    : null;
  const screeningEndFromBooking =
    screeningStartFromBooking && !Number.isNaN(screeningStartFromBooking.getTime())
      ? new Date(screeningStartFromBooking.getTime() + durationMinutes * 60000)
      : null;

  if (
    booking.status === "expired" &&
    screeningEndFromBooking &&
    screeningEndFromBooking.getTime() >= Date.now()
  ) {
    return "booked";
  }

  if (booking.status !== "booked") {
    return booking.status;
  }

  if (screeningEndFromBooking) {
    return screeningEndFromBooking.getTime() < Date.now() ? "expired" : booking.status;
  }

  const screeningEndFromShowtime = showtime?.endTime ? new Date(showtime.endTime) : null;

  if (screeningEndFromShowtime && !Number.isNaN(screeningEndFromShowtime.getTime())) {
    return screeningEndFromShowtime.getTime() < Date.now() ? "expired" : booking.status;
  }

  const screeningStart =
    buildScreeningDateTime(booking.screeningDate || showtime?.displayDate, displayTime) ||
    (showtime?.startTime ? new Date(showtime.startTime) : null);

  if (!screeningStart || Number.isNaN(screeningStart.getTime())) {
    return booking.status;
  }

  const screeningEnd = new Date(screeningStart.getTime() + durationMinutes * 60000);

  return screeningEnd.getTime() < Date.now() ? "expired" : booking.status;
};

const expireBookingIfNeeded = async (booking, showtime, movie) => {
  if (!booking || booking.status !== "booked") {
    return booking;
  }

  if (getBookingEffectiveStatus(booking, showtime, movie) !== "expired") {
    return booking;
  }

  booking.status = "expired";
  await booking.save();
  return booking;
};

const getMembershipTier = (points = 0) => {
  if (points >= 3000) return "Diamond";
  if (points >= 1500) return "Gold";
  if (points >= 500) return "Silver";
  return "Member";
};

const serializeMembership = (membership = {}) => {
  const points = Number(membership.points || 0);
  const totalTickets = Number(membership.totalTickets || 0);
  const tier = membership.tier || getMembershipTier(points);
  const nextTierPoints = tier === "Member" ? 500 : tier === "Silver" ? 1500 : tier === "Gold" ? 3000 : points;

  return {
    tier,
    points,
    totalTickets,
    nextTierPoints,
    pointsToNextTier: Math.max(nextTierPoints - points, 0),
  };
};

const updateUserMembership = async (user, ticketDelta = 0) => {
  if (!user?._id || !ticketDelta) {
    return serializeMembership(user?.membership);
  }

  const currentTickets = Number(user.membership?.totalTickets || 0);
  const currentPoints = Number(user.membership?.points || 0);
  const totalTickets = Math.max(currentTickets + ticketDelta, 0);
  const points = Math.max(currentPoints + ticketDelta * POINTS_PER_TICKET, 0);

  user.membership = {
    points,
    totalTickets,
    tier: getMembershipTier(points),
  };
  await user.save();

  return serializeMembership(user.membership);
};

const getServiceFeePerTicket = () =>
  Number(process.env.SERVICE_FEE_PER_TICKET) || DEFAULT_SERVICE_FEE_PER_TICKET;

const verifyQrPaymentReference = async (paymentReference = "", expectedAmount = 0) => {
  const reference = String(paymentReference || "").trim();

  if (!reference.startsWith("QR-")) {
    return null;
  }

  const sessionId = reference.slice(3);
  const session = await getMockPaymentSession(sessionId);

  if (session.status !== "paid") {
    const error = new Error("Thanh toán QR chưa được xác nhận trên điện thoại.");
    error.statusCode = 402;
    throw error;
  }

  if (Number(session.amount || 0) !== Number(expectedAmount || 0)) {
    const error = new Error("Số tiền thanh toán QR không khớp với đơn đặt vé.");
    error.statusCode = 409;
    throw error;
  }

  return session;
};

const cleanupExpiredSeatLocks = () =>
  SeatLockModel.deleteMany({ expiresAt: { $lte: new Date() } });

const normalizePromoCode = (value = "") =>
  String(value).trim().toUpperCase().replace(/\s+/g, "");

const tierRank = { Member: 0, Silver: 1, Gold: 2, Diamond: 3 };

const getUserMembershipTier = (user) => {
  const points = Number(user?.membership?.points);

  if (Number.isFinite(points)) {
    return getMembershipTier(points);
  }

  return user?.membership?.tier || "Member";
};

const getVietnamWeekday = (screeningDate = "") => {
  const normalizedDate = String(screeningDate || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    return null;
  }

  const date = new Date(`${normalizedDate}T12:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date.getDay();
};

const getLegacyVoucherDiscount = async ({ promoCode = "", subtotal = 0, fnbTotal = 0, ticketCount = 0, user = null }) => {
  const code = normalizePromoCode(promoCode);

  if (!code) {
    return { code: "", discountAmount: 0, message: "" };
  }

  const promotion = await PromotionModel.findOne({
    isActive: true,
    $or: [
      { code },
      { tag: { $regex: `^${code}$`, $options: "i" } },
    ],
  });

  const baseAmount = Math.max(Number(subtotal || 0), 0);
  const comboAmount = Math.max(Number(fnbTotal || 0), 0);
  let discountAmount = 0;

  if (promotion) {
    if (promotion.minOrderValue && baseAmount + comboAmount < promotion.minOrderValue) {
      const error = new Error(`Mã ${code} chỉ áp dụng cho đơn từ ${Number(promotion.minOrderValue).toLocaleString("vi-VN")} VND.`);
      error.statusCode = 400;
      throw error;
    }

    if (promotion.memberOnly) {
      const requiredTier = promotion.tier || "Member";
      const currentTier = user?.membership?.tier || "Member";

      if ((tierRank[currentTier] || 0) < (tierRank[requiredTier] || 0)) {
        const error = new Error(`Mã ${code} chỉ dành cho thành viên ${requiredTier} trở lên.`);
        error.statusCode = 403;
        throw error;
      }
    }

    if (promotion.kind === "combo" && comboAmount <= 0) {
      const error = new Error(`Mã ${code} chỉ áp dụng khi đơn có combo bắp nước.`);
      error.statusCode = 400;
      throw error;
    }

    const text = `${promotion.title} ${promotion.value} ${promotion.description}`.toLowerCase();
    const percentMatch = text.match(/(\d{1,2})\s*%/);
    const moneyMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,})\s*(?:vnd|đ|d)?/i);

    if (percentMatch) {
      discountAmount = Math.round((baseAmount * Number(percentMatch[1])) / 100);
    } else if (moneyMatch) {
      discountAmount = Number(moneyMatch[1].replace(/[.,]/g, ""));
    } else if (promotion.kind === "combo") {
      discountAmount = Math.min(comboAmount, 25000);
    } else if (promotion.kind === "member") {
      discountAmount = Math.round(baseAmount * 0.1);
    } else {
      discountAmount = 30000;
    }
  } else {
    const fallbackVouchers = {
      CINESKY10: Math.round(baseAmount * 0.1),
      CINESKY20: Math.round(baseAmount * 0.2),
      CINESKY30: 30000,
      SKY50000: 50000,
      COMBO25: Math.min(comboAmount, 25000),
    };

    discountAmount = fallbackVouchers[code] || 0;
  }

  if (discountAmount <= 0) {
    const error = new Error("Mã khuyến mãi không hợp lệ hoặc chưa đủ điều kiện áp dụng.");
    error.statusCode = 400;
    throw error;
  }

  const cappedDiscount = Math.min(discountAmount, Math.max(baseAmount + comboAmount, 0));

  return {
    code,
    discountAmount: cappedDiscount,
    message: `Đã áp dụng mã ${code}, giảm ${cappedDiscount.toLocaleString("vi-VN")} VND.`,
    promotionId: promotion?._id || null,
    ticketCount,
  };
};

const isPromotionLive = (promotion) => {
  const now = Date.now();
  const startsAt = promotion?.startsAt ? new Date(promotion.startsAt).getTime() : 0;
  const endsAt = promotion?.endsAt ? new Date(promotion.endsAt).getTime() : 0;

  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
};

const hasIntersection = (left = [], right = []) => {
  const normalizedRight = new Set(right.map((item) => String(item).trim().toLowerCase()).filter(Boolean));
  return left.some((item) => normalizedRight.has(String(item).trim().toLowerCase()));
};

let promotionRedemptionIndexSync = null;
const ensurePromotionRedemptionIndexes = () => {
  if (!promotionRedemptionIndexSync) {
    promotionRedemptionIndexSync = (async () => {
      const indexes = await PromotionRedemptionModel.collection.indexes();
      const legacyUniqueIndexes = indexes.filter((index) => {
        const keys = Object.keys(index.key || {});
        return (
          index.unique &&
          keys.length === 2 &&
          index.key.userId === 1 &&
          (index.key.promotionId === 1 || index.key.code === 1)
        );
      });

      await Promise.all(legacyUniqueIndexes.map((index) => PromotionRedemptionModel.collection.dropIndex(index.name)));
      await PromotionRedemptionModel.syncIndexes();
    })().catch((error) => {
      promotionRedemptionIndexSync = null;
      throw error;
    });
  }

  return promotionRedemptionIndexSync;
};

const getPromotionComboSubtotal = (promotion, fnbItems = [], fallbackAmount = 0) => {
  const applicableComboIds = new Set((promotion.applicableComboIds || []).map((id) => String(id).trim()).filter(Boolean));
  const scopedItems = applicableComboIds.size
    ? fnbItems.filter((item) => applicableComboIds.has(String(item.id || "").trim()))
    : fnbItems;
  const subtotal = scopedItems.reduce(
    (sum, item) => sum + Math.max(Number(item.price || 0), 0) * Math.max(Number(item.quantity || 0), 0),
    0
  );
  const quantity = scopedItems.reduce((sum, item) => sum + Math.max(Number(item.quantity || 0), 0), 0);

  return {
    subtotal: subtotal || fallbackAmount,
    quantity: quantity || (fallbackAmount > 0 ? 1 : 0),
  };
};

const calculatePromotionDiscount = ({ promotion, baseAmount, comboAmount, ticketCount, fnbItems = [] }) => {
  const discountType = promotion.discountType || "fixed";
  const discountValue = Math.max(Number(promotion.discountValue || 0), 0);

  if (discountType === "percent") {
    return Math.round((baseAmount * Math.min(discountValue, 100)) / 100);
  }

  if (discountType === "combo_price") {
    const comboScope = getPromotionComboSubtotal(promotion, fnbItems, comboAmount);
    const targetAmount = discountValue * Math.max(comboScope.quantity, 1);
    return comboScope.subtotal > targetAmount ? comboScope.subtotal - targetAmount : 0;
  }

  if (discountType === "free_ticket") {
    const safeTicketCount = Math.max(Number(ticketCount || 0), 1);
    return Math.round(baseAmount / safeTicketCount);
  }

  return discountValue;
};

const getVoucherDiscount = async ({
  promoCode = "",
  subtotal = 0,
  fnbTotal = 0,
  ticketCount = 0,
  user = null,
  movie = null,
  fnbItems = [],
  screeningDate = "",
}) => {
  const code = normalizePromoCode(promoCode);

  if (!code) {
    return { code: "", discountAmount: 0, message: "" };
  }

  const promotion = await PromotionModel.findOne({ isActive: true, code });
  const baseAmount = Math.max(Number(subtotal || 0), 0);
  const comboAmount = Math.max(Number(fnbTotal || 0), 0);
  const orderAmount = baseAmount + comboAmount;

  if (!promotion) {
    const error = new Error("Mã khuyến mãi không tồn tại hoặc đã tắt.");
    error.statusCode = 404;
    throw error;
  }

  if (!isPromotionLive(promotion)) {
    const error = new Error(`Mã ${code} chưa đến hạn hoặc đã hết hạn.`);
    error.statusCode = 400;
    throw error;
  }

  if (promotion.totalUsageLimit && promotion.usedCount >= promotion.totalUsageLimit) {
    const error = new Error(`Mã ${code} đã hết lượt sử dụng.`);
    error.statusCode = 409;
    throw error;
  }

  if (promotion.minOrderValue && orderAmount < promotion.minOrderValue) {
    const error = new Error(`Mã ${code} chỉ áp dụng cho đơn từ ${Number(promotion.minOrderValue).toLocaleString("vi-VN")} VND.`);
    error.statusCode = 400;
    throw error;
  }

  if (promotion.memberOnly || promotion.eligibleTiers?.length) {
    const allowedTiers = promotion.eligibleTiers?.length ? promotion.eligibleTiers : [promotion.tier || "Member"];
    const currentTier = getUserMembershipTier(user);
    const isAllowed = allowedTiers.some((tier) => (tierRank[currentTier] || 0) >= (tierRank[tier] || 0));

    if (!isAllowed) {
      const minimumTier = allowedTiers.reduce((lowest, tier) =>
        (tierRank[tier] || 0) < (tierRank[lowest] || 0) ? tier : lowest
      , allowedTiers[0]);
      const error = new Error(`Mã ${code} chỉ dành cho thành viên ${minimumTier} trở lên.`);
      error.statusCode = 403;
      throw error;
    }
  }

  if (promotion.requiredPoints && Number(user?.membership?.points || 0) < promotion.requiredPoints) {
    const error = new Error(`Mã ${code} yêu cầu tối thiểu ${promotion.requiredPoints} điểm thành viên.`);
    error.statusCode = 403;
    throw error;
  }

  if (promotion.kind === "combo" && comboAmount <= 0) {
    const error = new Error(`Mã ${code} chỉ áp dụng khi đơn có combo bắp nước.`);
    error.statusCode = 400;
    throw error;
  }

  if (promotion.applicableGenres?.length && !hasIntersection(promotion.applicableGenres, movie?.genres || [])) {
    const error = new Error(`Mã ${code} không áp dụng cho thể loại phim này.`);
    error.statusCode = 400;
    throw error;
  }

  if (promotion.applicableComboIds?.length && !hasIntersection(promotion.applicableComboIds, fnbItems.map((item) => item.id))) {
    const error = new Error(`Mã ${code} chỉ áp dụng cho combo được cấu hình.`);
    error.statusCode = 400;
    throw error;
  }

  if (promotion.applicableWeekdays?.length) {
    const selectedWeekday = getVietnamWeekday(screeningDate);

    if (selectedWeekday === null || !promotion.applicableWeekdays.includes(selectedWeekday)) {
      const weekdayLabels = ["Chủ nhật", "thứ Hai", "thứ Ba", "thứ Tư", "thứ Năm", "thứ Sáu", "thứ Bảy"];
      const allowedDays = promotion.applicableWeekdays.map((day) => weekdayLabels[day]).join(", ");
      const error = new Error(`Mã ${code} chỉ áp dụng cho ngày chiếu ${allowedDays}.`);
      error.statusCode = 400;
      throw error;
    }
  }

  if (promotion.maxUsesPerUser && user?._id) {
    const redemptionCount = await PromotionRedemptionModel.countDocuments({
      promotionId: promotion._id,
      userId: user._id,
    });

    if (redemptionCount >= promotion.maxUsesPerUser) {
      const error = new Error(`Mã ${code} mỗi tài khoản chỉ được sử dụng ${promotion.maxUsesPerUser} lần.`);
      error.statusCode = 409;
      throw error;
    }
  }

  const discountAmount = calculatePromotionDiscount({ promotion, baseAmount, comboAmount, ticketCount, fnbItems });

  if (discountAmount <= 0) {
    const error = new Error("Mã khuyến mãi không hợp lệ hoặc chưa đủ điều kiện áp dụng.");
    error.statusCode = 400;
    throw error;
  }

  const cappedDiscount = Math.min(discountAmount, Math.max(orderAmount, 0));

  return {
    code,
    discountAmount: cappedDiscount,
    message: `Đã áp dụng mã ${code}, giảm ${cappedDiscount.toLocaleString("vi-VN")} VND.`,
    promotionId: promotion._id,
    ticketCount,
  };
};

const createBookingNotifications = async ({ authUser, booking, movie, showtime }) => {
  if (!authUser?._id) {
    return;
  }

  const showtimeLabel = [booking.screeningDateLabel || showtime?.displayDate, getBookingDisplayTime(booking, showtime)]
    .filter(Boolean)
    .join(" ");

  const reminderTime = getReminderScheduledFor(booking, showtime);

  await NotificationModel.insertMany([
    {
      userId: authUser._id,
      title: "Vé CineSky đã sẵn sàng",
      message: `Vé ${booking.ticketCode} cho phim ${movie?.title || "CineSky"} đã được xác nhận. Ghế: ${(booking.seatNumbers || []).join(", ")}.`,
      type: "booking_confirmation",
      sourceId: booking._id,
      sourceType: "booking",
    },
    {
      userId: authUser._id,
      title: "Nhắc lịch xem phim",
      message: `Bạn có lịch xem ${movie?.title || "phim"} lúc ${showtimeLabel || "suất đã chọn"}. Hãy đến rạp sớm 15 phút để check-in.`,
      type: "showtime_reminder",
      sourceId: booking._id,
      sourceType: "booking",
      scheduledFor: reminderTime,
    },
  ]);
};

const getReminderScheduledFor = (booking, showtime) => {
  const displayTime = getBookingDisplayTime(booking, showtime);
  const startTime =
    buildScreeningDateTime(booking.screeningDate || showtime?.displayDate, displayTime) ||
    (showtime?.startTime ? new Date(showtime.startTime) : null);

  if (!startTime || Number.isNaN(startTime.getTime())) {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  const reminder = new Date(startTime.getTime() - 60 * 60 * 1000);
  const reminderHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      hour12: false,
    }).format(reminder)
  );

  if (reminderHour < 7) {
    const previousEvening = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    previousEvening.setHours(20, 0, 0, 0);
    return previousEvening.getTime() > Date.now() ? previousEvening : new Date(Math.min(startTime.getTime() - 15 * 60000, Date.now() + 60 * 60000));
  }

  if (reminderHour >= 22) {
    const sameEvening = new Date(startTime);
    sameEvening.setHours(20, 0, 0, 0);
    return sameEvening.getTime() > Date.now() ? sameEvening : new Date(Math.min(startTime.getTime() - 15 * 60000, Date.now() + 60 * 60000));
  }

  return reminder.getTime() > Date.now() ? reminder : new Date(Math.min(startTime.getTime() - 15 * 60000, Date.now() + 60 * 60000));
};

const serializeBooking = (booking, showtime, movie) => ({
  id: booking._id,
  ticketCode: booking.ticketCode || buildTicketCode(booking._id),
  movieId: formatMovieId(booking.movieLegacyId),
  movieTitle: movie?.title || "",
  showtimeId: booking.showtimeId,
  cinemaName: showtime?.cinemaName || "CineSky Nguyen Hue",
  roomName: showtime?.roomName || "",
  screeningDate: booking.screeningDate || "",
  screeningDateLabel: booking.screeningDateLabel || "",
  displayDate: booking.screeningDateLabel || showtime?.displayDate || "",
  displayTime: getBookingDisplayTime(booking, showtime),
  seatNumbers: booking.seatNumbers,
  fnbItems: booking.fnbItems || [],
  totalPrice: booking.totalPrice,
  subtotalPrice: booking.subtotalPrice || booking.totalPrice,
  serviceFee: booking.serviceFee || 0,
  discountAmount: booking.discountAmount || 0,
  promoCode: booking.promoCode || "",
  paymentMethod: booking.paymentMethod || "bank",
  paymentProvider: booking.paymentProvider || "",
  paymentStatus: booking.paymentStatus || "mock_paid",
  paymentReference: booking.paymentReference || "",
  isTestBooking: Boolean(booking.isTestBooking),
  status: getBookingEffectiveStatus(booking, showtime, movie),
  rawStatus: booking.status,
  checkedInAt: booking.checkedInAt,
  cancelledAt: booking.cancelledAt,
  cancelReason: booking.cancelReason || "",
  customerName: booking.customerName,
  customerEmail: booking.customerEmail,
  createdAt: booking.createdAt,
});

const bookingsController = {
  lockSeats: async (req, res) => {
    try {
      const { movieId, showtimeId, seatNumbers = [] } = req.body || {};
      const legacyId = Number(movieId);

      if (!req.authUser?._id) {
        return res.status(401).send({ success: false, message: "Authentication is required to lock seats", data: null });
      }

      if (Number.isNaN(legacyId) || !showtimeId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(400).send({ success: false, message: "movieId, showtimeId and seatNumbers are required", data: null });
      }

      if (new Set(seatNumbers).size !== seatNumbers.length) {
        return res.status(400).send({ success: false, message: "seatNumbers must not contain duplicated seats", data: null });
      }

      await cleanupExpiredSeatLocks();

      const showtime = await ShowtimeModel.findById(showtimeId);

      if (!showtime || showtime.movieLegacyId !== legacyId) {
        return res.status(404).send({ success: false, message: "Showtime not found", data: null });
      }

      const invalidSeat = seatNumbers.find((seat) => !showtime.seats.includes(seat));
      if (invalidSeat) {
        return res.status(400).send({ success: false, message: `Seat ${invalidSeat} is invalid`, data: null });
      }

      const bookedSeat = seatNumbers.find((seat) => showtime.bookedSeats.includes(seat));
      if (bookedSeat) {
        return res.status(409).send({ success: false, message: `Seat ${bookedSeat} has already been booked`, data: null });
      }

      const activeLocks = await SeatLockModel.find({
        showtimeId,
        expiresAt: { $gt: new Date() },
        userId: { $ne: req.authUser._id },
        seatNumbers: { $in: seatNumbers },
      });
      const lockedSeat = seatNumbers.find((seat) => activeLocks.some((lock) => lock.seatNumbers.includes(seat)));

      if (lockedSeat) {
        return res.status(409).send({ success: false, message: `Seat ${lockedSeat} is being held by another customer`, data: null });
      }

      const expiresAt = new Date(Date.now() + SEAT_LOCK_MINUTES * 60000);
      const lock = await SeatLockModel.findOneAndUpdate(
        { userId: req.authUser._id, showtimeId },
        { movieLegacyId: legacyId, seatNumbers, expiresAt },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.status(200).send({
        success: true,
        message: "Lock seats successfully",
        data: {
          id: lock._id,
          showtimeId: lock.showtimeId,
          seatNumbers: lock.seatNumbers,
          expiresAt: lock.expiresAt,
          holdSeconds: SEAT_LOCK_MINUTES * 60,
        },
      });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  validateVoucher: async (req, res) => {
    try {
      const { promoCode = "", subtotal = 0, fnbTotal = 0, ticketCount = 0, movieId = "", fnbItems = [], screeningDate = "" } = req.body || {};
      const legacyId = Number(movieId);
      const movie = Number.isNaN(legacyId) ? null : await MovieModel.findOne({ legacyId, deletedAt: null });
      const discount = await getVoucherDiscount({
        promoCode,
        subtotal,
        fnbTotal,
        ticketCount,
        user: req.authUser,
        movie,
        fnbItems: Array.isArray(fnbItems) ? fnbItems : [],
        screeningDate,
      });

      return res.status(200).send({
        success: true,
        message: "Validate voucher successfully",
        data: discount,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getBookingHistory: async (req, res) => {
    try {
      const { limit = "10", page = "1" } = req.query || {};
      const authUserId = String(req.authUser?._id || "").trim();
      const authUserEmail = String(req.authUser?.email || "").trim().toLowerCase();
      const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
      const safePage = Math.max(Number(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;

      if (!authUserId && !authUserEmail) {
        return res.status(200).send({
          success: true,
          message: "Get booking history successfully",
          data: [],
        });
      }

      const filters = [];

      if (mongoose.Types.ObjectId.isValid(authUserId)) {
        filters.push({ userId: authUserId });
      }

      if (authUserEmail) {
        filters.push({ customerEmail: authUserEmail });
      }

      const bookingFilter = filters.length === 1 ? filters[0] : { $or: filters };

      const [totalItems, bookings] = await Promise.all([
        BookingModel.countDocuments(bookingFilter),
        BookingModel.find(bookingFilter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      ]);
      const totalPages = Math.max(Math.ceil(totalItems / safeLimit), 1);

      const movieLegacyIds = [...new Set(bookings.map((booking) => booking.movieLegacyId))];
      const showtimeIds = [...new Set(bookings.map((booking) => String(booking.showtimeId)))];

      const [movies, showtimes] = await Promise.all([
        MovieModel.find({ legacyId: { $in: movieLegacyIds } }),
        ShowtimeModel.find({ _id: { $in: showtimeIds } }),
      ]);

      const movieMap = new Map(
        movies.map((movie) => [Number(movie.legacyId), movie])
      );
      const showtimeMap = new Map(
        showtimes.map((showtime) => [String(showtime._id), showtime])
      );

      const normalizedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const showtime = showtimeMap.get(String(booking.showtimeId));
          const movie = movieMap.get(Number(booking.movieLegacyId));

          return expireBookingIfNeeded(booking, showtime, movie);
        })
      );

      return res.status(200).send({
        success: true,
        message: "Get booking history successfully",
        data: {
          bookings: normalizedBookings.map((booking) =>
            serializeBooking(
              booking,
              showtimeMap.get(String(booking.showtimeId)),
              movieMap.get(Number(booking.movieLegacyId))
            )
          ),
          membership: serializeMembership(req.authUser?.membership),
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalItems,
            totalPages,
          },
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  createBooking: async (req, res) => {
    try {
      const {
        movieId,
        showtimeId,
        screeningDate = "",
        screeningDateLabel = "",
        seatNumbers = [],
        fnbItems = [],
        paymentMethod = "bank",
        paymentProvider = "",
        paymentReference = "",
        promoCode = "",
      } = req.body || {};
      const authUser = req.authUser;
      const isAdminBooking = authUser?.role === "admin";
      const customerName = String(authUser?.fullName || "").trim();
      const customerEmail = String(authUser?.email || "").trim().toLowerCase();

      const legacyId = Number(movieId);

      if (!authUser?._id || !customerEmail) {
        return res.status(401).send({
          success: false,
          message: "Authentication is required to create a booking",
          data: null,
        });
      }

      if (
        Number.isNaN(legacyId) ||
        !showtimeId ||
        !Array.isArray(seatNumbers) ||
        seatNumbers.length === 0
      ) {
        return res.status(400).send({
          success: false,
          message: "movieId, showtimeId and seatNumbers are required",
          data: null,
        });
      }

      if (new Set(seatNumbers).size !== seatNumbers.length) {
        return res.status(400).send({
          success: false,
          message: "seatNumbers must not contain duplicated seats",
          data: null,
        });
      }

      const [movie, showtime] = await Promise.all([
        MovieModel.findOne({ legacyId, deletedAt: null }),
        ShowtimeModel.findById(showtimeId),
      ]);

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      if (!showtime || showtime.movieLegacyId !== legacyId) {
        return res.status(404).send({
          success: false,
          message: "Showtime not found",
          data: null,
        });
      }

      const requestedDisplayTime = getShowtimeAdjustedDisplayTime(showtime) || showtime.displayTime;

      const requestedScreeningStart = buildScreeningDateTime(
        String(screeningDate).trim() || showtime.displayDate,
        requestedDisplayTime
      );

      if (requestedScreeningStart && requestedScreeningStart.getTime() <= Date.now()) {
        return res.status(409).send({
          success: false,
          message: "This showtime has already started. Please choose another showtime.",
          data: null,
        });
      }

      const invalidSeat = seatNumbers.find(
        (seat) => !showtime.seats.includes(seat)
      );
      if (invalidSeat) {
        return res.status(400).send({
          success: false,
          message: `Seat ${invalidSeat} is invalid`,
          data: null,
        });
      }

      const effectiveTicketPrice = getEffectiveTicketPrice(showtime.price, String(screeningDate).trim() || showtime.displayDate);
      const ticketSubtotal = effectiveTicketPrice * seatNumbers.length;
      const safeFnbItems = Array.isArray(fnbItems) ? fnbItems : [];
      const fnbTotal = safeFnbItems.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
      const serviceFee = getServiceFeePerTicket() * seatNumbers.length;
      const voucher = normalizePromoCode(promoCode)
        ? await getVoucherDiscount({
            promoCode,
            subtotal: ticketSubtotal,
            fnbTotal,
            ticketCount: seatNumbers.length,
            user: authUser,
            movie,
            fnbItems: safeFnbItems,
            screeningDate,
          })
        : { code: "", discountAmount: 0 };
      const totalPrice = Math.max(ticketSubtotal + fnbTotal + serviceFee - voucher.discountAmount, 0);
      await verifyQrPaymentReference(paymentReference, totalPrice);

      const reservedShowtime = isAdminBooking
        ? showtime
        : await ShowtimeModel.findOneAndUpdate(
            {
              _id: showtime._id,
              movieLegacyId: legacyId,
              seats: { $all: seatNumbers },
              bookedSeats: { $nin: seatNumbers },
            },
            {
              $addToSet: { bookedSeats: { $each: seatNumbers } },
            },
            { new: true }
          );

      if (!reservedShowtime) {
        return res.status(409).send({
          success: false,
          message: "One or more selected seats have already been booked",
          data: null,
        });
      }

      let booking;
      const bookingId = new mongoose.Types.ObjectId();
      const ticketCode = await createUniqueTicketCode();

      if (!isAdminBooking) {
        const seatLock = await SeatLockModel.findOne({
          userId: authUser._id,
          showtimeId: reservedShowtime._id,
          expiresAt: { $gt: new Date() },
        });

        const hasSeatLock = seatLock && seatNumbers.every((seat) => seatLock.seatNumbers.includes(seat));

        if (!hasSeatLock) {
          await ShowtimeModel.updateOne(
            { _id: reservedShowtime._id },
            { $pull: { bookedSeats: { $in: seatNumbers } } }
          );

          return res.status(409).send({
            success: false,
            message: "Seat hold expired. Please select your seats again.",
            data: null,
          });
        }
      }

      try {
        booking = await BookingModel.create({
          _id: bookingId,
          userId: authUser._id,
          ticketCode,
          customerName,
          customerEmail,
          movieLegacyId: legacyId,
          showtimeId: reservedShowtime._id,
          screeningDate: String(screeningDate).trim(),
          screeningDateLabel: String(screeningDateLabel).trim(),
          displayTime: requestedDisplayTime,
          seatNumbers,
          fnbItems: safeFnbItems,
          subtotalPrice: ticketSubtotal + fnbTotal,
          serviceFee,
          discountAmount: voucher.discountAmount,
          promoCode: voucher.code,
          totalPrice,
          paymentMethod,
          paymentProvider: String(paymentProvider).trim(),
          paymentReference: String(paymentReference).trim(),
          paymentStatus: "mock_paid",
          isTestBooking: isAdminBooking,
        });
      } catch (error) {
        if (!isAdminBooking) {
          await ShowtimeModel.updateOne(
            { _id: reservedShowtime._id },
            { $pull: { bookedSeats: { $in: seatNumbers } } }
          );
        }
        throw error;
      }

      if (voucher.promotionId) {
        let usageReserved = false;

        try {
          const usageUpdate = await PromotionModel.updateOne(
            {
              _id: voucher.promotionId,
              $or: [
                { totalUsageLimit: 0 },
                { totalUsageLimit: null },
                { totalUsageLimit: { $exists: false } },
                { $expr: { $lt: [{ $ifNull: ["$usedCount", 0] }, "$totalUsageLimit"] } },
              ],
            },
            { $inc: { usedCount: 1 } }
          );

          if (!usageUpdate.matchedCount) {
            const limitError = new Error("Mã khuyến mãi vừa hết lượt sử dụng. Vui lòng kiểm tra lại.");
            limitError.statusCode = 409;
            throw limitError;
          }
          usageReserved = true;

          await ensurePromotionRedemptionIndexes();
          await PromotionRedemptionModel.create({
            promotionId: voucher.promotionId,
            userId: authUser._id,
            bookingId: booking._id,
            code: voucher.code,
            discountAmount: voucher.discountAmount,
          });
        } catch (error) {
          if (usageReserved) {
            await PromotionModel.updateOne(
              { _id: voucher.promotionId },
              [{ $set: { usedCount: { $max: [{ $subtract: [{ $ifNull: ["$usedCount", 0] }, 1] }, 0] } } }]
            );
          }
          await BookingModel.deleteOne({ _id: booking._id });
          if (!isAdminBooking) {
            await ShowtimeModel.updateOne(
              { _id: reservedShowtime._id },
              { $pull: { bookedSeats: { $in: seatNumbers } } }
            );
          }

          const redemptionError = new Error(
            error?.statusCode
              ? error.message
              : "Mã khuyến mãi vừa được sử dụng hoặc không còn khả dụng. Vui lòng kiểm tra lại."
          );
          redemptionError.statusCode = error?.statusCode || (error?.code === 11000 ? 409 : 500);
          throw redemptionError;
        }
      }

      const membership = await updateUserMembership(authUser, seatNumbers.length);
      await SeatLockModel.deleteOne({ userId: authUser._id, showtimeId: reservedShowtime._id });
      await createBookingNotifications({ authUser, booking, movie, showtime: reservedShowtime });
      const emailDelivery = await sendBookingConfirmationEmail({
        to: customerEmail,
        booking,
        movie,
        showtime: reservedShowtime,
        discount: voucher,
      });

      return res.status(201).send({
        success: true,
        message: "Create booking successfully",
        data: {
          ...serializeBooking(booking, reservedShowtime, movie),
          membership,
          emailDelivery,
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params || {};
      const { reason = "" } = req.body || {};
      const authUserId = String(req.authUser?._id || "");
      const authUserEmail = String(req.authUser?.email || "").trim().toLowerCase();

      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).send({
          success: false,
          message: "Invalid booking id",
          data: null,
        });
      }

      const booking = await BookingModel.findById(bookingId);

      if (!booking) {
        return res.status(404).send({
          success: false,
          message: "Booking not found",
          data: null,
        });
      }

      const bookingEmail = String(booking.customerEmail || "").trim().toLowerCase();
      const isOwnerById = booking.userId && String(booking.userId) === authUserId;
      const isOwnerByEmail = authUserEmail && bookingEmail === authUserEmail;

      if (!isOwnerById && !isOwnerByEmail) {
        return res.status(403).send({
          success: false,
          message: "You can only cancel your own booking",
          data: null,
        });
      }

      const [movie, showtime] = await Promise.all([
        MovieModel.findOne({ legacyId: booking.movieLegacyId }),
        ShowtimeModel.findById(booking.showtimeId),
      ]);

      if (booking.status === "cancelled") {
        return res.status(200).send({
          success: true,
          message: "Booking is already cancelled",
          data: serializeBooking(booking, showtime, movie),
        });
      }

      await expireBookingIfNeeded(booking, showtime, movie);

      if (booking.status === "used") {
        return res.status(409).send({
          success: false,
          message: "Checked-in tickets cannot be cancelled",
          data: serializeBooking(booking, showtime, movie),
        });
      }

      if (getBookingEffectiveStatus(booking, showtime, movie) === "expired") {
        return res.status(409).send({
          success: false,
          message: "Expired tickets cannot be cancelled",
          data: serializeBooking(booking, showtime, movie),
        });
      }

      if (!booking.isTestBooking) {
        await ShowtimeModel.updateOne(
          { _id: booking.showtimeId },
          { $pull: { bookedSeats: { $in: booking.seatNumbers } } }
        );
      }

      booking.status = "cancelled";
      booking.paymentStatus = booking.paymentStatus || "mock_paid";
      booking.cancelledAt = new Date();
      booking.cancelReason = String(reason).trim();
      await booking.save();

      const updatedShowtime = await ShowtimeModel.findById(booking.showtimeId);

      return res.status(200).send({
        success: true,
        message: "Cancel booking successfully. Paid amount is not refunded.",
          data: {
            ...serializeBooking(booking, updatedShowtime, movie),
            membership: serializeMembership(req.authUser?.membership),
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default bookingsController;
