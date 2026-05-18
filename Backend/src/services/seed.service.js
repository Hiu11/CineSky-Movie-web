import bcrypt from "bcryptjs";
import {
  getAdminEmail,
  getAdminFullName,
  getAdminPassword,
} from "../config/env.js";
import { buildMovieDetailSeed } from "../data/movieDetailSeed.js";
import seedFeedbackEntries from "../data/seedFeedback.js";
import seedMovies from "../data/seedMovies.js";
import { createShowtimesFromMovies } from "../data/seedShowtimes.js";
import AdminActivityModel from "../models/adminActivity.model.js";
import BookingModel from "../models/booking.model.js";
import FeedbackModel from "../models/feedback.model.js";
import FavoriteModel from "../models/favorite.model.js";
import GenreModel from "../models/genre.model.js";
import MovieModel from "../models/movie.model.js";
import ReviewModel from "../models/review.model.js";
import ShowtimeModel from "../models/showtime.model.js";
import UserModel from "../models/user.model.js";

const slugifyText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const movieLegacyIdMigrationMap = new Map([
  [204, 1],
  [205, 2],
  [206, 3],
  [207, 4],
  [301, 5],
  [302, 6],
  [303, 7],
  [304, 8],
  [305, 9],
  [306, 10],
  [307, 11],
  [201, 12],
  [202, 13],
  [203, 14],
  [1, 15],
  [2, 16],
  [3, 17],
  [4, 18],
  [5, 19],
  [6, 20],
  [7, 21],
  [308, 101],
  [309, 102],
  [310, 103],
  [103, 104],
  [102, 105],
  [101, 106],
]);

const sampleUsers = [
  {
    fullName: "Nguyễn Minh Anh",
    email: "minhanh@cinesky.local",
    phone: "0901002001",
    gender: "Nam",
    birthday: "2001-03-12",
  },
  {
    fullName: "Trần Hà My",
    email: "hamy@cinesky.local",
    phone: "0901002002",
    gender: "Ná»¯",
    birthday: "2002-07-24",
  },
  {
    fullName: "Lê Hoàng Long",
    email: "hoanglong@cinesky.local",
    phone: "0901002003",
    gender: "Nam",
    birthday: "1999-11-02",
  },
  {
    fullName: "Phạm Gia Bảo",
    email: "giabao@cinesky.local",
    phone: "0901002004",
    gender: "Nam",
    birthday: "2000-01-18",
  },
  {
    fullName: "Võ Thanh Trúc",
    email: "thanhtruc@cinesky.local",
    phone: "0901002005",
    gender: "Ná»¯",
    birthday: "2003-09-09",
  },
  {
    fullName: "Đặng Khánh Vy",
    email: "khanhvy@cinesky.local",
    phone: "0901002006",
    gender: "Ná»¯",
    birthday: "2004-04-21",
  },
];

const sampleActivities = [
  ["CREATE", "Tạo chiến dịch phim Tết 2026", "12 phim có lịch chiếu từ 01/01/2026", "campaign", "tet-2026", "2026-01-02T03:20:00.000Z"],
  ["UPDATE", "Cập nhật giá vé cuối tuần", "Áp dụng cho 4 cụm rạp", "pricing", "weekend-2026", "2026-01-17T04:05:00.000Z"],
  ["CREATE", "Thêm suất chiếu Mưa Đỏ", "Phòng Sky 02 - 18:20", "showtime", "seed-showtime-01", "2026-02-05T08:40:00.000Z"],
  ["UPDATE", "Điều chỉnh poster phim sắp chiếu", "Supergirl và Mùi Phở", "movie", "coming-soon", "2026-03-11T07:12:00.000Z"],
  ["ROLE", "Cấp quyền kiểm duyệt nội dung", "User -> Admin ca tối", "user", "moderator-night", "2026-04-08T02:35:00.000Z"],
  ["RESTORE", "Khôi phục phim trong thùng rác", "Đã đưa phim về catalog", "movie", "restore-demo", "2026-05-09T09:18:00.000Z"],
];

const bookingTemplates = [
  { userIndex: 0, movieIndex: 0, seats: ["A1", "A2"], createdAt: "2026-01-04T12:15:00.000Z", status: "booked" },
  { userIndex: 1, movieIndex: 1, seats: ["B5", "B6", "B7"], createdAt: "2026-01-21T13:40:00.000Z", status: "booked" },
  { userIndex: 2, movieIndex: 2, seats: ["C3"], createdAt: "2026-02-09T11:05:00.000Z", status: "booked" },
  { userIndex: 3, movieIndex: 3, seats: ["D8", "D9"], createdAt: "2026-02-26T14:20:00.000Z", status: "cancelled" },
  { userIndex: 4, movieIndex: 4, seats: ["E1", "E2", "E3", "E4"], createdAt: "2026-03-14T10:50:00.000Z", status: "booked" },
  { userIndex: 5, movieIndex: 5, seats: ["F6", "F7"], createdAt: "2026-03-30T15:10:00.000Z", status: "booked" },
  { userIndex: 0, movieIndex: 6, seats: ["G4", "G5"], createdAt: "2026-04-12T09:32:00.000Z", status: "booked" },
  { userIndex: 1, movieIndex: 7, seats: ["H1"], createdAt: "2026-04-27T12:48:00.000Z", status: "booked" },
  { userIndex: 2, movieIndex: 8, seats: ["A9", "A10"], createdAt: "2026-05-06T08:24:00.000Z", status: "booked" },
  { userIndex: 3, movieIndex: 9, seats: ["B1", "B2", "B3"], createdAt: "2026-05-15T13:06:00.000Z", status: "booked" },
];

