export default function AdminCheckinView({
  handleCheckInTicket,
  handleLookupTicket,
  isTicketChecking,
  setTicketSearch,
  ticketLookup,
  ticketMessage,
  ticketSearch,
}) {
  return (
          <div className="admin-checkin-grid">
            <section className="admin-panel admin-checkin-card">
              <span>Ticket gate</span>
              <h2>Scan / nhập mã vé</h2>
              <form onSubmit={handleLookupTicket} className="admin-checkin-form">
                <input
                  value={ticketSearch}
                  onChange={(event) => setTicketSearch(event.target.value.toUpperCase())}
                  placeholder="VD: CSK01ABC234DE"
                />
                <button type="submit" disabled={isTicketChecking}>
                  {isTicketChecking ? "Đang kiểm tra..." : "Tra vé"}
                </button>
              </form>
              {ticketMessage ? <p className="admin-checkin-message">{ticketMessage}</p> : null}
            </section>

            <section className="admin-panel admin-checkin-result">
              {ticketLookup ? (
                <>
                  <div className="admin-checkin-result__head">
                    <div>
                      <span>{ticketLookup.ticketCode}</span>
                      <h2>{ticketLookup.movieTitle || "Vé xem phim"}</h2>
                    </div>
                    <strong className={`admin-checkin-status admin-checkin-status--${ticketLookup.status}`}>
                      {ticketLookup.status === "used" ? "Đã check-in" : ticketLookup.status === "cancelled" ? "Đã hủy" : "Hợp lệ"}
                    </strong>
                  </div>
                  <div className="admin-checkin-meta">
                    <div>
                      <small>Suất chiếu</small>
                      <strong>{[ticketLookup.displayDate, ticketLookup.displayTime].filter(Boolean).join(" • ") || "Chưa có lịch"}</strong>
                    </div>
                    <div>
                      <small>Phòng / ghế</small>
                      <strong>{ticketLookup.roomName || "Phòng chiếu"} • {(ticketLookup.seatNumbers || []).join(", ")}</strong>
                    </div>
                    <div>
                      <small>Khách hàng</small>
                      <strong>{ticketLookup.customerName || ticketLookup.customerEmail || "Guest"}</strong>
                    </div>
                    <div>
                      <small>Thanh toán</small>
                      <strong>{Number(ticketLookup.totalPrice || 0).toLocaleString("vi-VN")} VND • {ticketLookup.paymentProvider || ticketLookup.paymentMethod || "Mock payment"}</strong>
                    </div>
                  </div>
                  <button
                    className="admin-checkin-confirm"
                    type="button"
                    onClick={handleCheckInTicket}
                    disabled={isTicketChecking || ticketLookup.status === "cancelled" || ticketLookup.status === "used"}
                  >
                    {ticketLookup.status === "used" ? "Vé đã sử dụng" : "Xác nhận check-in"}
                  </button>
                </>
              ) : (
                <p className="admin-checkin-empty">Thông tin vé sẽ hiện ở đây sau khi tra mã.</p>
              )}
            </section>
          </div>
  );
}
