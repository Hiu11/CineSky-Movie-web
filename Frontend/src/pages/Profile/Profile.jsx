import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingHistory } from "../../services/movieService";
import { normalizeAuthUser } from "../../services/authService";
import "./Profile.css";

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

export default function Profile() {
  const [user] = useState(() => getSessionUser());
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadRecentBookings = async () => {
      if (!user?.id && !user?.email) {
        return;
      }

      try {
        const history = await getBookingHistory({
          userId: user?.id || "",
          email: user?.email || "",
          limit: 4,
        });

        if (isMounted) {
          setRecentBookings(Array.isArray(history) ? history : []);
        }
      } catch {
        if (isMounted) {
          setRecentBookings([]);
        }
      }
    };

    loadRecentBookings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const profileStats = useMemo(
    () => [
      { label: "Bookings", value: recentBookings.length || 0 },
      {
        label: "Spent",
        value: `${recentBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0).toLocaleString("vi-VN")} VND`,
      },
      { label: "Preferred channel", value: user?.email ? "Email account" : "Guest profile" },
    ],
    [recentBookings, user?.email]
  );

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-empty-card">
          <span className="profile-kicker">Profile</span>
          <h1>Sign in to open your profile.</h1>
          <p>Your account info, recent bookings, and quick actions will appear here.</p>
          <div className="profile-actions">
            <Link to="/login" className="profile-primary">
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-identity">
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName || user.name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar profile-avatar--fallback">
              {(user.fullName || user.name || "U").trim().charAt(0).toUpperCase()}
            </div>
          )}

          <div className="profile-copy">
            <span className="profile-kicker">Profile</span>
            <h1>{user.fullName || user.name || "CineSky user"}</h1>
            <p>Manage your account overview, review recent bookings, and continue exploring movies.</p>
          </div>
        </div>

        <div className="profile-stats">
          {profileStats.map((item) => (
            <article key={item.label} className="profile-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <h2>Account details</h2>
          <div className="profile-details">
            <div>
              <span>Email</span>
              <strong>{user.email || "Not provided"}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{user.phone || "Not provided"}</strong>
            </div>
            <div>
              <span>Gender</span>
              <strong>{user.gender || "Not set"}</strong>
            </div>
            <div>
              <span>Birthday</span>
              <strong>{user.birthday || "Not set"}</strong>
            </div>
          </div>
        </article>

        <article className="profile-card">
          <h2>Quick actions</h2>
          <div className="profile-actions">
            <Link to="/history" className="profile-secondary">
              Booking history
            </Link>
            <Link to="/?tab=now" className="profile-secondary">
              Browse now showing
            </Link>
            <Link to="/feedback" className="profile-primary">
              Leave feedback
            </Link>
          </div>
        </article>
      </section>

      <section className="profile-card">
        <div className="profile-card__header">
          <h2>Recent bookings</h2>
          <Link to="/history" className="profile-inline-link">
            View full history
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="profile-bookings">
            {recentBookings.map((booking) => (
              <article key={booking.id} className="profile-booking">
                <div>
                  <strong>{booking.movieTitle || "Movie ticket"}</strong>
                  <span>{[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ")}</span>
                </div>
                <small>{(booking.seatNumbers || []).join(", ") || "No seats selected"}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="profile-muted">No bookings have been saved to this account yet.</p>
        )}
      </section>
    </main>
  );
}
