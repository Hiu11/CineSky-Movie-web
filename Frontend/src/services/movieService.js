import { API_BASE_URL } from "../config/api";

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
    throw new Error(payload?.message || "Request failed");
  }

  return payload.data;
};

export const getMovies = async (params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/movies${buildQueryString(params)}`
  );
  return parseResponse(response);
};

export const getMovieById = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/movies/${movieId}`);
  return parseResponse(response);
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
  const response = await fetch(
    `${API_BASE_URL}/api/v1/bookings/history${buildQueryString(params)}`
  );
  return parseResponse(response);
};

export const createBooking = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};
