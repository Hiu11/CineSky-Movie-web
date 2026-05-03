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
          <span className="booking-success-kicker">Booking</span>
          <h1>No completed booking was found.</h1>
          <p>Please go back to the movie list and continue your booking flow from there.</p>
          <div className="booking-success-actions">
            <Link to="/?tab=now" className="booking-success-primary">
              Back to movies
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const metaRows = [
    { label: "Movie", value: receipt.movieTitle || "CineSky" },
    { label: "Cinema", value: receipt.cinemaName || "CineSky" },
    { label: "Room", value: receipt.roomName || "Updating" },
    { label: "Showtime", value: [receipt.displayDate, receipt.displayTime].filter(Boolean).join(" • ") || "Updating" },
    { label: "Seats", value: receipt.seatNumbers?.join(", ") || "Updating" },
    { label: "Payment", value: receipt.paymentLabel || "Card / bank" },
  ];

  return (
    <main className="booking-success-page">
      <section className="booking-success-card">
        <div className="booking-success-hero">
          <span className="booking-success-kicker">Booking Completed</span>
          <h1>Your CineSky ticket is ready.</h1>
          <p>
            The booking has been saved successfully. You can review it below, continue exploring movies,
            or open your booking history at any time.
          </p>
        </div>

        <div className="booking-success-grid">
          {metaRows.map((item) => (
            <article key={item.label} className="booking-success-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}

          <article className="booking-success-row booking-success-row--total">
            <span>Total paid</span>
            <strong>{Number(receipt.totalPrice || 0).toLocaleString("vi-VN")} VND</strong>
          </article>
        </div>

        <div className="booking-success-actions">
          <Link to="/history" className="booking-success-secondary">
            Open booking history
          </Link>
          <Link to="/profile" className="booking-success-secondary">
            View profile
          </Link>
          <Link to="/?tab=now" className="booking-success-primary">
            Continue browsing
          </Link>
        </div>
      </section>
    </main>
  );
}
