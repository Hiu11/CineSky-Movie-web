import { API_BASE_URL } from "../config/api";
import { getAuthHeaders } from "./authService";

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
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data;
};

const parsePayload = async (response) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    throw new Error(`Request failed (${response.status})`);
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload;
};

export const getFeedbackEntries = async (params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/feedback${buildQueryString(params)}`
  );

  return parseResponse(response);
};

export const getFeedbackEntriesPage = async (params = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/feedback${buildQueryString(params)}`
  );
  const payload = await parsePayload(response);

  return {
    data: payload.data,
    pagination: payload.pagination,
  };
};

export const getAdminFeedbackEntries = async (params = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/feedback${buildQueryString(params)}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const createFeedbackEntry = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/feedback`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    });

    return await parseResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Không thể kết nối đến máy chủ");
    }

    throw error;
  }
};

export const getSupportMessages = async (feedbackId, email = "") => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/feedback/${feedbackId}/support-messages${buildQueryString({ email })}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response);
};

export const sendSupportMessage = async (feedbackId, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/feedback/${feedbackId}/support-messages`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const updateAdminFeedbackEntry = async (feedbackId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    });

    return await parseResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Không thể kết nối đến máy chủ");
    }

    throw error;
  }
};
