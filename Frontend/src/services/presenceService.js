import { API_BASE_URL } from "../config/api";
import { getAuthHeaders } from "./authService";

const VISITOR_ID_KEY = "cinesky-visitor-id";

const createVisitorId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export const getVisitorId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const existingVisitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (existingVisitorId) {
    return existingVisitorId;
  }

  const visitorId = createVisitorId();
  localStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
};

export const sendPresenceHeartbeat = async ({ currentPath = "/" } = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/presence/heartbeat`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      visitorId: getVisitorId(),
      currentPath,
    }),
    keepalive: true,
  });

  return response.ok;
};

export const getAdminPresence = async ({ thresholdSeconds = 90, limit = 100 } = {}) => {
  const searchParams = new URLSearchParams({
    thresholdSeconds: String(thresholdSeconds),
    limit: String(limit),
  });
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/presence?${searchParams.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Cannot load online visitors");
  }

  return payload.data;
};
