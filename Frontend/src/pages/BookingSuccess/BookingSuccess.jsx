import { Link, useLocation } from "react-router-dom";
import "./BookingSuccess.css";

const getStoredReceipt = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawReceipt = sessionStorage.getItem("lastBookingReceipt");
    return rawReceipt ? JSON.parse(rawReceipt) : null;
  } catch {
    return null;
  }
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
          <p>Có vẻ như bạn chưa đặt vé hoặc phiên giao dịch đã hết hạn. Vui lòng quay lại trang chủ để chọn phim.</p>
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
      {/* Background glowing effects */}
      <div className="booking-success__glow booking-success__glow--1"></div>
      <div className="booking-success__glow booking-success__glow--2"></div>

      <section className="booking-success-layout">
        <div className="booking-success-ticket__header">
          <span className="booking-success-kicker">Thành công</span>
          <h1>Vé của bạn đã sẵn sàng!</h1>
          <p>
            Cảm ơn bạn đã lựa chọn CineSky. Vé điện tử của bạn nằm bên phải. 
            Vui lòng xuất trình mã vạch này tại quầy để nhận vé cứng.
          </p>
          <div className="booking-success-actions">
            <Link to="/history" className="booking-success-secondary">
              Xem lịch sử vé
            </Link>
            <Link to="/?tab=now" className="booking-success-primary">
              Tiếp tục khám phá phim
            </Link>
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
              {receipt.fnbItems?.length > 0 && (
                <div className="booking-success-ticket__item">
                  <small>Bắp nước</small>
                  <strong>{receipt.fnbItems.map(i => `${i.quantity}x ${i.name}`).join(", ")}</strong>
                </div>
              )}
              <div className="booking-success-ticket__item">
                <small>Phương thức</small>
                <strong>{receipt.paymentLabel || "Card / bank"}</strong>
              </div>
              <div className="booking-success-ticket__item booking-success-ticket__item--total">
                <small>Tổng thanh toán</small>
                <strong>{Number(receipt.totalPrice || 0).toLocaleString("vi-VN")} VND</strong>
              </div>
            </div>
          </div>

          <div className="booking-success-ticket__divider"></div>

          <div className="booking-success-ticket__barcode-section">
            <div className="booking-success-ticket__barcode"></div>
            <span className="booking-success-ticket__id">{receipt.bookingId || "CINEMA-123456"}</span>
            <span className="booking-success-ticket__scan-hint">Quét mã vạch tại quầy</span>
          </div>
        </div>

        </section>
      </section>
    </main>
  );
}
