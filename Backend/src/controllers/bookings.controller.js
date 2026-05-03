import mongoose from "mongoose";
import BookingModel from "../models/booking.model.js";
import MovieModel from "../models/movie.model.js";
import ShowtimeModel from "../models/showtime.model.js";

const serializeBooking = (booking, showtime, movie) => ({
  id: booking._id,
  movieId: booking.movieLegacyId,
  movieTitle: movie?.title || "",
  showtimeId: booking.showtimeId,
  cinemaName: showtime?.cinemaName || "",
  roomName: showtime?.roomName || "",
  displayDate: showtime?.displayDate || "",
  displayTime: showtime?.displayTime || "",
  seatNumbers: booking.seatNumbers,
  totalPrice: booking.totalPrice,
  status: booking.status,
  customerName: booking.customerName,
  customerEmail: booking.customerEmail,
  createdAt: booking.createdAt,
});

const bookingsController = {
  getBookingHistory: async (req, res) => {
    try {
      const { userId = "", email = "", limit = "6" } = req.query || {};
      const trimmedUserId = String(userId).trim();
      const trimmedEmail = String(email).trim().toLowerCase();
      const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 20);

      if (!trimmedUserId && !trimmedEmail) {
        return res.status(200).send({
          success: true,
          message: "Get booking history successfully",
          data: [],
        });
      }

      const filters = [];

      if (trimmedUserId) {
        if (!mongoose.Types.ObjectId.isValid(trimmedUserId)) {
          if (!trimmedEmail) {
            return res.status(400).send({
              success: false,
              message: "userId is invalid",
              data: null,
            });
          }
        } else {
          filters.push({ userId: trimmedUserId });
        }
      }

      if (trimmedEmail) {
        filters.push({ customerEmail: trimmedEmail });
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

      return res.status(200).send({
        success: true,
        message: "Get booking history successfully",
        data: bookings.map((booking) =>
          serializeBooking(
            booking,
            showtimeMap.get(String(booking.showtimeId)),
            movieMap.get(Number(booking.movieLegacyId))
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

  createBooking: async (req, res) => {
    try {
      const {
        userId = null,
        customerName = "",
        customerEmail = "",
        movieId,
        showtimeId,
        seatNumbers = [],
      } = req.body || {};

      const legacyId = Number(movieId);

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

      const [movie, showtime] = await Promise.all([
        MovieModel.findOne({ legacyId }),
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

      const duplicatedSeat = seatNumbers.find((seat) =>
        showtime.bookedSeats.includes(seat)
      );
      if (duplicatedSeat) {
        return res.status(409).send({
          success: false,
          message: `Seat ${duplicatedSeat} has already been booked`,
          data: null,
        });
      }

      showtime.bookedSeats = [
        ...new Set([...showtime.bookedSeats, ...seatNumbers]),
      ];
      await showtime.save();

      const booking = await BookingModel.create({
        userId: userId || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        movieLegacyId: legacyId,
        showtimeId: showtime._id,
        seatNumbers,
        totalPrice: showtime.price * seatNumbers.length,
      });

      return res.status(201).send({
        success: true,
        message: "Create booking successfully",
        data: serializeBooking(booking, showtime, movie),
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
