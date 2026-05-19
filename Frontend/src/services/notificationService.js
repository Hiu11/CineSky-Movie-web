import { API_BASE_URL } from "../config/api";
import { getAuthHeaders } from "./authService";

const parseResponse = async (response) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    throw new Error(`Request failed (${response.status})`);
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data;
};

export const getMyNotifications = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const getUnreadNotificationCount = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};
