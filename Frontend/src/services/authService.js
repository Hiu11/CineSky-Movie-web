import { API_BASE_URL } from "../config/api";

const parseResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload.data;
};

const requestAuth = async (path, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

export const normalizeAuthUser = (user) => ({
  id: user?.id || user?._id || "",
  name: user?.name || user?.fullName || "",
  fullName: user?.fullName || user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  gender: user?.gender || "",
  birthday: user?.birthday || "",
  role: user?.role || "user",
  avatar: user?.avatar || "",
});

export const loginUser = async (credentials) => {
  const user = await requestAuth("login", credentials);
  return normalizeAuthUser(user);
};

export const registerUser = async (payload) => {
  const user = await requestAuth("register", payload);
  return normalizeAuthUser(user);
};
