import net from "net";
import tls from "tls";

const sentMockEmails = [];

const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatList = (items = []) => items.filter(Boolean).join(", ");

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

const buildMimeBody = ({ text, html }) => {
  if (!html) {
    return [
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      escapeMessage(text),
    ].join("\r\n");
  }

  const boundary = `cinesky_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return [
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    escapeMessage(text),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    escapeMessage(html),
    "",
    `--${boundary}--`,
  ].join("\r\n");
};

const sendSmtpEmail = async ({ to, subject, text, html = "" }) => {
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
    buildMimeBody({ text, html }),
    ".",
  ].join("\r\n");

  socket.write(`${message}\r\n`);
  await sendCommand(socket, "", "250");
  await sendCommand(socket, "QUIT", "221").catch(() => {});
  socket.end();

  return { sent: true, provider: "smtp", to, subject };
};

const buildBookingConfirmationHtml = ({ booking, movie, showtime, discount = null }) => {
  const ticketCode = escapeHtml(booking.ticketCode || "");
  const movieTitle = escapeHtml(movie?.title || "CineSky");
  const displayDate = escapeHtml(booking.screeningDateLabel || showtime?.displayDate || "");
  const displayTime = escapeHtml(booking.displayTime || showtime?.displayTime || "");
  const cinemaName = escapeHtml(showtime?.cinemaName || "CineSky");
  const roomName = escapeHtml(showtime?.roomName || "");
  const seats = escapeHtml(formatList(booking.seatNumbers || []));
  const genres = escapeHtml(formatList(movie?.genres || []));
  const duration = Number(movie?.duration || 0) ? `${Number(movie.duration)} phút` : "";
  const totalPrice = escapeHtml(formatCurrency(booking.totalPrice));
  const subtotalPrice = escapeHtml(formatCurrency(booking.subtotalPrice || booking.totalPrice));
  const serviceFee = escapeHtml(formatCurrency(booking.serviceFee));
  const discountAmount = Number(booking.discountAmount || 0);
  const voucherCode = escapeHtml(discount?.code || booking.promoCode || "");
  const fnbItems = (booking.fnbItems || [])
    .filter((item) => Number(item.quantity || 0) > 0)
    .map((item) => `${escapeHtml(item.name || "Combo")} x${Number(item.quantity || 0)}`);

  const infoRows = [
    ["Ngày chiếu", displayDate || "Đang cập nhật"],
    ["Suất chiếu", displayTime || "Đang cập nhật"],
    ["Rạp", cinemaName],
    ["Phòng", roomName || "Đang cập nhật"],
    ["Ghế", seats || "Đang cập nhật"],
    ["Thể loại", genres || "CineSky"],
    duration ? ["Thời lượng", escapeHtml(duration)] : null,
    fnbItems.length ? ["Bắp nước", fnbItems.join("<br />")] : null,
    voucherCode ? ["Voucher", voucherCode] : null,
  ].filter(Boolean);

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CineSky - Xác nhận vé</title>
  </head>
  <body style="margin:0;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f8;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,35,75,0.14);">
            <tr>
              <td style="background:#0b1f3a;padding:24px 30px;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size:26px;font-weight:800;letter-spacing:0.5px;">CineSky</div>
                      <div style="margin-top:6px;color:#a9c7ff;font-size:13px;">Xem phim dễ dàng, giữ vé trong email</div>
                    </td>
                    <td align="right">
                      <span style="display:inline-block;background:#29c76f;color:#061424;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:700;">Đặt vé thành công</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:34px 30px 20px;text-align:center;">
                <div style="display:inline-block;width:76px;height:76px;border-radius:50%;background:#e9fff2;border:3px solid #29c76f;color:#29a85f;font-size:44px;line-height:76px;font-weight:700;">✓</div>
                <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.25;color:#172033;">Chúc mừng! Vé của bạn đã sẵn sàng</h1>
                <p style="margin:0 auto;color:#64748b;font-size:15px;line-height:1.6;max-width:560px;">CineSky đã xác nhận thanh toán cho <strong style="color:#172033;">${movieTitle}</strong>. Vui lòng đưa mã vé bên dưới cho nhân viên khi check-in.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dde7f3;border-radius:18px;overflow:hidden;">
                  <tr>
                    <td style="background:#f8fbff;padding:22px;">
                      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.8px;color:#2f7df6;font-weight:800;">Thông tin vé</div>
                      <div style="margin-top:8px;font-size:24px;line-height:1.3;color:#172033;font-weight:800;">${movieTitle}</div>
                    </td>
                    <td align="right" style="background:#f8fbff;padding:22px;">
                      <div style="display:inline-block;background:#ff6b35;color:#ffffff;border-radius:10px;padding:14px 18px;font-size:18px;font-weight:800;letter-spacing:0.8px;">${ticketCode}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:6px 22px 22px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        ${infoRows
                          .map(
                            ([label, value]) => `<tr>
                              <td style="padding:13px 0;border-bottom:1px solid #edf2f7;color:#64748b;font-size:13px;">${label}</td>
                              <td align="right" style="padding:13px 0;border-bottom:1px solid #edf2f7;color:#172033;font-size:14px;font-weight:700;">${value}</td>
                            </tr>`
                          )
                          .join("")}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111827;border-radius:18px;color:#ffffff;">
                  <tr>
                    <td style="padding:22px;">
                      <div style="font-size:13px;color:#a9b4c5;">Tạm tính</div>
                      <div style="margin-top:5px;font-size:16px;font-weight:700;">${subtotalPrice}</div>
                    </td>
                    <td style="padding:22px;">
                      <div style="font-size:13px;color:#a9b4c5;">Phí dịch vụ</div>
                      <div style="margin-top:5px;font-size:16px;font-weight:700;">${serviceFee}</div>
                    </td>
                    <td style="padding:22px;">
                      <div style="font-size:13px;color:#a9b4c5;">Giảm giá</div>
                      <div style="margin-top:5px;font-size:16px;font-weight:700;">${discountAmount ? `-${escapeHtml(formatCurrency(discountAmount))}` : "0 VND"}</div>
                    </td>
                    <td align="right" style="padding:22px;background:#ff6b35;border-radius:0 18px 18px 0;">
                      <div style="font-size:13px;color:#ffe8df;">Tổng thanh toán</div>
                      <div style="margin-top:5px;font-size:22px;font-weight:900;">${totalPrice}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 30px 34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;">
                  <tr>
                    <td style="padding:18px 20px;color:#9a3412;font-size:14px;line-height:1.6;">
                      <strong>Lưu ý:</strong> Bạn nên đến rạp sớm 15 phút để check-in. Vé đã thanh toán sẽ không hoàn/hủy trong môi trường demo CineSky.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="max-width:680px;margin:18px auto 0;color:#7b8798;font-size:12px;line-height:1.6;text-align:center;">
            Email này được gửi tự động từ CineSky. Nếu cần hỗ trợ, vui lòng phản hồi qua trang góp ý trong ứng dụng.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
    `Suất: ${booking.screeningDateLabel || showtime?.displayDate || ""} ${booking.displayTime || showtime?.displayTime || ""}`.trim(),
    `Rạp: ${showtime?.cinemaName || "CineSky"}`,
    `Phòng: ${showtime?.roomName || ""}`,
    `Ghế: ${(booking.seatNumbers || []).join(", ")}`,
    discount?.code ? `Voucher: ${discount.code}` : "",
    booking.fnbItems?.length ? `Bắp nước: ${(booking.fnbItems || []).map((item) => `${item.name} x${item.quantity}`).join(", ")}` : "",
    discount?.code || booking.promoCode ? `Voucher: ${discount?.code || booking.promoCode}` : "",
    `Tổng thanh toán: ${formatCurrency(booking.totalPrice)}`,
    "",
    "Vui lòng đến rạp sớm 15 phút để check-in.",
  ].filter(Boolean).join("\n");
  const html = buildBookingConfirmationHtml({ booking, movie, showtime, discount });

  const email = { to, subject, preview: text.split("\n").filter(Boolean), html, createdAt: new Date().toISOString() };

  try {
    const delivery = await sendSmtpEmail({ to, subject, text, html });
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

export const sendPasswordResetOtpEmail = async ({ to, otp, expiresInMinutes = 15 }) => {
  if (!to || !otp) {
    return { sent: false, provider: "mock", reason: "Missing recipient or OTP" };
  }

  const subject = "CineSky - Mã OTP đặt lại mật khẩu";
  const text = [
    "CineSky đã nhận yêu cầu đặt lại mật khẩu.",
    "",
    `Mã OTP của bạn là: ${otp}`,
    `Mã có hiệu lực trong ${expiresInMinutes} phút.`,
    "",
    "Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.",
  ].join("\n");
  const email = { to, subject, preview: text.split("\n").filter(Boolean), createdAt: new Date().toISOString() };

  try {
    const delivery = await sendSmtpEmail({ to, subject, text });
    if (delivery.sent) {
      return delivery;
    }

    sentMockEmails.unshift(email);
    console.info("[mock-email] Password reset OTP", email);
    return { ...delivery, sent: false, mode: "mock_only", to, subject };
  } catch (error) {
    sentMockEmails.unshift(email);
    console.warn("[mock-email] SMTP failed, stored password reset OTP instead", error.message);
    return { sent: false, provider: "smtp", mode: "mock_only", reason: error.message, to, subject };
  }
};

export const getSentMockEmails = () => sentMockEmails.slice(0, 50);
