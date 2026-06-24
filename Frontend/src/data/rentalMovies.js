export const RENTAL_MOVIES = [
  {
    id: "r001",
    sourceMovieId: "018",
    title: "ĐÀO, PHỞ VÀ PIANO",
    poster: "/assets/images/Đào.jpg",
    releaseDate: "2024",
    leftTheatersLabel: "Đã rời rạp",
    genre: "Lịch sử, tâm lý",
    duration: 100,
  },
  {
    id: "r002",
    sourceMovieId: "019",
    title: "1990",
    poster: "/assets/images/1990.webp",
    releaseDate: "2022",
    leftTheatersLabel: "Đã rời rạp",
    genre: "Tâm lý, hài, gia đình",
    duration: 110,
  },
  {
    id: "r003",
    sourceMovieId: "020",
    title: "MẮT BIẾC",
    poster: "/assets/images/Mắt biếc.jpg",
    releaseDate: "2019",
    leftTheatersLabel: "Đã rời rạp",
    genre: "Lãng mạn, tâm lý",
    duration: 117,
  },
];

const normalizeMovieId = (id = "") => {
  const value = String(id || "").trim();
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && value !== "" ? String(numericValue) : value;
};

export const isRentalMovieId = (id = "") =>
  RENTAL_MOVIES.some(
    (movie) => String(movie.id) === String(id) || normalizeMovieId(movie.sourceMovieId) === normalizeMovieId(id)
  );

export const getRentalMovieById = (id = "") =>
  RENTAL_MOVIES.find(
    (movie) => String(movie.id) === String(id) || normalizeMovieId(movie.sourceMovieId) === normalizeMovieId(id)
  ) || null;
