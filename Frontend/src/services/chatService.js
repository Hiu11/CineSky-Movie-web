import { API_BASE_URL } from "../config/api";
import { getAuthHeaders } from "./authService";

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data;
};

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

export const startChatConversation = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/chats`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const getChatConversation = async (conversationId, params = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/chats/${conversationId}${buildQueryString(params)}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const sendChatMessage = async (conversationId, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/chats/${conversationId}/messages`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const askMovieAi = async (message) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/chats/ai/recommend`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ message }),
  });

  return parseResponse(response);
};

export const getAdminChats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/chats`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const getAdminChat = async (conversationId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/chats/${conversationId}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
};

export const sendAdminChatMessage = async (conversationId, text) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/chats/${conversationId}/messages`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text }),
  });

  return parseResponse(response);
};
