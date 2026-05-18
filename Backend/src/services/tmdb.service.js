import { getTmdbApiKey } from "../config/env.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const buildTmdbUrl = (path, params = {}, apiKey = "") => {
  const searchParams = new URLSearchParams({
    language: "vi-VN",
    ...params,
  });

  if (apiKey && !apiKey.startsWith("eyJ")) {
    searchParams.set("api_key", apiKey);
  }

  return `${TMDB_BASE_URL}${path}?${searchParams.toString()}`;
};

const requestTmdb = async (path, params = {}) => {
  const apiKey = getTmdbApiKey();

  if (!apiKey) {
    const error = new Error("TMDB_API_KEY is not configured");
    error.statusCode = 400;
    throw error;
  }

  const headers = { Accept: "application/json" };

  if (apiKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(buildTmdbUrl(path, params, apiKey), { headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.status_message || "Cannot fetch TMDB metadata");
    error.statusCode = response.status;
    throw error;
  }

  return payload;
};

const getTrailerUrl = (videos = []) => {
  const trailer = videos.find(
    (video) => video.site === "YouTube" && ["Trailer", "Teaser"].includes(video.type)
  );

  return trailer?.key ? `https://www.youtube.com/embed/${trailer.key}` : "";
};

const formatReleaseDate = (releaseDate = "") => {
  if (!releaseDate) {
    return "";
  }

  const [year, month, day] = releaseDate.split("-");
  return [day, month, year].filter(Boolean).join("/");
};

const normalizeMovieMetadata = (movie, detail) => {
  const credits = detail.credits || {};
  const director = (credits.crew || []).find((person) => person.job === "Director");
  const cast = (credits.cast || [])
    .slice(0, 6)
    .map((person) => `${person.name}: ${person.character || "Diễn viên"}`)
    .join("\n");
  const gallery = [
    detail.poster_path,
    detail.backdrop_path,
    ...(detail.images?.backdrops || []).slice(0, 3).map((image) => image.file_path),
  ]
    .filter(Boolean)
    .map((imagePath) => `${TMDB_IMAGE_BASE_URL}${imagePath}`);

  return {
    tmdbId: movie.id,
    title: detail.title || movie.title || "",
    poster: detail.poster_path ? `${TMDB_IMAGE_BASE_URL}${detail.poster_path}` : "",
    genres: (detail.genres || []).map((genre) => genre.name),
    country: detail.production_countries?.[0]?.name || "",
    director: director?.name || "",
    duration: detail.runtime || "",
    releaseDate: formatReleaseDate(detail.release_date || movie.release_date),
    trailer: getTrailerUrl(detail.videos?.results || []),
    description: detail.overview || movie.overview || "",
    cast,
    gallery,
    trailerFacts: [
      detail.vote_average ? `Điểm TMDB: ${Number(detail.vote_average).toFixed(1)}/10` : "",
      detail.vote_count ? `Lượt đánh giá: ${detail.vote_count}` : "",
      detail.original_language ? `Ngôn ngữ gốc: ${detail.original_language.toUpperCase()}` : "",
    ].filter(Boolean).join("\n"),
    trailerPanelLabel: "Metadata TMDB",
    trailerPanelTitle: detail.title || movie.title || "",
    trailerPanelDescription: detail.tagline || detail.overview || "",
  };
};

const tmdbService = {
  searchMovieMetadata: async (query = "") => {
    const safeQuery = String(query || "").trim();

    if (!safeQuery) {
      const error = new Error("Movie title is required");
      error.statusCode = 400;
      throw error;
    }

    const searchPayload = await requestTmdb("/search/movie", {
      query: safeQuery,
      include_adult: "false",
      page: "1",
    });
    const movie = searchPayload.results?.[0];

    if (!movie) {
      const error = new Error("No TMDB movie matched this title");
      error.statusCode = 404;
      throw error;
    }

    const detail = await requestTmdb(`/movie/${movie.id}`, {
      append_to_response: "videos,credits,images",
      include_image_language: "vi,en,null",
    });

    return normalizeMovieMetadata(movie, detail);
  },
};

export default tmdbService;
