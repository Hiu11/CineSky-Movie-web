import net from "net";
import tls from "tls";

const sentMockEmails = [];

const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.EMAIL_FROM || process.env.SMTP_USER || "",
});

const readLine = (socket) =>
  new Promise((resolve, reject) => {
    let buffer = "";
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      if (/\r?\n/.test(buffer) && !/^\d{3}-/m.test(buffer.split(/\r?\n/).filter(Boolean).at(-1) || "")) {
        cleanup();
        resolve(buffer);
      }
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });

const sendCommand = async (socket, command, expectedPrefix = "") => {
  if (command) {
    socket.write(`${command}\r\n`);
  }
  const response = await readLine(socket);
  if (expectedPrefix && !response.startsWith(expectedPrefix)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
  return response;
};

const escapeMessage = (value = "") => String(value).replace(/\r?\n\./g, "\n..");

const sendSmtpEmail = async ({ to, subject, text }) => {
  const config = getSmtpConfig();

  if (!config.host || !config.user || !config.pass || !config.from) {
    return { sent: false, provider: "mock", reason: "SMTP is not configured" };
  }

  let socket = config.secure
    ? tls.connect(config.port, config.host, { servername: config.host })
    : net.connect(config.port, config.host);

  await sendCommand(socket, "", "220");
  await sendCommand(socket, `EHLO ${config.host}`, "250");

  if (!config.secure) {
    await sendCommand(socket, "STARTTLS", "220");
    socket = tls.connect({ socket, servername: config.host });
    await sendCommand(socket, `EHLO ${config.host}`, "250");
  }

  await sendCommand(socket, "AUTH LOGIN", "334");
  await sendCommand(socket, Buffer.from(config.user).toString("base64"), "334");
  await sendCommand(socket, Buffer.from(config.pass).toString("base64"), "235");
  await sendCommand(socket, `MAIL FROM:<${config.from}>`, "250");
  await sendCommand(socket, `RCPT TO:<${to}>`, "250");
  await sendCommand(socket, "DATA", "354");

  const message = [
    `From: CineSky <${config.from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    escapeMessage(text),
    ".",
  ].join("\r\n");

  socket.write(`${message}\r\n`);
  await sendCommand(socket, "", "250");
  await sendCommand(socket, "QUIT", "221").catch(() => {});
  socket.end();

  return { sent: true, provider: "smtp", to, subject };
};

export const sendBookingConfirmationEmail = async ({ to, booking, movie, showtime, discount = null }) => {
  if (!to) {
    return { sent: false, provider: "mock", reason: "Missing recipient" };
  }

  const subject = `CineSky - Xác nhận vé ${booking.ticketCode}`;
  const text = [
    "CineSky xác nhận đặt vé thành công.",
    "",
    `Phim: ${movie?.title || "CineSky"}`,
    `Suất: ${booking.screeningDateLabel || showtime?.displayDate || ""} ${showtime?.displayTime || ""}`.trim(),
    `Rạp: ${showtime?.cinemaName || "CineSky"}`,
    `Phòng: ${showtime?.roomName || ""}`,
    `Ghế: ${(booking.seatNumbers || []).join(", ")}`,
    discount?.code ? `Voucher: ${discount.code}` : "",
    `Tổng thanh toán: ${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND`,
    "",
    "Vui lòng đến rạp sớm 15 phút để check-in.",
  ].filter(Boolean).join("\n");

  const email = { to, subject, preview: text.split("\n").filter(Boolean), createdAt: new Date().toISOString() };

  try {
    const delivery = await sendSmtpEmail({ to, subject, text });
    if (delivery.sent) {
      return delivery;
    }

    sentMockEmails.unshift(email);
    console.info("[mock-email] Booking confirmation", email);
    return { ...delivery, sent: false, mode: "mock_only", to, subject };
  } catch (error) {
    sentMockEmails.unshift(email);
    console.warn("[mock-email] SMTP failed, stored mock email instead", error.message);
    return { sent: false, provider: "smtp", mode: "mock_only", reason: error.message, to, subject };
  }
};

export const getSentMockEmails = () => sentMockEmails.slice(0, 50);
