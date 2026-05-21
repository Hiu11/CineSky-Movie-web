import GenreModel from "../models/genre.model.js";
import { createShowtimesFromMovies } from "../data/seedShowtimes.js";
import MovieModel from "../models/movie.model.js";
import ReviewModel from "../models/review.model.js";
import ShowtimeModel from "../models/showtime.model.js";

const ratingClassMap = {
  C18: "t18",
  T18: "t18",
  T16: "t16",
  T13: "t13",
  K: "p-rating",
  P: "p-rating",
  NR: "p-rating",
};

const ratingDescriptionMap = {
  C18: "**C18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
  T18: "**T18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
  T16: "**T16:** Phim dành cho khán giả từ đủ 16 tuổi trở lên",
  T13: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
  K: "**K:** Phim dành cho khán giả dưới 13 tuổi khi xem cùng cha mẹ hoặc người giám hộ",
  P: "**P:** Phim phổ biến, mọi lứa tuổi",
  NR: "**NR:** Chưa phân loại",
};

const isValidDisplayTime = (timeLabel) => /^\d{2}:\d{2}$/.test(String(timeLabel));

const createTimeMap = (showtimes = []) => {
  const timeMap = new Map();

  showtimes.forEach((showtime) => {
    if (!isValidDisplayTime(showtime.displayTime)) {
      return;
    }

    const currentTimes = timeMap.get(showtime.movieLegacyId) || [];

    if (!currentTimes.includes(showtime.displayTime)) {
      currentTimes.push(showtime.displayTime);
    }

    timeMap.set(showtime.movieLegacyId, currentTimes);
  });

  return timeMap;
};

const getMovieTimes = (movie, timeMap = new Map()) => {
  const mappedTimes = timeMap.get(movie.legacyId) || [];

  if (mappedTimes.length > 0) {
    return mappedTimes;
  }

  return Array.isArray(movie.showtimes)
    ? movie.showtimes.filter(isValidDisplayTime)
    : [];
};

const getYoutubeVideoId = (trailer = "") => {
  const matchedId = String(trailer).match(
    /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^?&/]+)/
  );

  return matchedId?.[1] || "";
};

const getYoutubeThumbnailCandidates = (trailer = "") => {
  const videoId = getYoutubeVideoId(trailer);

  if (!videoId) {
    return [];
  }

  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
};

const buildFallbackCast = (movie) => [
  {
    name: movie.director || "CineSky Studio",
    role: "Director",
  },
  {
    name: movie.country ? `${movie.country} ensemble` : "Global ensemble",
    role: "Lead cast",
  },
  {
    name: movie.rating || "T13",
    role: "Audience focus",
  },
];

const buildTrailerFacts = (movie, timeMap = new Map()) => {
  const previewTimes = getMovieTimes(movie, timeMap).slice(0, 5);

  return [
    {
      label: "Trạng thái",
      value: movie.status === "coming-soon" ? "Sắp chiếu" : "Đang chiếu",
    },
    {
      label: "Độ tuổi",
      value: movie.rating || "Đang cập nhật",
    },
    {
      label: "Suất nổi bật",
      value: previewTimes.length > 0 ? `${previewTimes.length} suất` : "Đang cập nhật",
    },
    {
      label: "Xem nhanh",
      value:
        previewTimes.length > 0
          ? previewTimes.slice(0, 3).join(" • ")
          : "Chưa có lịch chiếu",
    },
  ];
};

const buildTrailerPanel = (movie, timeMap = new Map()) => {
  const previewTimes = getMovieTimes(movie, timeMap);

  return {
    label: "Thông tin nhanh",
    title: movie.title,
    description:
      previewTimes.length > 0
        ? "Xem trailer trước khi chọn suất. Khu vực này tóm tắt nhanh trạng thái phát hành, độ tuổi và lịch chiếu nổi bật để bạn quyết định thuận tiện hơn."
        : "Phim hiện chưa có lịch chiếu khả dụng. Bạn vẫn có thể xem trailer, đọc mô tả và theo dõi trạng thái phát hành ngay trên trang chi tiết.",
  };
};

