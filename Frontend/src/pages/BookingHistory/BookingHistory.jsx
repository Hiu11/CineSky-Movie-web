import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingHistory } from "../../services/movieService";
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

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!user?.id && !user?.email) {
        return;
      }

      try {
        setIsLoading(true);
        const history = await getBookingHistory({
          limit: 20,
        });

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
    () => bookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
    [bookings]
  );

  if (!user) {
    return (
      <main className="history-page">
        <section className="history-empty-card">
          <span className="history-kicker">History</span>
          <h1>Sign in to view your booking history.</h1>
          <p>Your recent bookings, seats, and payment totals will appear here once you sign in.</p>
          <div className="history-actions">
            <Link to="/login" className="history-primary">
              Go to login
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
          <span className="history-kicker">Booking history</span>
          <h1>Recent bookings on your CineSky account.</h1>
          <p>Review your latest transactions, seat choices, and the movies you booked recently.</p>
        </div>

        <div className="history-stats">
          <div>
            <strong>{bookings.length}</strong>
            <span>Bookings</span>
          </div>
          <div>
            <strong>{totalSpent.toLocaleString("vi-VN")}</strong>
            <span>Total spent (VND)</span>
          </div>
        </div>
      </section>

      {isLoading ? <p className="history-loading">Loading booking history...</p> : null}

      {!isLoading && bookings.length === 0 ? (
        <section className="history-empty-card">
          <h2>No bookings yet.</h2>
          <p>Once you finish a booking flow, the ticket information will appear here.</p>
          <div className="history-actions">
            <Link to="/?tab=now" className="history-primary">
              Browse movies
            </Link>
          </div>
        </section>
      ) : null}

      {bookings.length > 0 ? (
        <section className="history-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="history-card">
              <div className="history-card__head">
                <div>
                  <strong>{booking.movieTitle || "Movie ticket"}</strong>
                  <span>{[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ") || "Showtime updating"}</span>
                  <small>{formatBookedAt(booking.createdAt) ? `Booked at ${formatBookedAt(booking.createdAt)}` : ""}</small>
                </div>
                <span
                  className={
                    "history-card__status " +
                    (booking.status === "cancelled"
                      ? "history-card__status--cancelled"
                      : "history-card__status--active")
                  }
                >
                  {booking.status === "cancelled" ? "Cancelled" : "Paid"}
                </span>
              </div>

              <div className="history-card__meta">
                <span>{booking.cinemaName || "CineSky"}</span>
                <span>{booking.roomName || "Hall updating"}</span>
                <span>{(booking.seatNumbers || []).join(", ") || "No seats"}</span>
                <span>{Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND</span>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

