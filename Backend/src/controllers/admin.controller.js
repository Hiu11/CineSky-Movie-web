import mongoose from "mongoose";
import AdminActivityModel from "../models/adminActivity.model.js";
import BookingModel from "../models/booking.model.js";
import FavoriteModel from "../models/favorite.model.js";
import FeedbackModel from "../models/feedback.model.js";
import MovieModel from "../models/movie.model.js";
import NotificationModel from "../models/notification.model.js";
import ReviewModel from "../models/review.model.js";
import ShowtimeModel from "../models/showtime.model.js";
import UserModel from "../models/user.model.js";
import { buildAdminAnalyticsPayload } from "../services/adminAnalytics.service.js";
import tmdbService from "../services/tmdb.service.js";
import {
  buildNonAdminBookingFilter,
  buildNonAdminFeedbackFilter,
  buildNonAdminUserContentFilter,
  mergeMongoFilters,
} from "../utils/adminFilters.js";

const getMembershipTier = (points = 0) => {
  if (points >= 3000) return "Diamond";
  if (points >= 1500) return "Gold";
  if (points >= 500) return "Silver";
  return "Member";
};

const serializeMembership = (membership = {}) => {
  const points = Number(membership.points || 0);
  const tier = membership.tier || getMembershipTier(points);

  return {
    tier,
    points,
    totalTickets: Number(membership.totalTickets || 0),
  };
};

const serializeAdminUser = (user, stats = {}) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || "",
  gender: user.gender || "",
  birthday: user.birthday || "",
  role: user.role,
  avatar: user.avatar || "",
  membership: serializeMembership(user.membership),
  createdAt: user.createdAt,
  stats: {
    bookings: stats.bookings || 0,
    reviews: stats.reviews || 0,
    favorites: stats.favorites || 0,
    feedbackEntries: stats.feedbackEntries || 0,
  },
});

const serializeBooking = (booking, movie, showtime) => ({
  id: booking._id,
  ticketCode: booking.ticketCode || buildTicketCode(booking._id),
  userId: booking.userId || null,
  movieId: formatMovieId(booking.movieLegacyId),
  movieTitle: movie?.title || "",
  showtimeId: booking.showtimeId,
  screeningDate: booking.screeningDate || "",
  screeningDateLabel: booking.screeningDateLabel || "",
  displayDate: booking.screeningDateLabel || showtime?.displayDate || "",
  displayTime: showtime?.displayTime || "",
  cinemaName: showtime?.cinemaName || "CineSky Nguyen Hue",
  roomName: showtime?.roomName || "",
  seatNumbers: booking.seatNumbers || [],
  totalPrice: booking.totalPrice || 0,
  paymentMethod: booking.paymentMethod || "bank",
  paymentProvider: booking.paymentProvider || "",
  paymentStatus: booking.paymentStatus || "mock_paid",
  paymentReference: booking.paymentReference || "",
  isTestBooking: Boolean(booking.isTestBooking),
  status: getBookingEffectiveStatus(booking, movie, showtime),
  checkedInAt: booking.checkedInAt,
  cancelledAt: booking.cancelledAt,
  cancelReason: booking.cancelReason || "",
  customerName: booking.customerName || "",
  customerEmail: booking.customerEmail || "",
  createdAt: booking.createdAt,
});

const serializeReview = (review, movie) => ({
  id: review._id,
  movieId: formatMovieId(review.movieLegacyId),
  movieTitle: movie?.title || "",
  rating: review.rating,
  content: review.content,
  createdAt: review.createdAt,
});

const serializeFavorite = (favorite, movie) => ({
  id: favorite._id,
  movieId: formatMovieId(favorite.movieLegacyId),
  movieTitle: movie?.title || "",
  movieSlug: movie?.slug || "",
  createdAt: favorite.createdAt,
});

const serializeFeedback = (feedback) => ({
  id: feedback._id,
  userId: feedback.userId || null,
  fullName: feedback.fullName || "",
  email: feedback.email || "",
  rating: Math.max(1, Math.min(5, Number(feedback.rating) || 1)),
  headline: feedback.headline || "",
  message: feedback.message,
  source: feedback.source || "",
  status: feedback.status || "new",
  category: feedback.category || "other",
  priority: feedback.priority || "medium",
  adminNotes: feedback.adminNotes || [],
  response: feedback.response || "",
  respondedAt: feedback.respondedAt || null,
  isSpam: Boolean(feedback.isSpam),
  isHidden: Boolean(feedback.isHidden),
  history: feedback.history || [],
  updatedAt: feedback.updatedAt,
  createdAt: feedback.createdAt,
});

