import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingHistory } from "../../services/movieService";
import { getMyProfile, normalizeAuthUser, updateMyProfile, updateStoredUser } from "../../services/authService";
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
  const [user, setUser] = useState(() => getSessionUser());
  const [recentBookings, setRecentBookings] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    birthday: "",
    avatar: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      birthday: user?.birthday || "",
      avatar: user?.avatar || "",
      password: "",
    });
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const profile = await getMyProfile();

        if (isMounted) {
          const normalizedUser = updateStoredUser(profile);
          setUser(normalizedUser);
        }
      } catch {}
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadRecentBookings = async () => {
      if (!user?.id && !user?.email) {
        return;
      }

      try {
        const history = await getBookingHistory({
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

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setSaveMessage("");
    setSaveError("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const updatedUser = await updateMyProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        avatar: formData.avatar,
        ...(formData.password ? { password: formData.password } : {}),
      });

      const normalizedUser = updateStoredUser(updatedUser);
      setUser(normalizedUser);
      setFormData((current) => ({
        ...current,
        password: "",
      }));
      setSaveMessage("Cập nhật hồ sơ thành công.");
    } catch (error) {
      setSaveError(error.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

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
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="profile-details">
              <label className="profile-field">
                <span>Họ và tên</span>
                <input
                  className="profile-input"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFieldChange}
                  placeholder="Nhập họ và tên"
                />
              </label>
              <label className="profile-field">
                <span>Email</span>
                <input className="profile-input" value={user.email || ""} disabled />
              </label>
              <label className="profile-field">
                <span>Số điện thoại</span>
                <input
                  className="profile-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFieldChange}
                  placeholder="Nhập số điện thoại"
                />
              </label>
              <label className="profile-field">
                <span>Giới tính</span>
                <select className="profile-input" name="gender" value={formData.gender} onChange={handleFieldChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>
              <label className="profile-field">
                <span>Ngày sinh</span>
                <input
                  className="profile-input"
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleFieldChange}
                />
              </label>
              <label className="profile-field">
                <span>Link avatar</span>
                <input
                  className="profile-input"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleFieldChange}
                  placeholder="https://..."
                />
              </label>
              <label className="profile-field profile-field--full">
                <span>Mật khẩu mới</span>
                <input
                  className="profile-input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFieldChange}
                  placeholder="Để trống nếu không đổi mật khẩu"
                />
              </label>
            </div>
            <div className="profile-form__footer">
              <p className="profile-note">Avatar hiện hỗ trợ cập nhật bằng đường dẫn ảnh.</p>
              <div className="profile-form__actions">
                {saveError ? <span className="profile-status profile-status--error">{saveError}</span> : null}
                {saveMessage ? <span className="profile-status profile-status--success">{saveMessage}</span> : null}
                <button type="submit" className="profile-primary" disabled={isSaving}>
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </form>
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
