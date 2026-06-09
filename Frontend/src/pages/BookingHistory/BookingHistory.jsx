import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getBookingHistory } from "../../services/movieService";
import { normalizeAuthUser, updateStoredUser } from "../../services/authService";
import CinematicBackdrop from "../../components/CinematicBackdrop/CinematicBackdrop";
import "./BookingHistory.css";

const getSessionUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = sessionStorage.getItem("user");
    return rawUser ? normalizeAuthUser(JSON.parse(rawUser)) : null;
  } catch {
    return null;
  }
};

const formatBookedAt = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getMembershipTheme = (tier = "Member") =>
  ({
    Member: "member",
    Silver: "silver",
    Gold: "gold",
    Diamond: "diamond",
  }[tier] || "member");

const TicketBarcode = ({ value, label }) => {
  const svgRef = useRef(null);
  const rawValue = String(value || label || "CSKTICKET").toUpperCase();
  const safeValue =
    rawValue
      .replace(/[^\x20-\x7E]/g, "-")
      .replace(/[^A-Z0-9._:$/+%-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48) || "CSKTICKET";
  const displayValue = String(label || safeValue).toUpperCase();

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    try {
      JsBarcode(svgRef.current, safeValue, {
        format: "CODE128",
        displayValue: false,
        width: 1.35,
        height: 44,
        margin: 0,
        background: "transparent",
        lineColor: "#111827",
      });
    } catch {
      svgRef.current.innerHTML = "";
    }
  }, [safeValue]);

  return (
    <div className="history-ticket__barcode" aria-label={`Mã vạch vé ${displayValue}`}>
      <svg ref={svgRef} role="img" focusable="false"></svg>
      <span>{displayValue}</span>
    </div>
  );
};

const TicketQrCode = ({ value }) => {
  const canvasRef = useRef(null);
  const safeValue = String(value || "CSKTICKET").toUpperCase();

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    QRCode.toCanvas(canvasRef.current, safeValue, {
      width: 82,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#f8fafc",
      },
    }).catch(() => {});
  }, [safeValue]);

  return (
    <div className="history-ticket__qr" aria-label={`QR check-in vé ${safeValue}`}>
      <canvas ref={canvasRef} width="82" height="82"></canvas>
    </div>
  );
};

