export default function BookingHistoryPanel({ sessionUser, isHistoryLoading, bookingHistory, formatCurrency }) {
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  };

  const statusLabel = (status) => ({ cancelled: "Đã hủy", expired: "Quá hạn", used: "Đã sử dụng" }[status] || "Chưa sử dụng");
  const statusClass = (status) => "booking-page__history-status " + ({ cancelled: "booking-page__history-status--cancelled", expired: "booking-page__history-status--expired", used: "booking-page__history-status--used" }[status] || "booking-page__history-status--booked");

  return (
    <section className="booking-page__panel booking-page__panel--history">
      <div className="booking-page__panel-header booking-page__panel-header--split">
        <div>
          <span className="booking-page__eyebrow">Bước 6</span>
          <h2>Vé đã đặt gần đây</h2>
        </div>
        <p>Xem lại những giao dịch gần nhất trên tài khoản hiện tại để kiểm tra lịch sử đặt vé.</p>
      </div>
      {sessionUser?.id || sessionUser?.email ? (
        isHistoryLoading ? (
          <p className="booking-page__hint">Đang tải lịch sử đặt vé...</p>
        ) : bookingHistory.length > 0 ? (
          <div className="booking-page__history-list">
            {bookingHistory.map((booking) => (
              <article key={booking.id} className="booking-page__history-card">
                <div className="booking-page__history-head">
                  <div>
                    <strong>{booking.movieTitle || "Vé xem phim"}</strong>
                    <span>
                      {[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ")}
                      {formatDate(booking.createdAt) ? ` • Đặt lúc ${formatDate(booking.createdAt)}` : ""}
                    </span>
                  </div>
                  <span className={statusClass(booking.status)}>{statusLabel(booking.status)}</span>
                </div>
                <div className="booking-page__history-meta">
                  <span>{booking.cinemaName || "CineSky Nguyen Hue"}</span>
                  <span>{booking.roomName || "Chưa rõ phòng"}</span>
                  <span>{(booking.seatNumbers || []).join(", ") || "Chưa có ghế"}</span>
                  <span>{formatCurrency(booking.totalPrice)} VND</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="booking-page__hint">Bạn chưa có vé đã đặt nào trên tài khoản này.</p>
        )
      ) : (
        <p className="booking-page__hint">Đăng nhập để xem lại vé đã đặt và lịch sử giao dịch của bạn.</p>
      )}
    </section>
  );
}
