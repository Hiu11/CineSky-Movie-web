import { Link, useLocation } from "react-router-dom";
import "./BookingSuccess.css";

const getStoredReceipt = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawReceipt = sessionStorage.getItem("lastBookingReceipt");
    return rawReceipt ? JSON.parse(rawReceipt) : null;
  } catch {
    return null;
  }
};

const buildTicketHtml = (receipt) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CineSky Ticket ${receipt.ticketCode || receipt.bookingId || ""}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111827; }
    .ticket { max-width: 720px; margin: 0 auto; border: 2px solid #111827; border-radius: 18px; padding: 28px; }
    .brand { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px dashed #9ca3af; padding-bottom: 16px; margin-bottom: 18px; }
    h1 { margin: 0; font-size: 30px; }
    h2 { margin: 8px 0 0; font-size: 24px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 20px; }
    .item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
    .item small { display: block; color: #6b7280; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
    .total { grid-column: 1 / -1; background: #fff7ed; border-color: #f59e0b; }
    .code { margin-top: 22px; padding-top: 18px; border-top: 1px dashed #9ca3af; text-align: center; font-family: monospace; letter-spacing: 0.18em; font-size: 18px; }
    @media print { body { padding: 0; } .ticket { border-radius: 0; border: 0; } }
  </style>
</head>
<body>
  <section class="ticket">
    <div class="brand">
      <div>
        <h1>CineSky E-Ticket</h1>
        <h2>${receipt.movieTitle || "CineSky"}</h2>
      </div>
      <strong>${receipt.ticketCode || receipt.bookingId || ""}</strong>
    </div>
    <div class="grid">
      <div class="item"><small>Rạp</small><strong>${receipt.cinemaName || ""}</strong></div>
      <div class="item"><small>Phòng</small><strong>${receipt.roomName || ""}</strong></div>
      <div class="item"><small>Suất chiếu</small><strong>${[receipt.displayDate, receipt.displayTime].filter(Boolean).join(" - ")}</strong></div>
      <div class="item"><small>Ghế</small><strong>${(receipt.seatNumbers || []).join(", ")}</strong></div>
      <div class="item"><small>Thanh toán</small><strong>${receipt.paymentLabel || ""}</strong></div>
      <div class="item"><small>Voucher</small><strong>${receipt.promoCode ? `${receipt.promoCode} (-${Number(receipt.discountAmount || 0).toLocaleString("vi-VN")} VND)` : "Không dùng"}</strong></div>
      <div class="item total"><small>Tổng thanh toán</small><strong>${Number(receipt.totalPrice || 0).toLocaleString("vi-VN")} VND</strong></div>
    </div>
    <div class="code">${receipt.ticketCode || receipt.bookingId || "CINESKY"}</div>
  </section>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

const printTicketPdf = (receipt) => {
  const printWindow = window.open("", "_blank", "width=860,height=720");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(buildTicketHtml(receipt));
  printWindow.document.close();
};

export default function BookingSuccess() {
  const location = useLocation();
  const receipt = location.state?.receipt || getStoredReceipt();

  if (!receipt) {
    return (
      <main className="booking-success-page">
        <section className="booking-success-card booking-success-card--empty">
          <span className="booking-success-kicker">Lỗi truy cập</span>
          <h1>Không tìm thấy thông tin đặt vé.</h1>
          <p>Vui lòng quay lại danh sách phim để chọn suất chiếu và đặt vé lại.</p>
          <div className="booking-success-actions">
            <Link to="/?tab=now" className="booking-success-primary">
              Quay lại danh sách phim
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-success-page">
      <div className="booking-success__glow booking-success__glow--1"></div>
      <div className="booking-success__glow booking-success__glow--2"></div>

      <section className="booking-success-layout">
        <div className="booking-success-ticket__header">
          <span className="booking-success-kicker">Thành công</span>
          <h1>Vé của bạn đã sẵn sàng!</h1>
          <p>
            Cảm ơn bạn đã lựa chọn CineSky. Vé điện tử đã được lưu vào lịch sử vé.
            {receipt.emailDelivery?.sent
              ? " Email xác nhận đã được gửi tới tài khoản của bạn."
              : " Email thật sẽ được gửi khi backend được cấu hình SMTP."}
          </p>
          <div className="booking-success-actions">
            <Link to="/history" className="booking-success-secondary">
              Xem lịch sử vé
            </Link>
            <Link to="/?tab=now" className="booking-success-primary">
              Tiếp tục khám phá phim
            </Link>
            <button type="button" className="booking-success-secondary" onClick={() => printTicketPdf(receipt)}>
              Xuất vé PDF
            </button>
          </div>
        </div>

        <section className="booking-success-ticket">
          <div className="booking-success-ticket__body">
            <div className="booking-success-ticket__cutout booking-success-ticket__cutout--left"></div>
            <div className="booking-success-ticket__cutout booking-success-ticket__cutout--right"></div>

            <div className="booking-success-ticket__content">
              <div className="booking-success-ticket__main-info">
                <small>Tên phim</small>
                <h2>{receipt.movieTitle || "CineSky"}</h2>
              </div>

              <div className="booking-success-ticket__grid">
                <div className="booking-success-ticket__item">
                  <small>Rạp chiếu</small>
                  <strong>{receipt.cinemaName || "CineSky Nguyen Hue"}</strong>
                </div>
                <div className="booking-success-ticket__item">
                  <small>Phòng chiếu</small>
                  <strong>{receipt.roomName || "Đang cập nhật"}</strong>
                </div>
                <div className="booking-success-ticket__item">
                  <small>Suất chiếu</small>
                  <strong>{[receipt.displayDate, receipt.displayTime].filter(Boolean).join(" • ") || "Đang cập nhật"}</strong>
                </div>
                <div className="booking-success-ticket__item">
                  <small>Ghế ngồi</small>
                  <strong>{receipt.seatNumbers?.join(", ") || "Đang cập nhật"}</strong>
                </div>
                {receipt.fnbItems?.length > 0 ? (
                  <div className="booking-success-ticket__item">
                    <small>Bắp nước</small>
                    <strong>{receipt.fnbItems.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</strong>
                  </div>
                ) : null}
                <div className="booking-success-ticket__item">
                  <small>Phương thức</small>
                  <strong>{receipt.paymentLabel || "Card / bank"}</strong>
                </div>
                {receipt.discountAmount > 0 ? (
                  <div className="booking-success-ticket__item">
                    <small>Giảm giá</small>
                    <strong>{receipt.promoCode || "Voucher"} -{Number(receipt.discountAmount || 0).toLocaleString("vi-VN")} VND</strong>
                  </div>
                ) : null}
                <div className="booking-success-ticket__item booking-success-ticket__item--total">
                  <small>Tổng thanh toán</small>
                  <strong>{Number(receipt.totalPrice || 0).toLocaleString("vi-VN")} VND</strong>
                </div>
              </div>
            </div>

            <div className="booking-success-ticket__divider"></div>

            <div className="booking-success-ticket__barcode-section">
              <div className="booking-success-ticket__barcode"></div>
              <span className="booking-success-ticket__id">{receipt.ticketCode || receipt.bookingId || "CINESKY"}</span>
              <span className="booking-success-ticket__scan-hint">Quét mã vạch tại quầy</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