const feedbackStatusLabels = {
  new: "Mới",
  in_progress: "Đang xử lý",
  responded: "Đã phản hồi",
  closed: "Đã đóng",
};

const feedbackCategories = new Set([
  "booking_issue",
  "payment",
  "interface",
  "movie_showtime",
  "cinema_service",
  "other",
]);

const feedbackPriorities = new Set(["low", "medium", "high", "urgent"]);
const feedbackStatuses = new Set(["new", "in_progress", "responded", "closed"]);

const notifyFeedbackResponse = async (feedback) => {
  if (!feedback?.response) {
    return null;
  }

  const targetUser = feedback.userId ? await UserModel.findById(feedback.userId) : null;

  if (!targetUser) {
    return null;
  }

  return NotificationModel.create({
    userId: targetUser._id,
    title: "CineSky đã phản hồi góp ý của bạn",
    message: feedback.response,
    type: "feedback_response",
    sourceId: feedback._id,
    sourceType: "feedback",
  });
};

const slugify = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeKeyValueList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        label: String(item?.label || "").trim(),
        value: String(item?.value || "").trim(),
      }))
      .filter((item) => item.label || item.value);
  }

  return String(value || "")
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: String(label || "").trim(),
        value: rest.join(":").trim(),
      };
    })
    .filter((item) => item.label || item.value);
};

const normalizeCast = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        name: String(item?.name || "").trim(),
        role: String(item?.role || "").trim(),
      }))
      .filter((item) => item.name || item.role);
  }

  return String(value || "")
    .split("\n")
    .map((line) => {
      const [name, ...rest] = line.split(":");
      return {
        name: String(name || "").trim(),
        role: rest.join(":").trim(),
      };
    })
    .filter((item) => item.name || item.role);
};

const normalizeYoutubeTrailer = (value = "") => {
  const trailer = String(value).trim();

  if (!trailer) {
    return "";
  }

  let videoId = "";

  try {
    const url = new URL(trailer);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host.endsWith("youtube.com")) {
      videoId =
        url.searchParams.get("v") ||
        url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/i)?.[1] ||
        "";
    }
  } catch {
    videoId = trailer.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([^?&/]+)/i)?.[1] || "";
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : trailer;
};

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");

const buildTicketCode = (bookingId) =>
  `CSK${String(bookingId || "")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-10)
    .toUpperCase()
    .padStart(10, "0")}`;

