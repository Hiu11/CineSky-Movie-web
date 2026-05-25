export default function BookingHistoryPanel({ sessionUser, isHistoryLoading, bookingHistory, formatCurrency }) {
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  };

  const statusLabel = (status) => ({ cancelled: "ÄĂ£ há»§y", expired: "QuĂ¡ háº¡n", used: "ÄĂ£ sá»­ dá»¥ng" }[status] || "ChÆ°a sá»­ dá»¥ng");
  const statusClass = (status) => "booking-page__history-status " + ({ cancelled: "booking-page__history-status--cancelled", expired: "booking-page__history-status--expired", used: "booking-page__history-status--used" }[status] || "booking-page__history-status--booked");

  return (
    <section className="booking-page__panel booking-page__panel--history">
      <div className="booking-page__panel-header booking-page__panel-header--split">
        <div>
          <span className="booking-page__eyebrow">BÆ°á»›c 5</span>
          <h2>VĂ© Ä‘Ă£ Ä‘áº·t gáº§n Ä‘Ă¢y</h2>
        </div>
        <p>Xem láº¡i nhá»¯ng giao dá»‹ch gáº§n nháº¥t trĂªn tĂ i khoáº£n hiá»‡n táº¡i Ä‘á»ƒ kiá»ƒm tra lá»‹ch sá»­ Ä‘áº·t vĂ©.</p>
      </div>
      {sessionUser?.id || sessionUser?.email ? (
        isHistoryLoading ? (
          <p className="booking-page__hint">Äang táº£i lá»‹ch sá»­ Ä‘áº·t vĂ©...</p>
        ) : bookingHistory.length > 0 ? (
          <div className="booking-page__history-list">
            {bookingHistory.map((booking) => (
              <article key={booking.id} className="booking-page__history-card">
                <div className="booking-page__history-head">
                  <div>
                    <strong>{booking.movieTitle || "VĂ© xem phim"}</strong>
                    <span>
                      {[booking.displayDate, booking.displayTime].filter(Boolean).join(" â€¢ ")}
                      {formatDate(booking.createdAt) ? ` â€¢ Äáº·t lĂºc ${formatDate(booking.createdAt)}` : ""}
                    </span>
                  </div>
                  <span className={statusClass(booking.status)}>{statusLabel(booking.status)}</span>
                </div>
                <div className="booking-page__history-meta">
                  <span>{booking.cinemaName || "CineSky Nguyen Hue"}</span>
                  <span>{booking.roomName || "ChÆ°a rĂµ phĂ²ng"}</span>
                  <span>{(booking.seatNumbers || []).join(", ") || "ChÆ°a cĂ³ gháº¿"}</span>
                  <span>{formatCurrency(booking.totalPrice)} VND</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="booking-page__hint">Báº¡n chÆ°a cĂ³ vĂ© Ä‘Ă£ Ä‘áº·t nĂ o trĂªn tĂ i khoáº£n nĂ y.</p>
        )
      ) : (
        <p className="booking-page__hint">ÄÄƒng nháº­p Ä‘á»ƒ xem láº¡i vĂ© Ä‘Ă£ Ä‘áº·t vĂ  lá»‹ch sá»­ giao dá»‹ch cá»§a báº¡n.</p>
      )}
    </section>
  );
}
