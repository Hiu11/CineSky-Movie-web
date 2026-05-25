import { LOCALIZED_PAYMENT_METHODS } from "../hooks/useBookingFlow";

export default function BookingSummary({
  movie, selectedShowtime, selectedScreeningDateLabel, selectedSeats,
  selectedPaymentMethod, selectedProvider,
  ticketSubtotal, serviceFee, finalTotal,
  isAuthenticated, isSubmitting, isPaymentExpired, isPaymentFormReady, isComingSoon,
  submitMessage, isDesktopViewport, isSummaryCollapsed, setIsSummaryCollapsed,
  onConfirm, formatCurrency,
}) {
  const paymentMethodLabel = LOCALIZED_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.label;

  return (
    <div className="booking-page__summary-shell">
      {isDesktopViewport ? (
        <button
          type="button"
          className="booking-page__summary-toggle"
          onClick={() => setIsSummaryCollapsed((v) => !v)}
          aria-label={isSummaryCollapsed ? "Hiện bảng xác nhận thanh toán" : "Ẩn bảng xác nhận thanh toán"}
          aria-pressed={isSummaryCollapsed}
        >
          {isSummaryCollapsed ? "<" : ">"}
        </button>
      ) : null}

      <div className="booking-page__summary-stack">
        <aside className="booking-page__summary">
          <div className="booking-page__summary-header">
            <span className="booking-page__eyebrow">Tóm tắt đơn vé</span>
            <h2>Xác nhận trước khi thanh toán</h2>
          </div>

          <div className="booking-page__summary-grid">
            <div className="booking-page__summary-row booking-page__summary-row--wide">
              <span>Phim</span>
              <strong>{movie.title}</strong>
            </div>
            <div className="booking-page__summary-row">
              <span>Rạp</span>
              <strong>{selectedShowtime?.cinemaName || "Chưa chọn"}</strong>
            </div>
            <div className="booking-page__summary-row">
              <span>Phòng</span>
              <strong>{selectedShowtime?.roomName || "Chưa chọn"}</strong>
            </div>
            <div className="booking-page__summary-row booking-page__summary-row--wide">
              <span>Lịch chiếu</span>
              <strong>
                {[selectedScreeningDateLabel || selectedShowtime?.displayDate, selectedShowtime?.displayTime]
                  .filter(Boolean).join(" • ") || "Chưa có lịch"}
              </strong>
            </div>
            <div className="booking-page__summary-row booking-page__summary-row--wide">
              <span>Ghế</span>
              <strong>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</strong>
            </div>
            <div className="booking-page__summary-row booking-page__summary-row--wide">
              <span>Thanh toán</span>
              <strong>{[paymentMethodLabel, selectedProvider].filter(Boolean).join(" • ")}</strong>
            </div>
            <div className="booking-page__summary-row">
              <span>Tiền vé</span>
              <strong>{formatCurrency(ticketSubtotal)} VND</strong>
            </div>
            <div className="booking-page__summary-row">
              <span>Phí dịch vụ</span>
              <strong>{formatCurrency(serviceFee)} VND</strong>
            </div>
            <div className="booking-page__summary-row booking-page__summary-row--total booking-page__summary-row--wide">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(finalTotal)} VND</strong>
            </div>
          </div>
        </aside>

        <div className="booking-page__summary-actions">
          <div className="booking-page__policy-note">
            <strong>Lưu ý thanh toán</strong>
            <p>
              Vé đã được thanh toán sẽ không hỗ trợ hoàn tiền hoặc đổi trả. Vui lòng
              kiểm tra kỹ rạp, suất chiếu và ghế trước khi xác nhận giao dịch.
            </p>
          </div>

          {isPaymentExpired && !submitMessage.message ? (
            <p className="booking-page__status booking-page__status--error">
              Hết thời gian giữ chỗ. Vui lòng chọn lại suất chiếu để đặt vé tiếp.
            </p>
          ) : null}

          {submitMessage.message ? (
            <p className={`booking-page__status booking-page__status--${submitMessage.type}`}>
              {submitMessage.message}
            </p>
          ) : null}

          {!isAuthenticated ? (
            <p className="booking-page__status booking-page__status--error">
              Vui lòng đăng nhập để hoàn tất đặt vé.
            </p>
          ) : null}

          <button
            disabled={selectedSeats.length === 0 || isComingSoon || !selectedShowtime || isSubmitting || isPaymentExpired || !isPaymentFormReady}
            onClick={onConfirm}
            className="booking-page__confirm"
          >
            {isSubmitting ? "Đang xử lý thanh toán..." : "Xác nhận đặt vé"}
          </button>
        </div>
      </div>
    </div>
  );
}