const buildScreeningDateTime = (screeningDate = "", displayTime = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(screeningDate)) || !/^\d{2}:\d{2}$/.test(String(displayTime))) {
    return null;
  }

  const date = new Date(`${screeningDate}T${displayTime}:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getBookingEffectiveStatus = (booking, movie, showtime) => {
  const durationMinutes = Number(movie?.duration || 0) || 120;
  const screeningStartFromBooking = booking.screeningDate
    ? buildScreeningDateTime(booking.screeningDate, showtime?.displayTime)
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
    buildScreeningDateTime(booking.screeningDate || showtime?.displayDate, showtime?.displayTime) ||
    (showtime?.startTime ? new Date(showtime.startTime) : null);

  if (!screeningStart || Number.isNaN(screeningStart.getTime())) {
    return booking.status;
  }

  const screeningEnd = new Date(screeningStart.getTime() + durationMinutes * 60000);

  return screeningEnd.getTime() < Date.now() ? "expired" : booking.status;
};

const expireBookingIfNeeded = async (booking, movie, showtime) => {
  if (!booking) {
    return booking;
  }

  const effectiveStatus = getBookingEffectiveStatus(booking, movie, showtime);

  if (booking.status === "expired" && effectiveStatus === "booked") {
    booking.status = "booked";
    await booking.save();
    return booking;
  }

  if (booking.status !== "booked" || effectiveStatus !== "expired") {
    return booking;
  }

  booking.status = "expired";
  await booking.save();
  return booking;
};

const findBookingByTicketLookup = (lookupValue) => {
  const ticketCode = String(lookupValue || "").trim().toUpperCase();
  const filters = [{ ticketCode }];

  if (mongoose.Types.ObjectId.isValid(ticketCode)) {
    filters.push({ _id: ticketCode });
  }

  return BookingModel.findOne({ $or: filters });
};

const serializeAdminActivity = (activity) => ({
  id: activity._id,
  name: activity.name,
  status: activity.action,
  time: activity.createdAt,
  value: activity.value || "",
  entityType: activity.entityType || "",
  entityId: activity.entityId || "",
  adminName: activity.adminName || "",
});

const createAdminActivity = async (req, activity) => {
  const adminUser = req.authUser;

  try {
    return await AdminActivityModel.create({
      action: activity.action,
      name: activity.name,
      value: activity.value || "",
      entityType: activity.entityType || "",
      entityId: activity.entityId ? String(activity.entityId) : "",
      adminId: adminUser?._id || null,
      adminName: adminUser?.fullName || adminUser?.email || "",
    });
  } catch {
    return null;
  }
};

const serializeAdminMovie = (movie) => ({
  id: formatMovieId(movie.legacyId),
  slug: movie.slug,
  title: movie.title,
  poster: movie.poster,
  genres: movie.genres || [],
  country: movie.country || "",
  director: movie.director || "",
  duration: movie.duration || 0,
  rating: movie.rating || "P",
  status: movie.status,
  statusOrder: movie.statusOrder ?? 0,
  catalogOrder: movie.catalogOrder ?? 999,
  heroOrder: movie.heroOrder ?? null,
  showtimes: movie.showtimes || [],
  releaseDate: movie.releaseDate || "",
  trailer: movie.trailer || "",
  description: movie.description || "",
  cast: movie.cast || [],
  gallery: movie.gallery || [],
  trailerFacts: movie.trailerFacts || [],
  trailerPanel: movie.trailerPanel || null,
  deletedAt: movie.deletedAt || null,
});

const buildMoviePayload = (body = {}) => {
  const title = String(body.title || body.name || "").trim();
  const slug = slugify(body.slug || title);
  const heroOrder =
    body.heroOrder === "" || body.heroOrder === null || body.heroOrder === undefined
      ? null
      : Number(body.heroOrder);

  return {
    legacyId: Number(body.legacyId || body.id) || undefined,
    slug,
    title,
    poster: String(body.poster || "").trim(),
    genres: normalizeStringList(body.genres),
    country: String(body.country || "").trim(),
    director: String(body.director || "").trim(),
    duration: Math.max(Number(body.duration) || 0, 0),
    rating: String(body.rating || "P").trim().toUpperCase(),
    status: ["now-showing", "coming-soon"].includes(body.status) ? body.status : "now-showing",
    statusOrder: Number(body.statusOrder) || 0,
    catalogOrder: Number(body.catalogOrder) || 999,
    heroOrder: Number.isFinite(heroOrder) ? heroOrder : null,
    showtimes: normalizeStringList(body.showtimes),
    releaseDate: String(body.releaseDate || body.release || "").trim(),
    trailer: normalizeYoutubeTrailer(body.trailer),
    description: String(body.description || "").trim(),
    cast: normalizeCast(body.cast),
    gallery: normalizeStringList(body.gallery),
    trailerFacts: normalizeKeyValueList(body.trailerFacts),
    trailerPanel: body.trailerPanel
      ? {
          label: String(body.trailerPanel.label || "").trim(),
          title: String(body.trailerPanel.title || "").trim(),
          description: String(body.trailerPanel.description || "").trim(),
        }
      : null,
  };
};

const validateMoviePayload = (payload) => {
  const requiredFields = [
    ["title", "title"],
    ["poster", "poster"],
    ["slug", "slug"],
    ["trailer", "trailer link"],
    ["description", "description"],
    ["country", "country"],
    ["director", "director"],
    ["releaseDate", "release date"],
  ];
  const missingField = requiredFields.find(([key]) => !payload[key]);

  if (missingField) {
    return `${missingField[1]} is required`;
  }

  if (!payload.genres.length) {
    return "At least one genre is required";
  }

  if (payload.duration <= 0) {
    return "Duration must be greater than 0";
  }

  return "";
};

const findDuplicateMovie = async (payload, currentLegacyId = null) => {
  const duplicateMovie = await MovieModel.findOne({
    $or: [
      { legacyId: payload.legacyId },
      { slug: payload.slug },
      { title: { $regex: `^${payload.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
    ].filter((condition) => Object.values(condition)[0] !== undefined),
  });

  if (!duplicateMovie || Number(duplicateMovie.legacyId) === Number(currentLegacyId)) {
    return "";
  }

  return "Movie already exists";
};

const buildSearchFilter = (search = "") => {
  const trimmedSearch = String(search).trim();

  if (!trimmedSearch) {
    return {};
  }

  return {
    $or: [
      { fullName: { $regex: trimmedSearch, $options: "i" } },
      { email: { $regex: trimmedSearch, $options: "i" } },
      { phone: { $regex: trimmedSearch, $options: "i" } },
    ],
  };
};

