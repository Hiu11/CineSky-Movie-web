import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AdminParticles from "../../components/AdminParticles/AdminParticles";
import { getAdminBookings } from "../../services/movieService";
import AdminSidebar from "../AdminPage/components/AdminSidebar";
import { adminNavGroups } from "../AdminPage/utils/adminPageUtils";
import "../AdminPage/AdminPage.css";
import "./AdminShowtimeDetail.css";

const currency = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const dateTime = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const statusLabel = {
  booked: "Đã đặt",
  used: "Đã check-in",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
};

const getSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function AdminShowtimeDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getSessionUser();
  const movieId = searchParams.get("movieId") || "";
  const showtimeId = searchParams.get("showtimeId") || "";
  const screeningDate = searchParams.get("screeningDate") || "";

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAdminBookings({ movieId, showtimeId, screeningDate, limit: 1000 });
        if (isMounted) setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setError(err.message || "Không tải được dữ liệu suất chiếu.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBookings();
    return () => {
      isMounted = false;
    };
  }, [movieId, screeningDate, showtimeId]);

  const summary = useMemo(() => {
    const active = bookings.filter((item) => item.status !== "cancelled");
    const cancelled = bookings.filter((item) => item.status === "cancelled");
    const seats = active.reduce((sum, item) => sum + (item.seatNumbers || []).length, 0);
    const revenue = active.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    return { active, cancelled, seats, revenue };
  }, [bookings]);

  const firstBooking = bookings[0] || {};
  const title = firstBooking.movieTitle || "Chi tiết suất chiếu";
  const showtimeText = [
    firstBooking.displayDate || screeningDate || "Chưa rõ ngày",
    firstBooking.displayTime || "Chưa rõ giờ",
    firstBooking.roomName,
  ].filter(Boolean).join(" • ");

  if (user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const handleSwitchModule = (moduleKey) => {
    navigate(`/admin?module=${moduleKey}`);
  };

  return (
    <main className="admin-page admin-showtime-page">
      <AdminParticles />
      <AdminSidebar activeModule="orders" navGroups={adminNavGroups} onSwitchModule={handleSwitchModule} />

      <section className="admin-showtime-main">
        <section className="admin-showtime-hero">
          <Link className="admin-showtime-back" to="/admin?module=orders">Quay lại đơn vé</Link>
          <p>{firstBooking.cinemaName || "CineSky"}</p>
          <h1>{title}</h1>
          <span>{showtimeText}</span>
        </section>

        <section className="admin-showtime-stats">
          <article><strong>{bookings.length}</strong><span>Tổng đơn</span></article>
          <article><strong>{summary.active.length}</strong><span>Đơn còn hiệu lực</span></article>
          <article><strong>{summary.cancelled.length}</strong><span>Đơn đã hủy</span></article>
          <article><strong>{summary.seats}</strong><span>Ghế đã bán</span></article>
          <article><strong>{currency(summary.revenue)}</strong><span>Doanh thu hiệu lực</span></article>
        </section>

        <section className="admin-showtime-panel">
          <div className="admin-showtime-panel__head">
            <h2>Khách đặt và hủy vé</h2>
            <span>{isLoading ? "Đang tải..." : `${bookings.length} giao dịch`}</span>
          </div>

          {error ? <p className="admin-showtime-message">{error}</p> : null}
          {!isLoading && !error && bookings.length === 0 ? (
            <p className="admin-showtime-message">Chưa có khách đặt vé cho suất này.</p>
          ) : null}

          {bookings.length > 0 ? (
            <div className="admin-showtime-table-wrap">
              <table className="admin-showtime-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Mã vé</th>
                    <th>Ghế</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Thời điểm</th>
                    <th>Lý do hủy</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.customerName || "Khách vãng lai"}</strong>
                        <span>{booking.customerEmail || "Chưa có email"}</span>
                      </td>
                      <td>{booking.ticketCode}</td>
                      <td>{(booking.seatNumbers || []).join(", ") || "-"}</td>
                      <td>{currency(booking.totalPrice)}</td>
                      <td>
                        <mark className={`admin-showtime-status admin-showtime-status--${booking.status}`}>
                          {statusLabel[booking.status] || booking.status}
                        </mark>
                      </td>
                      <td>{booking.status === "cancelled" ? dateTime(booking.cancelledAt) : dateTime(booking.createdAt)}</td>
                      <td>{booking.status === "cancelled" ? booking.cancelReason || "Không ghi lý do" : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
