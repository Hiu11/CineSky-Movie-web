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
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    throw new Error(`Request failed (${response.status})`);
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 401 || payload?.message === "Invalid or expired token") {
      clearAuthSession();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data;
};

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
const imageExtensionPattern = /\.(avif|gif|jpe?g|png|webp)(\?.*)?$/i;

const normalizeMovieImage = (image = "") => {
  const source = String(image || "").trim();

  if (!source) {
    return "";
  }

  if (source === "/assets/images/dai-tiec-trang-mau-1.jpg") {
    return "/assets/images/dai-tiec-trang-mau.jpg";
  }

  if (/^data:image\//i.test(source) || /^https?:\/\//i.test(source)) {
    return source;
  }

  if (source.startsWith("/assets/")) {
    return source;
  }

  if (source.startsWith("assets/")) {
    return `/${source}`;
  }

  if (source.startsWith("/") && imageExtensionPattern.test(source)) {
    return `${TMDB_IMAGE_BASE_URL}${source}`;
  }

  return source;
};

const isUsableGalleryImage = (image = "") => {
  const source = String(image || "").trim();

  return (
    /^data:image\/[a-z0-9.+-]+;base64,/i.test(source) ||
    source.startsWith("/assets/") ||
    source.startsWith("assets/") ||
    imageExtensionPattern.test(source) ||
    (source.startsWith(TMDB_IMAGE_BASE_URL) && imageExtensionPattern.test(source))
  );
};

const normalizeMovieAsset = (movie) =>
  movie
    ? {
        ...movie,
        poster: normalizeMovieImage(movie.poster),
        gallery: Array.isArray(movie.gallery)
          ? movie.gallery
              .map((item) => normalizeMovieImage(item))
              .filter((item) => isUsableGalleryImage(item))
          : movie.gallery,
      }
    : movie;

const normalizeMoviePayload = (payload) =>
  Array.isArray(payload) ? payload.map(normalizeMovieAsset) : normalizeMovieAsset(payload);

export const getMovies = async (params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/movies${buildQueryString(params)}`,
    { cache: "no-store" }
  );
  return normalizeMoviePayload(await parseResponse(response));
};

export const getMovieById = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/movies/${movieId}`, {
    cache: "no-store",
  });
  return normalizeMoviePayload(await parseResponse(response));
};

export const getMovieShowtimes = async (movieId, params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/movies/${movieId}/showtimes${buildQueryString(params)}`,
    { cache: "no-store" }
  );
  return parseResponse(response);
};

export const getGenres = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/genres`, {
    cache: "no-store",
  });
  return parseResponse(response);
};

export const getBookingFees = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/movies/config/booking-fees`);
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
  const historyPayload = await parseResponse(response);
  return {
    bookings: Array.isArray(historyPayload) ? historyPayload : historyPayload?.bookings || [],
    membership: historyPayload?.membership || null,
  };
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

export const createMockPaymentSession = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/mock-sessions`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const getMockPaymentSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/mock-sessions/${sessionId}`, {
    cache: "no-store",
  });

  return parseResponse(response);
};

export const confirmMockPaymentSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/mock-sessions/${sessionId}/confirm`, {
    method: "PATCH",
  });

  return parseResponse(response);
};

export const cancelBooking = async (bookingId, payload = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const getMovieReviews = async (movieId, params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/reviews/${movieId}${buildQueryString(params)}`
  );
  return parseResponse(response);
};

export const createMovieReview = async (movieId, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/reviews/${movieId}`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const deleteMyMovieReview = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/reviews/${movieId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const getMyFavorites = async (params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/favorites${buildQueryString(params)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return parseResponse(response);
};

export const addMyFavorite = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/favorites/${movieId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const removeMyFavorite = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/favorites/${movieId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

const requestAdmin = async (path, params = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/${path}${buildQueryString(params)}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return parseResponse(response);
};

export const lockBookingSeats = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/bookings/seat-locks`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const validateBookingVoucher = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/bookings/validate-voucher`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const getAdminOverview = async () => requestAdmin("overview");

export const getAdminAnalytics = async (params = {}) => requestAdmin("analytics", params);

export const getAdminActivity = async (params = {}) => requestAdmin("activity", params);

export const getAdminPresence = async (params = {}) => requestAdmin("presence", params);

export const getAdminUsers = async (params = {}) => requestAdmin("users", params);

export const getAdminBookings = async (params = {}) => requestAdmin("bookings", params);

export const getAdminPromotions = async () => requestAdmin("promotions");

export const getAdminFeedback = async (params = {}) => requestAdmin("feedback", params);

export const lookupAdminTicket = async (ticketCode) => requestAdmin("tickets/lookup", { ticketCode });

export const checkInAdminTicket = async (ticketCode) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/tickets/${encodeURIComponent(ticketCode)}/check-in`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
  });

  return parseResponse(response);
};

export const getAdminDeletedMovies = async () => requestAdmin("movies/trash");

export const searchAdminTmdbMovie = async (query) => requestAdmin("tmdb/search", { query });

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

export const updateAdminFeedback = async (feedbackId, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/feedback/${feedbackId}`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const deleteAdminFeedback = async (feedbackId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/feedback/${feedbackId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

const requestAdminMovie = async (path, method, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/movies${path}`, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    cache: "no-store",
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

const requestAdminPromotion = async (path, method, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/promotions${path}`, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    cache: "no-store",
    body: method === "DELETE" ? undefined : JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const createAdminPromotion = async (payload) => requestAdminPromotion("", "POST", payload);

export const updateAdminPromotion = async (promotionId, payload) => requestAdminPromotion(`/${promotionId}`, "PUT", payload);

export const deleteAdminPromotion = async (promotionId) => requestAdminPromotion(`/${promotionId}`, "DELETE");
