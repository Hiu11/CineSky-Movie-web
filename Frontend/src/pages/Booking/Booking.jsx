import { Link } from "react-router-dom";
import { useBookingFlow } from "./hooks/useBookingFlow";
import BookingHero from "./components/BookingHero";
import BookingProgress from "./components/BookingProgress";
import CinemaSelector from "./components/CinemaSelector";
import ShowtimeSelector from "./components/ShowtimeSelector";
import SeatMap from "./components/SeatMap";
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
          <span className="booking-page__eyebrow">Äang táº£i</span>
          <h2>Äang táº£i thĂ´ng tin Ä‘áº·t vĂ©...</h2>
          <p>Há»‡ thá»‘ng Ä‘ang chuáº©n bá»‹ dá»¯ liá»‡u phim, ráº¡p vĂ  suáº¥t chiáº¿u cho báº¡n.</p>
        </div>
      </div>
    );
  }

  if (!flow.movie) {
    return (
      <div className="booking-page booking-page--empty">
        <div className="booking-page__empty-card">
          <span className="booking-page__eyebrow">KhĂ´ng kháº£ dá»¥ng</span>
          <h2>{flow.errorMessage || "KhĂ´ng tĂ¬m tháº¥y phim"}</h2>
          <p>Vui lĂ²ng quay láº¡i danh sĂ¡ch phim Ä‘á»ƒ chá»n má»™t phim khĂ¡c hoáº·c thá»­ láº¡i sau.</p>
          <Link to="/?tab=now" className="booking-page__back-link">Quay láº¡i danh sĂ¡ch phim</Link>
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
            paymentQrDataUrl={flow.paymentQrDataUrl}
            isPaymentExpired={flow.isPaymentExpired}
            paymentCountdownLabel={flow.paymentCountdownLabel}
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
          finalTotal={flow.finalTotal}
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
