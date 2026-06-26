const getDefaultApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { protocol, hostname } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalhost) {
    return "http://localhost:5000";
  }

  // If not localhost, it must be a deployed environment (Vercel or custom domain).
  // Always default to the Vercel backend unless explicitly overridden by ENV vars.
  return "https://cine-sky-be.vercel.app";
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  getDefaultApiBaseUrl();
