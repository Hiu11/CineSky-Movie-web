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
