import { API_BASE_URL } from "../config/api";

const USER_SESSION_KEY = "user";
const AUTH_SESSION_KEY = "authSession";

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

const normalizeAuthSession = (payload = {}) => {
  const normalizedUser = normalizeAuthUser(payload?.user || payload);

  return {
    user: normalizedUser,
    accessToken: payload?.accessToken || "",
    refreshToken: payload?.refreshToken || "",
  };
};

export const storeAuthSession = (payload = {}) => {
  if (typeof window === "undefined") {
    return normalizeAuthSession(payload);
  }

  const session = normalizeAuthSession(payload);
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(session.user));
  sessionStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    })
  );

  return session;
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
};

export const getStoredAccessToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const rawAuthSession = sessionStorage.getItem(AUTH_SESSION_KEY);
    const authSession = rawAuthSession ? JSON.parse(rawAuthSession) : null;
    return authSession?.accessToken || "";
  } catch {
    return "";
  }
};

export const getAuthHeaders = (headers = {}) => {
  const accessToken = getStoredAccessToken();

  return accessToken
    ? {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      }
    : headers;
};

export const loginUser = async (credentials) => {
  const payload = await requestAuth("login", credentials);
  return normalizeAuthSession(payload);
};

export const registerUser = async (payload) => {
  const responsePayload = await requestAuth("register", payload);
  return normalizeAuthSession(responsePayload);
};

export const updateStoredUser = (user) => {
  if (typeof window === "undefined") {
    return normalizeAuthUser(user);
  }

  const normalizedUser = normalizeAuthUser(user);
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(normalizedUser));
  return normalizedUser;
};

const requestPrivateAuth = async (path, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/${path}`, {
      ...options,
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        ...(options.headers || {}),
      }),
    });

    return await parseResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("KhĂ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n mĂ¡y chá»§");
    }

    throw error;
  }
};

export const getMyProfile = async () => requestPrivateAuth("me", { method: "GET" });

export const updateMyProfile = async (payload) =>
  requestPrivateAuth("profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
