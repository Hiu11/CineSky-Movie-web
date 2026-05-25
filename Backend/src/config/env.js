const getEnvValue = (primaryKey, fallbackKey = "") =>
  process.env[primaryKey] || (fallbackKey ? process.env[fallbackKey] : "");

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

export const getFrontendUrl = () =>
  getEnvValue("FRONTEND_URL") || "http://localhost:3000";

export const getBackendPublicUrl = () =>
  getEnvValue("BACKEND_PUBLIC_URL") ||
  `http://localhost:${getEnvValue("PORT") || "5000"}`;

export const getTmdbApiKey = () => getEnvValue("TMDB_API_KEY");

export const getGoogleClientId = () => getEnvValue("GOOGLE_CLIENT_ID");

export const getGoogleClientSecret = () => getEnvValue("GOOGLE_CLIENT_SECRET");

export const getGoogleRedirectUri = () => getEnvValue("GOOGLE_REDIRECT_URI");

export const getFacebookClientId = () => getEnvValue("FACEBOOK_CLIENT_ID");

export const getFacebookClientSecret = () => getEnvValue("FACEBOOK_CLIENT_SECRET");

export const getFacebookRedirectUri = () => getEnvValue("FACEBOOK_REDIRECT_URI");