const reviewTemplates = [
  { userIndex: 0, movieIndex: 0, rating: 9, content: "Phim cuốn, hình ảnh đẹp và đặt vé trên CineSky rất nhanh." },
  { userIndex: 1, movieIndex: 1, rating: 8, content: "Rạp sạch, suất chiếu đúng giờ, phần chọn ghế dễ dùng." },
  { userIndex: 2, movieIndex: 2, rating: 7, content: "Nội dung ổn, muốn có thêm nhắc lịch trước giờ chiếu." },
  { userIndex: 3, movieIndex: 3, rating: 8, content: "Trang chi tiết phim rõ ràng, trailer tải nhanh." },
  { userIndex: 4, movieIndex: 4, rating: 9, content: "Dashboard vé và lịch sử mua vé rất tiện để tra lại." },
  { userIndex: 5, movieIndex: 5, rating: 8, content: "Combo phim Việt trong catalog khá phong phú." },
];

const ensureAdminSampleData = async () => {
  const samplePassword = await bcrypt.hash("CineSky@2026", 10);

  await UserModel.bulkWrite(
    sampleUsers.map((user) => ({
      updateOne: {
        filter: { email: user.email },
        update: {
          $set: {
            fullName: user.fullName,
            phone: user.phone,
            gender: user.gender,
            birthday: user.birthday,
            role: "user",
          },
          $setOnInsert: {
            email: user.email,
            password: samplePassword,
            createdAt: new Date("2026-01-01T02:00:00.000Z"),
          },
        },
        upsert: true,
      },
    }))
  );

  const [users, movies, showtimes] = await Promise.all([
    UserModel.find({ email: { $in: sampleUsers.map((user) => user.email) } }),
    MovieModel.find({ deletedAt: null }).sort({ catalogOrder: 1, legacyId: 1 }).limit(16),
    ShowtimeModel.find({}).sort({ startTime: 1 }).limit(80),
  ]);

  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const sampleUserDocs = sampleUsers.map((user) => userByEmail.get(user.email)).filter(Boolean);

  if (sampleUserDocs.length === 0 || movies.length === 0 || showtimes.length === 0) {
    return;
  }

  const showtimesByMovie = showtimes.reduce((map, showtime) => {
    const key = Number(showtime.movieLegacyId);
    map.set(key, [...(map.get(key) || []), showtime]);
    return map;
  }, new Map());

  const bookingWrites = bookingTemplates
    .map((template, index) => {
      const user = sampleUserDocs[template.userIndex % sampleUserDocs.length];
      const movie = movies[template.movieIndex % movies.length];
      const movieShowtimes = showtimesByMovie.get(Number(movie.legacyId)) || showtimes;
      const showtime = movieShowtimes[index % movieShowtimes.length];

      if (!user || !movie || !showtime) {
        return null;
      }

      const createdAt = new Date(template.createdAt);

      return {
        updateOne: {
          filter: {
            customerEmail: user.email,
            movieLegacyId: movie.legacyId,
            showtimeId: showtime._id,
            seatNumbers: template.seats,
          },
          update: {
            $set: {
              userId: user._id,
              customerName: user.fullName,
              customerEmail: user.email,
              screeningDate: showtime.startTime?.toISOString?.().slice(0, 10) || "",
              screeningDateLabel: showtime.displayDate,
              movieLegacyId: movie.legacyId,
              showtimeId: showtime._id,
              seatNumbers: template.seats,
              totalPrice: Number(showtime.price || 90000) * template.seats.length,
              status: template.status,
            },
            $setOnInsert: {
              createdAt,
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (bookingWrites.length > 0) {
    await BookingModel.bulkWrite(bookingWrites);
    await Promise.all(
      bookingTemplates.map((template, index) => {
        const movie = movies[template.movieIndex % movies.length];
        const movieShowtimes = showtimesByMovie.get(Number(movie.legacyId)) || showtimes;
        const showtime = movieShowtimes[index % movieShowtimes.length];

        return showtime
          ? ShowtimeModel.updateOne(
              { _id: showtime._id },
              { $addToSet: { bookedSeats: { $each: template.seats } } }
            )
          : null;
      })
    );
  }

  await ReviewModel.bulkWrite(
    reviewTemplates.map((template) => {
      const user = sampleUserDocs[template.userIndex % sampleUserDocs.length];
      const movie = movies[template.movieIndex % movies.length];

      return {
        updateOne: {
          filter: { userId: user._id, movieLegacyId: movie.legacyId },
          update: {
            $set: {
              rating: template.rating,
              content: template.content,
            },
            $setOnInsert: {
              createdAt: new Date("2026-04-01T09:00:00.000Z"),
            },
          },
          upsert: true,
        },
      };
    })
  );

  await FavoriteModel.bulkWrite(
    sampleUserDocs.flatMap((user, userIndex) =>
      movies.slice(userIndex, userIndex + 3).map((movie) => ({
        updateOne: {
          filter: { userId: user._id, movieLegacyId: movie.legacyId },
          update: {
            $set: {
              userId: user._id,
              movieLegacyId: movie.legacyId,
            },
            $setOnInsert: {
              createdAt: new Date(`2026-0${Math.min(userIndex + 1, 5)}-12T08:00:00.000Z`),
            },
          },
          upsert: true,
        },
      }))
    )
  );

  await FeedbackModel.bulkWrite(
    sampleUserDocs.map((user, index) => ({
      updateOne: {
        filter: { seedKey: `admin-sample-feedback-${index + 1}` },
        update: {
          $set: {
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            rating: 8 + (index % 3),
            headline: ["Trải nghiệm đặt vé tốt", "Cần thêm bộ lọc rạp", "Dashboard dễ theo dõi"][index % 3],
            message:
              "Dữ liệu mẫu được seed từ backend để trang quản trị có đủ phản hồi thật trong database.",
            source: "seed",
          },
          $setOnInsert: {
            seedKey: `admin-sample-feedback-${index + 1}`,
            createdAt: new Date(`2026-0${Math.min(index + 1, 5)}-18T10:00:00.000Z`),
          },
        },
        upsert: true,
      },
    }))
  );

  await AdminActivityModel.bulkWrite(
    sampleActivities.map(([action, name, value, entityType, entityId, createdAt], index) => ({
      updateOne: {
        filter: { entityType, entityId, action, name },
        update: {
          $set: {
            action,
            name,
            value,
            entityType,
            entityId,
            adminName: "CineSky Admin",
          },
          $setOnInsert: {
            createdAt: new Date(createdAt),
          },
        },
        upsert: true,
      },
    }))
  );

  console.log("Synced admin sample data");
};

export const ensureMovieSeedData = async () => {
  const moviesWithDetails = seedMovies.map((movie) => ({
    ...movie,
    ...buildMovieDetailSeed(movie),
  }));

  await MovieModel.bulkWrite(
    moviesWithDetails.map((movie, index) => ({
      updateOne: {
        filter: { slug: movie.slug },
        update: { $set: { legacyId: -(index + 1) } },
      },
    }))
  );

  await MovieModel.bulkWrite(
    moviesWithDetails.map((movie) => ({
      updateOne: {
        filter: { slug: movie.slug },
        update: { $set: movie },
        upsert: true,
      },
    }))
  );

  await Promise.all(
    [...movieLegacyIdMigrationMap.entries()].flatMap(([oldId, newId]) => [
      ShowtimeModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
      BookingModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
      FavoriteModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
      ReviewModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
    ])
  );

  await Promise.all(
    [...movieLegacyIdMigrationMap.values()].flatMap((newId) => [
      ShowtimeModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
      BookingModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
      FavoriteModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
      ReviewModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
    ])
  );

  console.log("Synced movie seed data");

  const genres = Array.from(new Set(seedMovies.flatMap((movie) => movie.genres))).map((name) => ({
    name,
    slug: slugifyText(name),
  }));

  await GenreModel.bulkWrite(
    genres.map((genre) => ({
      updateOne: {
        filter: {
          $or: [{ name: genre.name }, { slug: genre.slug }],
        },
        update: {
          $set: genre,
        },
        upsert: true,
      },
    }))
  );

  const showtimes = createShowtimesFromMovies(seedMovies);
  const showtimeSeedKeys = showtimes.map((showtime) => showtime.seedKey);

  if (showtimes.length > 0) {
    await ShowtimeModel.bulkWrite(
      showtimes.map((showtime) => ({
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

    console.log("Synced showtime seed data");
  }

  await ShowtimeModel.deleteMany({
    seedKey: { $exists: true, $nin: showtimeSeedKeys },
  });

  if (seedFeedbackEntries.length > 0) {
    await FeedbackModel.bulkWrite(
      seedFeedbackEntries.map((entry) => ({
        updateOne: {
          filter: { seedKey: entry.seedKey },
          update: {
            $set: {
              userId: entry.userId || null,
              fullName: entry.fullName,
              email: entry.email,
              rating: entry.rating,
              headline: entry.headline,
              message: entry.message,
              source: "seed",
            },
            $setOnInsert: {
              seedKey: entry.seedKey,
            },
          },
          upsert: true,
        },
      }))
    );

    console.log("Synced feedback seed data");
  }

  await ensureAdminSampleData();
};

export const ensureAdminAccount = async () => {
  const adminEmail = String(getAdminEmail() || "").trim().toLowerCase();
  const adminPassword = String(getAdminPassword() || "");

  if (!adminEmail || !adminPassword) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        fullName: getAdminFullName(),
        role: "admin",
        password: hashedPassword,
      },
      $setOnInsert: {
        email: adminEmail,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  console.log("Ensured admin account");
};