const adminController = {
  searchTmdbMovie: async (req, res) => {
    try {
      const metadata = await tmdbService.searchMovieMetadata(req.query.query);

      return res.status(200).send({
        success: true,
        message: "Get TMDB metadata successfully",
        data: metadata,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Cannot get TMDB metadata",
        data: null,
      });
    }
  },

  uploadPoster: async (req, res) => {
    try {
      const { fileData = "" } = req.body || {};
      const matchedDataUrl = String(fileData).match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);

      if (!matchedDataUrl) {
        return res.status(400).send({
          success: false,
          message: "Poster image data is invalid",
          data: null,
        });
      }

      const [, mimeType, base64Data] = matchedDataUrl;
      const imageBuffer = Buffer.from(base64Data, "base64");

      if (!imageBuffer.length || imageBuffer.length > 2 * 1024 * 1024) {
        return res.status(400).send({
          success: false,
          message: "Poster image must be smaller than 2MB",
          data: null,
        });
      }

      return res.status(201).send({
        success: true,
        message: "Upload poster successfully",
        data: {
          poster: `data:${mimeType};base64,${base64Data}`,
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

  getDashboardOverview: async (req, res) => {
    try {
      const adminUsers = await UserModel.find({ role: "admin" }).select("_id email");
      const nonAdminBookingFilter = buildNonAdminBookingFilter(adminUsers);
      const nonAdminUserContentFilter = buildNonAdminUserContentFilter(adminUsers);
      const nonAdminFeedbackFilter = buildNonAdminFeedbackFilter(adminUsers);
      const [
        users,
        bookings,
        reviews,
        favorites,
        feedbackEntries,
        activeMovies,
        comingSoonMovies,
        showtimes,
        bookedRevenue,
        cancelledBookings,
        premiumMembers,
        newFeedbackEntries,
        unresolvedFeedbackEntries,
        feedbackRatingStats,
      ] = await Promise.all([
        UserModel.countDocuments({ role: { $ne: "admin" } }),
        BookingModel.countDocuments(nonAdminBookingFilter),
        ReviewModel.countDocuments(nonAdminUserContentFilter),
        FavoriteModel.countDocuments(nonAdminUserContentFilter),
        FeedbackModel.countDocuments(mergeMongoFilters(nonAdminFeedbackFilter, { isHidden: { $ne: true } })),
        MovieModel.countDocuments({ deletedAt: null, status: "now-showing" }),
        MovieModel.countDocuments({ deletedAt: null, status: "coming-soon" }),
        ShowtimeModel.countDocuments(),
        BookingModel.aggregate([
          {
            $match: mergeMongoFilters(nonAdminBookingFilter, {
              paymentStatus: { $ne: "refunded" },
            }),
          },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        BookingModel.countDocuments(mergeMongoFilters(nonAdminBookingFilter, { status: "cancelled" })),
        UserModel.countDocuments({
          role: { $ne: "admin" },
          $or: [
            { "membership.tier": { $in: ["Gold", "Diamond"] } },
            { "membership.points": { $gte: 1500 } },
          ],
        }),
        FeedbackModel.countDocuments(mergeMongoFilters(nonAdminFeedbackFilter, { isHidden: { $ne: true }, status: "new" })),
        FeedbackModel.countDocuments(
          mergeMongoFilters(nonAdminFeedbackFilter, { isHidden: { $ne: true }, status: { $in: ["new", "in_progress"] } })
        ),
        FeedbackModel.aggregate([
          { $match: mergeMongoFilters(nonAdminFeedbackFilter, { isHidden: { $ne: true } }) },
          { $group: { _id: null, averageRating: { $avg: "$rating" } } },
        ]),
      ]);

      return res.status(200).send({
        success: true,
        message: "Get admin overview successfully",
        data: {
          users,
          bookings,
          reviews,
          favorites,
          feedbackEntries,
          activeMovies,
          comingSoonMovies,
          showtimes,
          cancelledBookings,
          premiumMembers,
          newFeedbackEntries,
          unresolvedFeedbackEntries,
          averageFeedbackRating: Number((feedbackRatingStats?.[0]?.averageRating || 0).toFixed(1)),
          revenue: bookedRevenue?.[0]?.total || 0,
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

  getDashboardAnalytics: async (req, res) => {
    try {
      const range = ["day", "week", "month", "year"].includes(req.query.range) ? req.query.range : "month";
      const filters = {
        date: req.query.date,
        month: req.query.month,
        year: req.query.year,
      };
      const adminUsers = await UserModel.find({ role: "admin" }).select("_id email");
      const nonAdminBookingFilter = buildNonAdminBookingFilter(adminUsers);
      const nonAdminFeedbackFilter = buildNonAdminFeedbackFilter(adminUsers);
      const [bookings, movies, users, feedbackEntries] = await Promise.all([
        BookingModel.find(nonAdminBookingFilter).sort({ createdAt: -1 }).limit(5000),
        MovieModel.find({ deletedAt: null }).sort({ catalogOrder: 1, legacyId: 1 }).limit(500),
        UserModel.find({ role: { $ne: "admin" } }).limit(1000),
        FeedbackModel.find(mergeMongoFilters(nonAdminFeedbackFilter, { isHidden: { $ne: true } }))
          .sort({ createdAt: -1 })
          .limit(1000),
      ]);

      const movieLegacyIds = [...new Set(bookings.map((booking) => booking.movieLegacyId))];
      const showtimeIds = [...new Set(bookings.map((booking) => String(booking.showtimeId)).filter(Boolean))];
      const [bookingMovies, showtimes] = await Promise.all([
        MovieModel.find({ legacyId: { $in: movieLegacyIds } }),
        ShowtimeModel.find({ _id: { $in: showtimeIds } }),
      ]);
      const movieMap = new Map(bookingMovies.map((movie) => [movie.legacyId, movie]));
      const showtimeMap = new Map(showtimes.map((showtime) => [String(showtime._id), showtime]));
      const serializedBookings = bookings.map((booking) =>
        serializeBooking(booking, movieMap.get(booking.movieLegacyId), showtimeMap.get(String(booking.showtimeId)))
      );

      return res.status(200).send({
        success: true,
        message: "Get admin analytics successfully",
        data: buildAdminAnalyticsPayload({
          bookings: serializedBookings,
          movies,
          users,
          feedback: feedbackEntries,
          range,
          filters,
        }),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 500);
      const skip = (page - 1) * limit;
      const filter = buildSearchFilter(req.query.search);

      const [users, totalItems] = await Promise.all([
        UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        UserModel.countDocuments(filter),
      ]);

      const userIds = users.map((user) => user._id);

      const [bookingCounts, reviewCounts, favoriteCounts, feedbackCounts] = await Promise.all([
        BookingModel.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        ReviewModel.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        FavoriteModel.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        FeedbackModel.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
      ]);

      const bookingMap = new Map(bookingCounts.map((item) => [String(item._id), item.count]));
      const reviewMap = new Map(reviewCounts.map((item) => [String(item._id), item.count]));
      const favoriteMap = new Map(favoriteCounts.map((item) => [String(item._id), item.count]));
      const feedbackMap = new Map(feedbackCounts.map((item) => [String(item._id), item.count]));

      return res.status(200).send({
        success: true,
        message: "Get users successfully",
        data: users.map((user) =>
          serializeAdminUser(user, {
            bookings: bookingMap.get(String(user._id)),
            reviews: reviewMap.get(String(user._id)),
            favorites: favoriteMap.get(String(user._id)),
            feedbackEntries: feedbackMap.get(String(user._id)),
          })
        ),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.max(Math.ceil(totalItems / limit), 1),
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

  getBookings: async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
      const adminUsers = await UserModel.find({ role: "admin" }).select("_id email");
      const bookings = await BookingModel.find(buildNonAdminBookingFilter(adminUsers))
        .sort({ createdAt: -1 })
        .limit(limit);

      const movieLegacyIds = [...new Set(bookings.map((booking) => booking.movieLegacyId))];
      const showtimeIds = [...new Set(bookings.map((booking) => String(booking.showtimeId)))];

      const [movies, showtimes] = await Promise.all([
        MovieModel.find({ legacyId: { $in: movieLegacyIds } }),
        ShowtimeModel.find({ _id: { $in: showtimeIds } }),
      ]);

      const movieMap = new Map(movies.map((movie) => [movie.legacyId, movie]));
      const showtimeMap = new Map(showtimes.map((showtime) => [String(showtime._id), showtime]));

      return res.status(200).send({
        success: true,
        message: "Get bookings successfully",
        data: bookings.map((booking) =>
          serializeBooking(
            booking,
            movieMap.get(booking.movieLegacyId),
            showtimeMap.get(String(booking.showtimeId))
          )
        ),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getDeletedMovies: async (req, res) => {
    try {
      const movies = await MovieModel.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 });

      return res.status(200).send({
        success: true,
        message: "Get deleted movies successfully",
        data: movies.map(serializeAdminMovie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getActivity: async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
      const activities = await AdminActivityModel.find().sort({ createdAt: -1 }).limit(limit);

      return res.status(200).send({
        success: true,
        message: "Get admin activity successfully",
        data: activities.map(serializeAdminActivity),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  createMovie: async (req, res) => {
    try {
      const payload = buildMoviePayload(req.body);
      const validationMessage = validateMoviePayload(payload);

      if (validationMessage) {
        return res.status(400).send({
          success: false,
          message: validationMessage,
          data: null,
        });
      }

      if (!payload.legacyId) {
        const latestMovie = await MovieModel.findOne().sort({ legacyId: -1 });
        payload.legacyId = (latestMovie?.legacyId || 0) + 1;
      }

      const duplicateMessage = await findDuplicateMovie(payload);

      if (duplicateMessage) {
        return res.status(409).send({
          success: false,
          message: duplicateMessage,
          data: null,
        });
      }

      const movie = await MovieModel.create(payload);
      await createAdminActivity(req, {
        action: "CREATE",
        name: movie.title,
        value: `ID ${formatMovieId(movie.legacyId)}`,
        entityType: "movie",
        entityId: formatMovieId(movie.legacyId),
      });

      return res.status(201).send({
        success: true,
        message: "Create movie successfully",
        data: serializeAdminMovie(movie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  updateMovie: async (req, res) => {
    try {
      const legacyId = Number(req.params.movieId);

      if (Number.isNaN(legacyId)) {
        return res.status(400).send({
          success: false,
          message: "Movie id is invalid",
          data: null,
        });
      }

      const payload = buildMoviePayload({ ...req.body, legacyId });
      const validationMessage = validateMoviePayload(payload);

      if (validationMessage) {
        return res.status(400).send({
          success: false,
          message: validationMessage,
          data: null,
        });
      }

      const duplicateMessage = await findDuplicateMovie(payload, legacyId);

      if (duplicateMessage) {
        return res.status(409).send({
          success: false,
          message: duplicateMessage,
          data: null,
        });
      }

      const movie = await MovieModel.findOneAndUpdate({ legacyId, deletedAt: null }, payload, {
        new: true,
        runValidators: true,
      });

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      await createAdminActivity(req, {
        action: "UPDATE",
        name: movie.title,
        value: `ID ${formatMovieId(movie.legacyId)}`,
        entityType: "movie",
        entityId: formatMovieId(movie.legacyId),
      });

      return res.status(200).send({
        success: true,
        message: "Update movie successfully",
        data: serializeAdminMovie(movie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  deleteMovie: async (req, res) => {
    try {
      const legacyId = Number(req.params.movieId);

      if (Number.isNaN(legacyId)) {
        return res.status(400).send({
          success: false,
          message: "Movie id is invalid",
          data: null,
        });
      }

      const movie = await MovieModel.findOneAndUpdate(
        { legacyId, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      await createAdminActivity(req, {
        action: "DELETE",
        name: movie.title,
        value: `ID ${formatMovieId(movie.legacyId)}`,
        entityType: "movie",
        entityId: formatMovieId(movie.legacyId),
      });

      return res.status(200).send({
        success: true,
        message: "Delete movie successfully",
        data: serializeAdminMovie(movie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  restoreMovie: async (req, res) => {
    try {
      const legacyId = Number(req.params.movieId);

      if (Number.isNaN(legacyId)) {
        return res.status(400).send({
          success: false,
          message: "Movie id is invalid",
          data: null,
        });
      }

      const movie = await MovieModel.findOneAndUpdate(
        { legacyId, deletedAt: { $ne: null } },
        { deletedAt: null },
        { new: true, runValidators: true }
      );

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Deleted movie not found",
          data: null,
        });
      }

      await createAdminActivity(req, {
        action: "RESTORE",
        name: movie.title,
        value: `ID ${formatMovieId(movie.legacyId)}`,
        entityType: "movie",
        entityId: formatMovieId(movie.legacyId),
      });

      return res.status(200).send({
        success: true,
        message: "Restore movie successfully",
        data: serializeAdminMovie(movie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getUserActivity: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({
          success: false,
          message: "userId is invalid",
          data: null,
        });
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      const [bookings, reviews, favorites, feedbackEntries] = await Promise.all([
        BookingModel.find({ userId }).sort({ createdAt: -1 }).limit(10),
        ReviewModel.find({ userId }).sort({ createdAt: -1 }).limit(10),
        FavoriteModel.find({ userId }).sort({ createdAt: -1 }).limit(10),
        FeedbackModel.find({ userId }).sort({ createdAt: -1 }).limit(10),
      ]);

      const movieLegacyIds = [
        ...new Set([
          ...bookings.map((booking) => booking.movieLegacyId),
          ...reviews.map((review) => review.movieLegacyId),
          ...favorites.map((favorite) => favorite.movieLegacyId),
        ]),
      ];
      const showtimeIds = [...new Set(bookings.map((booking) => String(booking.showtimeId)))];

      const [movies, showtimes] = await Promise.all([
        MovieModel.find({ legacyId: { $in: movieLegacyIds } }),
        ShowtimeModel.find({ _id: { $in: showtimeIds } }),
      ]);

      const movieMap = new Map(movies.map((movie) => [movie.legacyId, movie]));
      const showtimeMap = new Map(
        showtimes.map((showtime) => [String(showtime._id), showtime])
      );

      return res.status(200).send({
        success: true,
        message: "Get user activity successfully",
        data: {
          user: serializeAdminUser(user),
          bookings: bookings.map((booking) =>
            serializeBooking(
              booking,
              movieMap.get(booking.movieLegacyId),
              showtimeMap.get(String(booking.showtimeId))
            )
          ),
          reviews: reviews.map((review) =>
            serializeReview(review, movieMap.get(review.movieLegacyId))
          ),
          favorites: favorites.map((favorite) =>
            serializeFavorite(favorite, movieMap.get(favorite.movieLegacyId))
          ),
          feedbackEntries: feedbackEntries.map(serializeFeedback),
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

  updateUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const nextRole = String(req.body?.role || "").trim().toLowerCase();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({
          success: false,
          message: "userId is invalid",
          data: null,
        });
      }

      if (!["user", "admin"].includes(nextRole)) {
        return res.status(400).send({
          success: false,
          message: "Role must be user or admin",
          data: null,
        });
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
          data: null,
        });
      }

      user.role = nextRole;
      await user.save();
      await createAdminActivity(req, {
        action: "ROLE",
        name: user.fullName || user.email,
        value: `Role: ${user.role}`,
        entityType: "user",
        entityId: user._id,
      });

      return res.status(200).send({
        success: true,
        message: "Update user role successfully",
        data: serializeAdminUser(user),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getFeedbackEntries: async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
      const filter = { isHidden: { $ne: true } };
      const search = String(req.query.search || "").trim();

      if (feedbackStatuses.has(req.query.status)) {
        filter.status = req.query.status;
      }

      if (feedbackCategories.has(req.query.category)) {
        filter.category = req.query.category;
      }

      if (feedbackPriorities.has(req.query.priority)) {
        filter.priority = req.query.priority;
      }

      if (req.query.rating) {
        filter.rating = Number(req.query.rating);
      }

      if (req.query.from || req.query.to) {
        filter.createdAt = {};
        if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
        if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
      }

      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { headline: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ];
      }

      const adminUsers = await UserModel.find({ role: "admin" }).select("_id email");
      const includeInternal = String(req.query.includeInternal || "").toLowerCase() === "true";
      const entries = await FeedbackModel.find(
        includeInternal ? filter : mergeMongoFilters(filter, buildNonAdminFeedbackFilter(adminUsers))
      )
        .sort({ createdAt: -1 })
        .limit(limit);

      return res.status(200).send({
        success: true,
        message: "Get admin feedback successfully",
        data: entries.map(serializeFeedback),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  updateFeedbackEntry: async (req, res) => {
    try {
      const feedback = await FeedbackModel.findById(req.params.feedbackId);

      if (!feedback || feedback.isHidden) {
        return res.status(404).send({ success: false, message: "Feedback not found", data: null });
      }

      const adminName = req.authUser?.fullName || req.authUser?.email || "";
      const history = [];
      const { status, category, priority, adminNote, response, isSpam } = req.body || {};
      const previousResponse = feedback.response || "";

      if (status && feedbackStatuses.has(status) && feedback.status !== status) {
        history.push({ action: "status", from: feedbackStatusLabels[feedback.status] || feedback.status, to: feedbackStatusLabels[status] || status });
        feedback.status = status;
      }

      if (category && feedbackCategories.has(category)) {
        feedback.category = category;
      }

      if (priority && feedbackPriorities.has(priority)) {
        feedback.priority = priority;
      }

      if (typeof response === "string") {
        const nextResponse = response.trim();

        feedback.response = nextResponse;
        if (feedback.response) {
          feedback.status = "responded";
          feedback.respondedAt = new Date();
          history.push({
            action: "response",
            from: previousResponse ? "Đã có phản hồi" : "",
            to: previousResponse ? "Đã cập nhật phản hồi" : "Đã lưu phản hồi",
          });
        }
      }

      if (typeof isSpam === "boolean") {
        feedback.isSpam = isSpam;
        if (isSpam) {
          feedback.status = "closed";
          history.push({ action: "spam", from: "", to: "Đánh dấu spam" });
        }
      }

      const trimmedNote = String(adminNote || "").trim();
      if (trimmedNote) {
        feedback.adminNotes.push({
          note: trimmedNote,
          adminId: req.authUser?._id || null,
          adminName,
        });
        history.push({ action: "note", from: "", to: "Thêm admin note" });
      }

      history.forEach((item) => {
        feedback.history.push({
          ...item,
          adminId: req.authUser?._id || null,
          adminName,
        });
      });

      await feedback.save();
      if (typeof response === "string" && feedback.response && feedback.response !== previousResponse) {
        await notifyFeedbackResponse(feedback);
      }
      await createAdminActivity(req, {
        action: "FEEDBACK",
        name: feedback.headline || feedback.fullName,
        value: `${feedbackStatusLabels[feedback.status] || feedback.status} - ${feedback.email}`,
        entityType: "feedback",
        entityId: feedback._id,
      });

      return res.status(200).send({
        success: true,
        message: "Update feedback successfully",
        data: serializeFeedback(feedback),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  deleteFeedbackEntry: async (req, res) => {
    return res.status(403).send({
      success: false,
      message: "Feedback deletion is disabled",
      data: null,
    });
  },

  lookupTicket: async (req, res) => {
    try {
      const ticketCode = String(req.query?.ticketCode || "").trim().toUpperCase();

      if (!ticketCode) {
        return res.status(400).send({
          success: false,
          message: "ticketCode is required",
          data: null,
        });
      }

      const booking = await findBookingByTicketLookup(ticketCode);

      if (!booking) {
        return res.status(404).send({
          success: false,
          message: "Ticket not found",
          data: null,
        });
      }

      const [movie, showtime] = await Promise.all([
        MovieModel.findOne({ legacyId: booking.movieLegacyId }),
        ShowtimeModel.findById(booking.showtimeId),
      ]);

      await expireBookingIfNeeded(booking, movie, showtime);

      return res.status(200).send({
        success: true,
        message: "Lookup ticket successfully",
        data: serializeBooking(booking, movie, showtime),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  checkInTicket: async (req, res) => {
    try {
      const ticketCode = String(req.params?.ticketCode || "").trim().toUpperCase();

      if (!ticketCode) {
        return res.status(400).send({
          success: false,
          message: "ticketCode is required",
          data: null,
        });
      }

      const booking = await findBookingByTicketLookup(ticketCode);

      if (!booking) {
        return res.status(404).send({
          success: false,
          message: "Ticket not found",
          data: null,
        });
      }

      const [movie, showtime] = await Promise.all([
        MovieModel.findOne({ legacyId: booking.movieLegacyId }),
        ShowtimeModel.findById(booking.showtimeId),
      ]);

      await expireBookingIfNeeded(booking, movie, showtime);

      if (booking.status === "cancelled") {
        return res.status(409).send({
          success: false,
          message: "Cancelled tickets cannot be checked in",
          data: serializeBooking(booking, movie, showtime),
        });
      }

      if (booking.status === "used") {
        return res.status(200).send({
          success: true,
          message: "Ticket was already checked in",
          data: serializeBooking(booking, movie, showtime),
        });
      }

      if (booking.status === "expired") {
        return res.status(409).send({
          success: false,
          message: "Expired tickets cannot be checked in",
          data: serializeBooking(booking, movie, showtime),
        });
      }

      booking.status = "used";
      booking.checkedInAt = new Date();
      await booking.save();
      await createAdminActivity(req, {
        action: "CHECK_IN",
        name: booking.ticketCode,
        value: `${movie?.title || "Ticket"} - ${booking.seatNumbers.join(", ")}`,
        entityType: "booking",
        entityId: booking._id,
      });

      return res.status(200).send({
        success: true,
        message: "Check-in ticket successfully",
        data: serializeBooking(booking, movie, showtime),
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

export default adminController;
