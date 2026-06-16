import crypto from "crypto";

const SESSION_TTL_MS = 15 * 60 * 1000;
const sessions = new Map();

const toPublicSession = (session) => ({
  id: session.id,
  status: session.status,
  amount: session.amount,
  provider: session.provider,
  method: session.method,
  movieTitle: session.movieTitle,
  seatNumbers: session.seatNumbers,
  createdAt: session.createdAt,
  expiresAt: session.expiresAt,
  paidAt: session.paidAt || null,
});

const markExpiredIfNeeded = (session) => {
  if (session?.status === "pending" && Date.now() > new Date(session.expiresAt).getTime()) {
    session.status = "expired";
  }
  return session;
};

const getSessionOrThrow = (sessionId) => {
  const session = markExpiredIfNeeded(sessions.get(sessionId));

  if (!session) {
    const error = new Error("Phiên thanh toán không tồn tại.");
    error.status = 404;
    error.statusCode = 404;
    throw error;
  }

  return session;
};

const pruneExpiredSessions = () => {
  const now = Date.now();

  sessions.forEach((session, sessionId) => {
    const expiredForTooLong = now - new Date(session.expiresAt).getTime() > SESSION_TTL_MS;
    if (session.status === "expired" && expiredForTooLong) {
      sessions.delete(sessionId);
    }
  });
};

export const createMockPaymentSession = (payload = {}) => {
  pruneExpiredSessions();

  const amount = Number(payload.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Số tiền thanh toán không hợp lệ.");
    error.status = 400;
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const session = {
    id: crypto.randomUUID(),
    status: "pending",
    amount,
    provider: String(payload.provider || "").trim() || "CineSky Pay",
    method: String(payload.method || "").trim() || "qr",
    movieId: payload.movieId || "",
    movieTitle: payload.movieTitle || "",
    showtimeId: payload.showtimeId || "",
    screeningDate: payload.screeningDate || "",
    seatNumbers: Array.isArray(payload.seatNumbers) ? payload.seatNumbers : [],
    userId: payload.userId || "",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    paidAt: null,
  };

  sessions.set(session.id, session);
  return toPublicSession(session);
};

export const getMockPaymentSession = (sessionId) => toPublicSession(getSessionOrThrow(sessionId));

export const confirmMockPaymentSession = (sessionId) => {
  const session = getSessionOrThrow(sessionId);

  if (session.status === "expired") {
    const error = new Error("Phiên thanh toán đã hết hạn.");
    error.status = 410;
    error.statusCode = 410;
    throw error;
  }

  if (session.status !== "paid") {
    session.status = "paid";
    session.paidAt = new Date().toISOString();
  }

  return toPublicSession(session);
};
