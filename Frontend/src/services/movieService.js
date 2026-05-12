import { API_BASE_URL } from "../config/api";
import { clearAuthSession, getAuthHeaders } from "./authService";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const parseResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    if (response.status === 401 || payload?.message === "Invalid or expired token") {
      clearAuthSession();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data;
};

const normalizeMoviePoster = (poster = "") => {
  if (poster === "/assets/images/dai-tiec-trang-mau-1.jpg") {
    return "/assets/images/dai-tiec-trang-mau.jpg";
  }

  return poster;
};

const normalizeMovieAsset = (movie) =>
  movie
    ? {
        ...movie,
        poster: normalizeMoviePoster(movie.poster),
        gallery: Array.isArray(movie.gallery)
          ? movie.gallery.map((item) => normalizeMoviePoster(item))
          : movie.gallery,
      }
    : movie;

const normalizeMoviePayload = (payload) =>
  Array.isArray(payload) ? payload.map(normalizeMovieAsset) : normalizeMovieAsset(payload);

export const getMovies = async (params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/movies${buildQueryString(params)}`
  );
  return normalizeMoviePayload(await parseResponse(response));
};

export const getMovieById = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/movies/${movieId}`);
  return normalizeMoviePayload(await parseResponse(response));
};

export const getMovieShowtimes = async (movieId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/movies/${movieId}/showtimes`
  );
  return parseResponse(response);
};

export const getGenres = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/genres`);
  return parseResponse(response);
};

export const getBookingHistory = async (params = {}) => {
  const { limit } = params || {};

  const response = await fetch(
    `${API_BASE_URL}/api/v1/bookings/history${buildQueryString({ limit })}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return parseResponse(response);
};

export const createBooking = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

const requestAdmin = async (path, params = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/${path}${buildQueryString(params)}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const getAdminOverview = async () => requestAdmin("overview");

export const getAdminActivity = async (params = {}) => requestAdmin("activity", params);

export const getAdminUsers = async (params = {}) => requestAdmin("users", params);

export const getAdminBookings = async (params = {}) => requestAdmin("bookings", params);

export const getAdminDeletedMovies = async () => requestAdmin("movies/trash");

export const updateAdminUserRole = async (userId, role) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ role }),
  });

  return parseResponse(response);
};

const requestAdminMovie = async (path, method, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/movies${path}`, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const createAdminMovie = async (payload) => requestAdminMovie("", "POST", payload);

export const updateAdminMovie = async (movieId, payload) => requestAdminMovie(`/${movieId}`, "PUT", payload);

export const restoreAdminMovie = async (movieId) => requestAdminMovie(`/${movieId}/restore`, "PATCH");

export const uploadAdminPoster = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/uploads/poster`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const deleteAdminMovie = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/movies/${movieId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};
