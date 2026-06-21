import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

const getDotenvValue = (key = "") => {
  try {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    return parsed[key] || "";
  } catch {
    return "";
  }
};

const getEnvValue = (primaryKey, fallbackKey = "") =>
  process.env[primaryKey] ||
  getDotenvValue(primaryKey) ||
  (fallbackKey ? process.env[fallbackKey] || getDotenvValue(fallbackKey) : "");

const getVercelUrl = () => {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  return vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}` : "";
};

const isLocalNetworkUrl = (value = "") =>
  /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(String(value));

export const getMongoUri = () => getEnvValue("MONGODB_URI", "MONGO_URI");

export const getJwtSecret = () => getEnvValue("JWT_SECRET");

export const getJwtExpiresIn = () => getEnvValue("JWT_EXPIRES_IN") || "1d";

export const getJwtRefreshSecret = () =>
  getEnvValue("JWT_REFRESH_SECRET") || getJwtSecret();

export const getJwtRefreshExpiresIn = () =>
  getEnvValue("JWT_REFRESH_EXPIRES_IN") || "7d";

export const getAdminEmail = () => getEnvValue("ADMIN_EMAIL");

export const getAdminPassword = () => getEnvValue("ADMIN_PASSWORD");

export const getAdminFullName = () =>
  getEnvValue("ADMIN_FULL_NAME") || "CineSky Admin";

export const getFrontendUrl = () => {
  const configuredUrl = getEnvValue("FRONTEND_URL");

  if (process.env.VERCEL && isLocalNetworkUrl(configuredUrl)) {
    return "https://cine-sky-fe.vercel.app";
  }

  return configuredUrl || "http://localhost:3000";
};

export const getBackendPublicUrl = () => {
  const configuredUrl = getEnvValue("BACKEND_PUBLIC_URL");

  if (configuredUrl && !(process.env.VERCEL && isLocalNetworkUrl(configuredUrl))) {
    return configuredUrl;
  }

  return getVercelUrl() || `http://localhost:${getEnvValue("PORT") || "5000"}`;
};

export const getTmdbApiKey = () => getEnvValue("TMDB_API_KEY");

export const getGoogleClientId = () => getEnvValue("GOOGLE_CLIENT_ID");

export const getGoogleClientSecret = () => getEnvValue("GOOGLE_CLIENT_SECRET");

export const getGoogleRedirectUri = () => {
  const configuredUri = getEnvValue("GOOGLE_REDIRECT_URI");

  if (configuredUri && !(process.env.VERCEL && isLocalNetworkUrl(configuredUri))) {
    return configuredUri;
  }

  return `${getBackendPublicUrl().replace(/\/+$/, "")}/api/v1/auth/google/callback`;
};

export const getFacebookClientId = () => getEnvValue("FACEBOOK_CLIENT_ID");

export const getFacebookClientSecret = () => getEnvValue("FACEBOOK_CLIENT_SECRET");

export const getFacebookRedirectUri = () => {
  const configuredUri = getEnvValue("FACEBOOK_REDIRECT_URI");

  if (configuredUri && !(process.env.VERCEL && isLocalNetworkUrl(configuredUri))) {
    return configuredUri;
  }

  return `${getBackendPublicUrl().replace(/\/+$/, "")}/api/v1/auth/facebook/callback`;
};

export const getOpenAiApiKey = () => getEnvValue("OPENAI_API_KEY");

export const getOpenAiModel = () => getEnvValue("OPENAI_MODEL") || "gpt-4o-mini";

export const getGeminiApiKey = () => getEnvValue("GEMINI_API_KEY");

export const getGeminiModel = () => getEnvValue("GEMINI_MODEL") || "gemini-2.5-flash";
