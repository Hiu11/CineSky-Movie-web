import mongoose from "mongoose";
import crypto from "crypto";
import BookingModel from "../models/booking.model.js";
import MovieModel from "../models/movie.model.js";
import ShowtimeModel from "../models/showtime.model.js";

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");
const POINTS_PER_TICKET = 100;
const TICKET_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

const getBookingEffectiveStatus = (booking, showtime, movie) => {
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
  displayTime: showtime?.displayTime || "",
  seatNumbers: booking.seatNumbers,
  totalPrice: booking.totalPrice,
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
  getBookingHistory: async (req, res) => {
    try {
      const { limit = "6" } = req.query || {};
      const authUserId = String(req.authUser?._id || "").trim();
      const authUserEmail = String(req.authUser?.email || "").trim().toLowerCase();
      const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 20);

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

      const bookings = await BookingModel.find(bookingFilter)
        .sort({ createdAt: -1 })
        .limit(safeLimit);

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

  createBooking: async (req, res) => {
    try {
      const {
        movieId,
        showtimeId,
        screeningDate = "",
        screeningDateLabel = "",
        seatNumbers = [],
        paymentMethod = "bank",
        paymentProvider = "",
        paymentReference = "",
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

      const requestedScreeningStart = buildScreeningDateTime(
        String(screeningDate).trim() || showtime.displayDate,
        showtime.displayTime
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
          seatNumbers,
          totalPrice: reservedShowtime.price * seatNumbers.length,
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

      const membership = await updateUserMembership(authUser, seatNumbers.length);

      return res.status(201).send({
        success: true,
        message: "Create booking successfully",
        data: {
          ...serializeBooking(booking, reservedShowtime, movie),
          membership,
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
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default bookingsController;
