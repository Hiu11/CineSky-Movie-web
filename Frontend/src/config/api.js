const getDefaultApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { protocol, hostname } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalhost) {
    return "http://localhost:5000";
  }

  return `${protocol}//${hostname}:5000`;
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();
