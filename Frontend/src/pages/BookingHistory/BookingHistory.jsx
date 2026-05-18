import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getBookingHistory } from "../../services/movieService";
import { normalizeAuthUser } from "../../services/authService";
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

export default function BookingHistory() {
  const [user] = useState(() => getSessionUser());
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!user?.id && !user?.email) {
        return;
      }

      try {
        setIsLoading(true);
        const history = await getBookingHistory({ limit: 20 });

        if (isMounted) {
          setBookings(Array.isArray(history) ? history : []);
        }
      } catch {
        if (isMounted) {
          setBookings([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const totalSpent = useMemo(
    () =>
      bookings.reduce(
        (sum, booking) => (booking.status === "cancelled" ? sum : sum + Number(booking.totalPrice || 0)),
        0
      ),
    [bookings]
  );

  const handleCancelBooking = async (booking) => {
    if (!booking?.id || booking.status === "cancelled") {
      return;
    }

    if (!window.confirm("Bạn chắc chắn muốn hủy vé này? Ghế đã đặt sẽ được mở lại.")) {
      return;
    }

    try {
      setCancellingId(booking.id);
      const cancelledBooking = await cancelBooking(booking.id, {
        reason: "User cancelled from booking history",
      });

      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? { ...item, ...cancelledBooking } : item))
      );
    } catch (error) {
      window.alert(error.message || "Không thể hủy vé lúc này.");
    } finally {
      setCancellingId("");
    }
  };

  if (!user) {
    return (
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
    );
  }

  return (
    <main className="history-page">
      <section className="history-hero">
        <div>
          <span className="history-kicker">Lịch sử vé</span>
          <h1>Các vé đã đặt bằng tài khoản CineSky của bạn.</h1>
          <p>Kiểm tra lại phim, suất chiếu, ghế ngồi và số tiền đã thanh toán.</p>
        </div>

        <div className="history-stats">
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

            return (
              <article key={booking.id} className="history-card history-ticket">
                <div className="history-ticket__cutout history-ticket__cutout--top"></div>
                <div className="history-ticket__cutout history-ticket__cutout--bottom"></div>
                
                <div className="history-ticket__main">
                  <div className="history-ticket__header">
                    <strong>{booking.movieTitle || "Vé xem phim"}</strong>
                    <span>
                      {[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ") ||
                        "Suất chiếu đang cập nhật"}
                    </span>
                    <small>{bookedAt ? `Đặt lúc ${bookedAt}` : ""}</small>
                  </div>

                  <div className="history-ticket__meta">
                    <div className="history-ticket__meta-item">
                      <small>Rạp chiếu</small>
                      <span>{booking.cinemaName || "CineSky"}</span>
                    </div>
                    <div className="history-ticket__meta-item">
                      <small>Phòng</small>
                      <span>{booking.roomName || "Đang cập nhật"}</span>
                    </div>
                    <div className="history-ticket__meta-item">
                      <small>Ghế ngồi</small>
                      <span>{(booking.seatNumbers || []).join(", ") || "Chưa có ghế"}</span>
                    </div>
                    <div className="history-ticket__meta-item">
                      <small>Thanh toán</small>
                      <span className="history-ticket__price">{Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND</span>
                    </div>
                  </div>
                </div>

                <div className="history-ticket__divider"></div>

                <div className="history-ticket__stub">
                  <div className="history-ticket__barcode"></div>
                  
                  <span
                    className={
                      "history-ticket__status " +
                      (booking.status === "cancelled"
                        ? "history-ticket__status--cancelled"
                        : "history-ticket__status--active")
                    }
                  >
                    {booking.status === "cancelled" ? "Đã hủy" : "Đã thanh toán"}
                  </span>

                  {booking.status === "cancelled" ? null : (
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
    </main>
  );
}
