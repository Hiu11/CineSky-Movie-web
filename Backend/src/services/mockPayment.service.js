import crypto from "crypto";
import mongoose from "mongoose";
import PaymentSessionModel from "../models/paymentSession.model.js";

const SESSION_TTL_MS = 15 * 60 * 1000;

const toPublicSession = (session) => ({
  id: session.sessionId || session.id,
  status: session.status,
  amount: session.amount,
  provider: session.provider,
  method: session.method,
  movieTitle: session.movieTitle,
  seatNumbers: session.seatNumbers,
  createdAt: session.createdAt?.toISOString?.() || session.createdAt,
  expiresAt: session.expiresAt?.toISOString?.() || session.expiresAt,
  paidAt: session.paidAt?.toISOString?.() || session.paidAt || null,
});

const markExpiredIfNeeded = async (session) => {
  if (session?.status === "pending" && Date.now() > new Date(session.expiresAt).getTime()) {
    session.status = "expired";
    await session.save();
  }
  return session;
};

const getSessionOrThrow = async (sessionId) => {
  const session = await markExpiredIfNeeded(
    await PaymentSessionModel.findOne({ sessionId: String(sessionId || "").trim() })
  );

  if (!session) {
    const error = new Error("Phiên thanh toán không tồn tại.");
    error.status = 404;
    error.statusCode = 404;
    throw error;
  }

  return session;
};

export const createMockPaymentSession = async (payload = {}) => {
  const amount = Number(payload.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Số tiền thanh toán không hợp lệ.");
    error.status = 400;
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const userId = mongoose.Types.ObjectId.isValid(payload.userId) ? payload.userId : null;
  const session = await PaymentSessionModel.create({
    sessionId: crypto.randomUUID(),
    status: "pending",
    amount,
    provider: String(payload.provider || "").trim() || "CineSky Pay",
    method: String(payload.method || "").trim() || "qr",
    movieId: payload.movieId || "",
    movieTitle: payload.movieTitle || "",
    showtimeId: payload.showtimeId || "",
    screeningDate: payload.screeningDate || "",
    seatNumbers: Array.isArray(payload.seatNumbers) ? payload.seatNumbers : [],
    userId,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    paidAt: null,
  });

  return toPublicSession(session);
};

export const getMockPaymentSession = async (sessionId) => toPublicSession(await getSessionOrThrow(sessionId));

export const confirmMockPaymentSession = async (sessionId) => {
  const session = await getSessionOrThrow(sessionId);

  if (session.status === "expired") {
    const error = new Error("Phiên thanh toán đã hết hạn.");
    error.status = 410;
    error.statusCode = 410;
    throw error;
  }

  if (session.status !== "paid") {
    session.status = "paid";
    session.paidAt = new Date();
    await session.save();
  }

  return toPublicSession(session);
};