const hasDetailItems = (items) => Array.isArray(items) && items.length > 0;

const hasTrailerPanelContent = (panel) =>
  Boolean(panel && (panel.label || panel.title || panel.description));

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");

const serializeMovie = (movie, timeMap = new Map(), reviewMap = new Map()) => {
  const movieTimes = getMovieTimes(movie, timeMap);
  const reviewStats = reviewMap.get(movie.legacyId) || { averageRating: 0, reviewCount: 0 };

  return {
  id: formatMovieId(movie.legacyId),
  slug: movie.slug,
  title: movie.title,
  poster: movie.poster,
  genres: movie.genres,
  genre: movie.genres.join(", "),
  country: movie.country,
  director: movie.director,
  duration: movie.duration,
  rating: movie.rating,
  ratingClass: ratingClassMap[movie.rating] || "p-rating",
  ratingDesc:
    ratingDescriptionMap[movie.rating] || "**NR:** Chưa phân loại",
  status: movie.status,
  statusOrder: movie.statusOrder ?? 0,
  catalogOrder: movie.catalogOrder ?? 999,
  heroOrder: movie.heroOrder ?? null,
  averageRating: reviewStats.averageRating,
  reviewCount: reviewStats.reviewCount,
  popularityScore: movieTimes.length * 10 + reviewStats.reviewCount,
  release: movie.releaseDate,
  trailer: movie.trailer,
  description: movie.description,
  times: movieTimes.length > 0 ? movieTimes : ["Chưa có lịch"],
  };
};

const serializeMovieDetail = (movie, timeMap = new Map()) => {
  const baseMovie = serializeMovie(movie, timeMap);
  const fallbackGallery = [
    movie.poster,
    ...getYoutubeThumbnailCandidates(movie.trailer),
    movie.poster,
  ].filter(Boolean);

  return {
    ...baseMovie,
    cast: hasDetailItems(movie.cast) ? movie.cast : buildFallbackCast(movie),
    gallery: hasDetailItems(movie.gallery)
      ? movie.gallery
      : [...new Set(fallbackGallery)].slice(0, 4),
    trailerFacts: buildTrailerFacts(movie, timeMap),
    trailerPanel: buildTrailerPanel(movie, timeMap),
  };
};

const serializeShowtime = (showtime) => ({
  id: showtime._id,
  movieId: formatMovieId(showtime.movieLegacyId),
  cinemaName: showtime.cinemaName,
  cinemaAddress: showtime.cinemaAddress,
  roomName: showtime.roomName,
  displayDate: showtime.displayDate,
  displayTime: showtime.displayTime,
  price: showtime.price,
  seats: showtime.seats,
  bookedSeats: showtime.bookedSeats,
  availableSeatCount: Math.max(
    showtime.seats.length - showtime.bookedSeats.length,
    0
  ),
});

const buildMovieFilter = (query) => {
  const filter = { deletedAt: null };

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.search) {
    filter.title = {
      $regex: query.search.trim(),
      $options: "i",
    };
  }

  if (query.genre) {
    filter.genres = query.genre;
  }

  if (query.country) {
    filter.country = query.country;
  }

  if (query.rating) {
    filter.rating = query.rating;
  }

  return filter;
};

const allowedSortFields = new Set([
  "catalogOrder",
  "title",
  "releaseDate",
  "duration",
  "createdAt",
]);

const buildMovieSort = (query) => {
  const sortBy = allowedSortFields.has(String(query.sortBy || ""))
    ? String(query.sortBy)
    : "catalogOrder";
  const sortOrder = String(query.sortOrder || "asc").toLowerCase() === "desc" ? -1 : 1;

  return {
    statusOrder: 1,
    [sortBy]: sortOrder,
    legacyId: 1,
  };
};