const printHistoryTicketPdf = (booking) => {
  const printWindow = window.open("", "_blank", "width=860,height=720");
  if (!printWindow) return;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CineSky Ticket ${booking.ticketCode || booking.id || ""}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111827; }
    .ticket { max-width: 720px; margin: 0 auto; border: 2px solid #111827; border-radius: 18px; padding: 28px; }
    .head { display: flex; justify-content: space-between; border-bottom: 1px dashed #9ca3af; padding-bottom: 16px; margin-bottom: 18px; }
    h1 { margin: 0; font-size: 30px; } h2 { margin: 8px 0 0; font-size: 24px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
    .item small { display: block; color: #6b7280; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
    .total { grid-column: 1 / -1; background: #fff7ed; border-color: #f59e0b; }
    @media print { body { padding: 0; } .ticket { border: 0; border-radius: 0; } }
  </style>
</head>
<body>
  <section class="ticket">
    <div class="head"><div><h1>CineSky E-Ticket</h1><h2>${booking.movieTitle || "CineSky"}</h2></div><strong>${booking.ticketCode || booking.id || ""}</strong></div>
    <div class="grid">
      <div class="item"><small>Rạp</small><strong>${booking.cinemaName || ""}</strong></div>
      <div class="item"><small>Phòng</small><strong>${booking.roomName || ""}</strong></div>
      <div class="item"><small>Suất chiếu</small><strong>${[booking.displayDate, booking.displayTime].filter(Boolean).join(" - ")}</strong></div>
      <div class="item"><small>Ghế</small><strong>${(booking.seatNumbers || []).join(", ")}</strong></div>
      <div class="item"><small>Trạng thái</small><strong>${booking.status || "booked"}</strong></div>
      <div class="item"><small>Voucher</small><strong>${booking.promoCode ? `${booking.promoCode} (-${Number(booking.discountAmount || 0).toLocaleString("vi-VN")} VND)` : "Không dùng"}</strong></div>
      <div class="item total"><small>Tổng thanh toán</small><strong>${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND</strong></div>
    </div>
  </section>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

export default function BookingHistory() {
  const [user] = useState(() => getSessionUser());
  const [bookings, setBookings] = useState([]);
  const [membership, setMembership] = useState(() => user?.membership || null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [pendingCancelBooking, setPendingCancelBooking] = useState(null);
  const [historyMessage, setHistoryMessage] = useState("");
  const [selectedExportBookingId, setSelectedExportBookingId] = useState("");

  const loadHistory = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id && !user?.email) {
      return;
    }

    try {
      if (!silent) {
        setIsLoading(true);
      }
      const history = await getBookingHistory({ limit: 20 });

      setBookings(Array.isArray(history?.bookings) ? history.bookings : []);
      setMembership(history?.membership || user?.membership || null);
    } catch {
      if (!silent) {
        setBookings([]);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!selectedExportBookingId && bookings.length > 0) {
      setSelectedExportBookingId(String(bookings[0].id));
    }
  }, [bookings, selectedExportBookingId]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        loadHistory({ silent: true });
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadHistory]);

  const totalSpent = useMemo(
    () => bookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
    [bookings]
  );
  const selectedExportBooking = useMemo(
    () => bookings.find((booking) => String(booking.id) === String(selectedExportBookingId)) || bookings[0] || null,
    [bookings, selectedExportBookingId]
  );
  const currentMembership =
    membership || { tier: "Member", points: 0, totalTickets: 0, nextTierPoints: 500, pointsToNextTier: 500 };
  const progressMax = Math.max(Number(currentMembership.nextTierPoints || 500), 1);
  const progressValue = Math.min(Math.round((Number(currentMembership.points || 0) / progressMax) * 100), 100);
  const memberName = user?.fullName || user?.name || user?.email || "CineSky Member";

  const handleCancelBooking = async (booking) => {
    if (!booking?.id || booking.status === "cancelled" || booking.status === "used" || booking.status === "expired") {
      return;
    }

    setPendingCancelBooking(booking);
  };

  const confirmCancelBooking = async () => {
    const booking = pendingCancelBooking;

    if (!booking?.id) {
      setPendingCancelBooking(null);
      return;
    }

    setPendingCancelBooking(null);
    try {
      setCancellingId(booking.id);
      const cancelledBooking = await cancelBooking(booking.id, {
        reason: "User cancelled from booking history",
      });

      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? { ...item, ...cancelledBooking } : item))
      );
      if (cancelledBooking.membership) {
        setMembership(cancelledBooking.membership);
        updateStoredUser({ ...(getSessionUser() || user), membership: cancelledBooking.membership });
      }
      setHistoryMessage("Đã hủy vé và mở lại ghế đã đặt. Vé đã thanh toán trước nên không hoàn tiền.");
    } catch (error) {
      setHistoryMessage(error.message || "Không thể hủy vé lúc này.");
    } finally {
      setCancellingId("");
    }
  };

  if (!user) {
    return (
      <>
        <CinematicBackdrop />
        <main className="history-page">
        <section className="history-empty-card">
          <span className="history-kicker">Lịch sử vé</span>
          <h1>Đăng nhập để xem lịch sử đặt vé.</h1>
          <p>Các giao dịch gần đây, ghế đã chọn và tổng thanh toán sẽ hiển thị tại đây.</p>
          <div className="history-actions">
            <Link to="/login" className="history-primary">
              Đăng nhập
            </Link>
          </div>
        </section>
      </main>
      </>
    );
  }

  return (
    <>
      <CinematicBackdrop />
      <main className="history-page">
      <section className="history-hero">
        <div>
          <span className="history-kicker">Lịch sử vé</span>
          <h1>Các vé đã đặt bằng tài khoản CineSky của bạn.</h1>
          <p>Kiểm tra lại phim, suất chiếu, ghế ngồi và số tiền đã thanh toán.</p>
        </div>

        <div className="history-stats">
          <div className={`history-membership history-membership--${getMembershipTheme(currentMembership.tier)}`}>
            <div className="history-membership__top">
              <span>CineSky</span>
              <small>{currentMembership.tier || "Member"}</small>
            </div>
            <span className="history-membership__name">{memberName}</span>
            <div className="history-membership__chip" aria-hidden="true"></div>
            <strong>{Number(currentMembership.points || 0).toLocaleString("vi-VN")} pts</strong>
            <small>{Number(currentMembership.totalTickets || 0)} vé đã tích lũy</small>
            <i><b style={{ width: `${progressValue}%` }}></b></i>
            <small>
              {currentMembership.pointsToNextTier > 0
                ? `Còn ${Number(currentMembership.pointsToNextTier).toLocaleString("vi-VN")} điểm để lên hạng tiếp theo`
                : "Bạn đang ở hạng cao nhất"}
            </small>
          </div>
          <div>
            <strong>{bookings.length}</strong>
            <span>Lượt đặt vé</span>
          </div>
          <div>
            <strong>{totalSpent.toLocaleString("vi-VN")}</strong>
            <span>Tổng chi tiêu (VND)</span>
          </div>
        </div>
      </section>

      {isLoading ? <p className="history-loading">Đang tải lịch sử đặt vé...</p> : null}
      {historyMessage ? <p className="history-inline-message">{historyMessage}</p> : null}

      {bookings.length > 0 ? (
        <section className="history-export-panel" aria-label="Xuất vé PDF">
          <div>
            <span className="history-kicker">Xuất vé PDF</span>
            <h2>Chọn vé cần xuất</h2>
          </div>
          <label>
            <span>Vé</span>
            <select value={selectedExportBookingId} onChange={(event) => setSelectedExportBookingId(event.target.value)}>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {(booking.ticketCode || booking.id)} - {booking.movieTitle || "Vé xem phim"} - {[booking.displayDate, booking.displayTime].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => selectedExportBooking && printHistoryTicketPdf(selectedExportBooking)}>
            Xuất PDF
          </button>
        </section>
      ) : null}

      {!isLoading && bookings.length === 0 ? (
        <section className="history-empty-card">
          <h2>Chưa có vé nào.</h2>
          <p>Khi bạn hoàn tất đặt vé, thông tin vé sẽ tự động xuất hiện tại đây.</p>
          <div className="history-actions">
            <Link to="/?tab=now" className="history-primary">
              Xem phim đang chiếu
            </Link>
          </div>
        </section>
      ) : null}

      {bookings.length > 0 ? (
        <section className="history-list">
          {bookings.map((booking) => {
            const bookedAt = formatBookedAt(booking.createdAt);
            const ticketCode = booking.ticketCode || String(booking.id || "").toUpperCase();
            const barcodeValue = ticketCode;
            const ticketStateClass =
              booking.status === "cancelled"
                ? "history-ticket--cancelled"
                : booking.status === "used"
                ? "history-ticket--used"
                : booking.status === "expired"
                ? "history-ticket--expired"
                : "history-ticket--active";

            return (
              <article key={booking.id} className={`history-card history-ticket ${ticketStateClass}`}>
                <div className="history-ticket__cutout history-ticket__cutout--top"></div>
                <div className="history-ticket__cutout history-ticket__cutout--bottom"></div>
                
                <div className="history-ticket__main">
                  <div className="history-ticket__pass-head">
                    <span>CineSky Pass</span>
                    <small>#{ticketCode}</small>
                  </div>
                  <div className="history-ticket__header">
                    <strong>{booking.movieTitle || "Vé xem phim"}</strong>
                    <span>
                      {[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ") ||
                        "Suất chiếu đang cập nhật"}
                    </span>
                    <small>{bookedAt ? `Đặt lúc ${bookedAt}` : ""}</small>
                  </div>

                  <div className="history-ticket__route">
                    <span>Booking confirmed</span>
                    <i></i>
                    <span>Enjoy your show</span>
                  </div>

                  <div className="history-ticket__meta">
                    <div className="history-ticket__meta-item">
                      <small>Rạp chiếu</small>
                      <span>{booking.cinemaName || "CineSky Nguyen Hue"}</span>
                    </div>
                    <div className="history-ticket__meta-item">
                      <small>Phòng</small>
                      <span>{booking.roomName || "Đang cập nhật"}</span>
                    </div>
                    <div className="history-ticket__meta-item">
                      <small>Ghế ngồi</small>
                      <span>{(booking.seatNumbers || []).join(", ") || "Chưa có ghế"}</span>
                    </div>
                    {booking.fnbItems?.length > 0 && (
                      <div className="history-ticket__meta-item">
                        <small>Bắp nước</small>
                        <span>{booking.fnbItems.map(i => `${i.quantity}x ${i.name}`).join(", ")}</span>
                      </div>
                    )}
                    <div className="history-ticket__meta-item">
                      <small>Thanh toán</small>
                      <span className="history-ticket__price">{Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND</span>
                    </div>
                  </div>
                </div>

                <div className="history-ticket__divider"></div>

                <div className="history-ticket__stub">
                  <span className="history-ticket__stub-label">E-Ticket</span>
                  <span className="history-ticket__stub-punch" aria-hidden="true"></span>
                  <TicketQrCode value={ticketCode} />
                  <TicketBarcode value={barcodeValue} label={ticketCode} />
                  
                  <span
                    className={
                      "history-ticket__status " +
                      (booking.status === "cancelled"
                        ? "history-ticket__status--cancelled"
                        : booking.status === "used"
                        ? "history-ticket__status--used"
                        : booking.status === "expired"
                        ? "history-ticket__status--expired"
                        : "history-ticket__status--active")
                    }
                  >
                    {booking.status === "cancelled"
                      ? "Đã hủy"
                      : booking.status === "used"
                      ? "Đã sử dụng"
                      : booking.status === "expired"
                      ? "Quá hạn"
                      : "Chưa sử dụng"}
                  </span>

                  {booking.status === "cancelled" || booking.status === "used" || booking.status === "expired" ? null : (
                    <div className="history-ticket__actions">
                      <button
                        type="button"
                        className="history-cancel-button"
                        onClick={() => handleCancelBooking(booking)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? "Đang hủy..." : "Hủy vé"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {pendingCancelBooking ? (
        <div className="history-confirm-backdrop" role="presentation" onClick={() => setPendingCancelBooking(null)}>
          <section className="history-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="history-confirm-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="history-confirm-title">Hủy vé</h2>
            <p>Bạn chắc chắn muốn hủy vé này? Ghế đã đặt sẽ được mở lại, nhưng vé đã thanh toán trước nên không hoàn tiền.</p>
            <div className="history-confirm-actions">
              <button type="button" onClick={() => setPendingCancelBooking(null)}>Giữ vé</button>
              <button type="button" onClick={confirmCancelBooking}>Hủy vé</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
    </>
  );
}
