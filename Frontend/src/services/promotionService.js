import { API_BASE_URL } from "../config/api";

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

export const getPromotions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/promotions`);

  return parseResponse(response);
};