const moviesController = {
  getMovies: async (req, res) => {
    try {
      const filter = buildMovieFilter(req.query);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
      const skip = (page - 1) * limit;
      const sort = buildMovieSort(req.query);
      const [movies, totalItems] = await Promise.all([
        MovieModel.find(filter).sort(sort).skip(skip).limit(limit),
        MovieModel.countDocuments(filter),
      ]);
      const showtimes = await ShowtimeModel.find({
        movieLegacyId: { $in: movies.map((movie) => movie.legacyId) },
        displayTime: { $regex: /^\d{2}:\d{2}$/ },
      }).sort({ startTime: 1 });
      const timeMap = createTimeMap(showtimes);
      const reviewStats = await ReviewModel.aggregate([
        { $match: { movieLegacyId: { $in: movies.map((movie) => movie.legacyId) } } },
        { $group: { _id: "$movieLegacyId", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
      ]);
      const reviewMap = new Map(
        reviewStats.map((item) => [
          item._id,
          {
            averageRating: Math.round(Number(item.averageRating || 0) * 10) / 10,
            reviewCount: item.reviewCount || 0,
          },
        ])
      );

      res.status(200).send({
        success: true,
        message: "Get movies successfully",
        data: movies.map((movie) => serializeMovie(movie, timeMap, reviewMap)),
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.max(Math.ceil(totalItems / limit), 1),
        },
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getMovieById: async (req, res) => {
    try {
      const legacyId = Number(req.params.id);

      if (Number.isNaN(legacyId)) {
        return res.status(400).send({
          success: false,
          message: "Movie id is invalid",
          data: null,
        });
      }

      const movie = await MovieModel.findOne({ legacyId, deletedAt: null });

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      const showtimes = await ShowtimeModel.find({
        movieLegacyId: legacyId,
        displayTime: { $regex: /^\d{2}:\d{2}$/ },
      }).sort({ startTime: 1 });
      const timeMap = createTimeMap(showtimes);

      return res.status(200).send({
        success: true,
        message: "Get movie successfully",
        data: serializeMovieDetail(movie, timeMap),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getMovieShowtimes: async (req, res) => {
    try {
      const legacyId = Number(req.params.id);

      if (Number.isNaN(legacyId)) {
        return res.status(400).send({
          success: false,
          message: "Movie id is invalid",
          data: null,
        });
      }

      const movie = await MovieModel.findOne({ legacyId, deletedAt: null });

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      let showtimes = await ShowtimeModel.find({
        movieLegacyId: legacyId,
        displayTime: { $regex: /^\d{2}:\d{2}$/ },
      }).sort({
        cinemaName: 1,
        startTime: 1,
      });

      if (showtimes.length === 0 && movie.status === "now-showing") {
        const seedShowtimes = createShowtimesFromMovies([movie]);

        if (seedShowtimes.length > 0) {
          await ShowtimeModel.bulkWrite(
            seedShowtimes.map((showtime) => ({
              updateOne: {
                filter: { seedKey: showtime.seedKey },
                update: {
                  $set: {
                    movieLegacyId: showtime.movieLegacyId,
                    cinemaName: showtime.cinemaName,
                    cinemaAddress: showtime.cinemaAddress,
                    roomName: showtime.roomName,
                    displayDate: showtime.displayDate,
                    displayTime: showtime.displayTime,
                    startTime: showtime.startTime,
                    endTime: showtime.endTime,
                    price: showtime.price,
                    seats: showtime.seats,
                  },
                  $setOnInsert: {
                    seedKey: showtime.seedKey,
                    bookedSeats: [],
                  },
                },
                upsert: true,
              },
            }))
          );

          showtimes = await ShowtimeModel.find({
            movieLegacyId: legacyId,
            displayTime: { $regex: /^\d{2}:\d{2}$/ },
          }).sort({
            cinemaName: 1,
            startTime: 1,
          });
        }
      }

      return res.status(200).send({
        success: true,
        message: "Get movie showtimes successfully",
        data: {
          movie: {
            id: formatMovieId(movie.legacyId),
            title: movie.title,
            poster: movie.poster,
            status: movie.status,
          },
          showtimes: showtimes.map(serializeShowtime),
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

  getGenres: async (req, res) => {
    try {
      const genres = await GenreModel.find().sort({ name: 1 });

      res.status(200).send({
        success: true,
        message: "Get genres successfully",
        data: genres.map((genre) => ({
          id: genre._id,
          name: genre.name,
          slug: genre.slug,
        })),
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default moviesController;
