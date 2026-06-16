import { Link } from "react-router-dom";
import { useBookingFlow } from "./hooks/useBookingFlow";
import BookingHero from "./components/BookingHero";
import BookingProgress from "./components/BookingProgress";
import CinemaSelector from "./components/CinemaSelector";
import ShowtimeSelector from "./components/ShowtimeSelector";
import SeatMap from "./components/SeatMap";
import FnBSelector from "./components/FnBSelector";
import PaymentPanel from "./components/PaymentPanel";
import BookingHistoryPanel from "./components/BookingHistoryPanel";
import BookingSummary from "./components/BookingSummary";
import "./Booking.css";

export default function Booking({ showToast }) {
  const flow = useBookingFlow({ showToast });

  if (flow.isLoading) {
    return (
      <div className="booking-page booking-page--empty">
        <div className="booking-page__empty-card">
          <span className="booking-page__eyebrow">Đang tải</span>
          <h2>Đang tải thông tin đặt vé...</h2>
          <p>Hệ thống đang chuẩn bị dữ liệu phim, rạp và suất chiếu cho bạn.</p>
        </div>
      </div>
    );
  }

  if (!flow.movie) {
    return (
      <div className="booking-page booking-page--empty">
        <div className="booking-page__empty-card">
          <span className="booking-page__eyebrow">Không khả dụng</span>
          <h2>{flow.errorMessage || "Không tìm thấy phim"}</h2>
          <p>Vui lòng quay lại danh sách phim để chọn một phim khác hoặc thử lại sau.</p>
          <Link to="/?tab=now" className="booking-page__back-link">Quay lại danh sách phim</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <BookingHero
        movie={flow.movie}
        cinemaOptions={flow.cinemaOptions}
        showtimes={flow.showtimes}
        selectedSeats={flow.selectedSeats}
      />

      <BookingProgress steps={flow.bookingStepStates} />

      <div className={"booking-page__layout" + (flow.isDesktopSummaryCollapsed ? " is-summary-collapsed" : "")}>
        <div className="booking-page__main">
          <CinemaSelector
            cinemaOptions={flow.cinemaOptions}
            selectedCinemaName={flow.selectedCinemaName}
            onCinemaChange={flow.handleCinemaChange}
          />

          <ShowtimeSelector
            availableDateOptions={flow.availableDateOptions}
            filteredShowtimes={flow.filteredShowtimes}
            selectedScreeningDate={flow.selectedScreeningDate}
            selectedShowtimeId={flow.selectedShowtimeId}
            selectedScreeningDateLabel={flow.selectedScreeningDateLabel}
            onDateChange={flow.handleScreeningDateChange}
            onShowtimeChange={flow.handleShowtimeChange}
          />

          <SeatMap
            selectedShowtime={flow.selectedShowtime}
            selectedSeats={flow.selectedSeats}
            bookedSeats={flow.bookedSeats}
            seatScale={flow.seatScale}
            setSeatScale={flow.setSeatScale}
            seatBaseSize={flow.seatBaseSize}
            selectedScreeningDateLabel={flow.selectedScreeningDateLabel}
            onToggleSeat={flow.toggleSeat}
            isDesktopViewport={flow.isDesktopViewport}
          />

          {flow.selectedSeats.length > 0 && (
            <FnBSelector
              selectedFnB={flow.selectedFnB}
              onUpdateFnB={flow.handleUpdateFnB}
              formatCurrency={flow.formatCurrency}
              isDesktopViewport={flow.isDesktopViewport}
            />
          )}

          <PaymentPanel
            selectedPaymentMethod={flow.selectedPaymentMethod}
            setSelectedPaymentMethod={flow.setSelectedPaymentMethod}
            selectedProvider={flow.selectedProvider}
            setSelectedProvider={flow.setSelectedProvider}
            providerSearch={flow.providerSearch}
            setProviderSearch={flow.setProviderSearch}
            visibleProviders={flow.visibleProviders}
            paymentForm={flow.paymentForm}
            onPaymentFieldChange={flow.handlePaymentFieldChange}
            useQrPayment={flow.useQrPayment}
            setUseQrPayment={flow.setUseQrPayment}
            isQrPaymentConfirmed={flow.isQrPaymentConfirmed}
            setIsQrPaymentConfirmed={flow.setIsQrPaymentConfirmed}
            paymentSession={flow.paymentSession}
            paymentSessionError={flow.paymentSessionError}
            paymentQrDataUrl={flow.paymentQrDataUrl}
            qrPaymentUrl={flow.qrPaymentUrl}
            isPaymentExpired={flow.isPaymentExpired}
            paymentCountdownLabel={flow.paymentCountdownLabel}
            voucherState={flow.voucherState}
            finalTotal={flow.finalTotal}
            formatCurrency={flow.formatCurrency}
          />

          <BookingHistoryPanel
            sessionUser={flow.sessionUser}
            isHistoryLoading={flow.isHistoryLoading}
            bookingHistory={flow.bookingHistory}
            formatCurrency={flow.formatCurrency}
          />
        </div>

        <BookingSummary
          movie={flow.movie}
          selectedShowtime={flow.selectedShowtime}
          selectedScreeningDateLabel={flow.selectedScreeningDateLabel}
          selectedSeats={flow.selectedSeats}
          selectedPaymentMethod={flow.selectedPaymentMethod}
          selectedProvider={flow.selectedProvider}
          ticketSubtotal={flow.ticketSubtotal}
          serviceFee={flow.serviceFee}
          fnbTotal={flow.fnbTotal}
          discountAmount={flow.discountAmount}
          selectedFnB={flow.selectedFnB}
          finalTotal={flow.finalTotal}
          seatLock={flow.seatLock}
          isAuthenticated={flow.isAuthenticated}
          isSubmitting={flow.isSubmitting}
          isPaymentExpired={flow.isPaymentExpired}
          isPaymentFormReady={flow.isPaymentFormReady}
          isComingSoon={flow.isComingSoon}
          submitMessage={flow.submitMessage}
          isDesktopViewport={flow.isDesktopViewport}
          isSummaryCollapsed={flow.isSummaryCollapsed}
          setIsSummaryCollapsed={flow.setIsSummaryCollapsed}
          onConfirm={flow.handleConfirmBooking}
          formatCurrency={flow.formatCurrency}
        />
      </div>
    </div>
  );
}
