import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingHistory, getMyFavorites } from "../../services/movieService";
import {
  getMyProfile,
  normalizeAuthUser,
  updateMyProfile,
  updateStoredUser,
  uploadMyAvatar,
} from "../../services/authService";
import MembershipCard3D from "../../components/MembershipCard3D/MembershipCard3D";
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
  const [favoriteMovies, setFavoriteMovies] = useState([]);
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
          limit: 20,
        });

        if (isMounted) {
          setRecentBookings(Array.isArray(history?.bookings) ? history.bookings : []);
          if (history?.membership) {
            const normalizedUser = updateStoredUser({ ...user, membership: history.membership });
            setUser(normalizedUser);
          }
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
  }, [user?.id, user?.email]);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      if (!user?.id && !user?.email) {
        return;
      }

      try {
        const favorites = await getMyFavorites({ limit: 8 });

        if (isMounted) {
          setFavoriteMovies(Array.isArray(favorites) ? favorites : []);
        }
      } catch {
        if (isMounted) {
          setFavoriteMovies([]);
        }
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const profileStats = useMemo(
    () => [
      { label: "Lượt đặt vé", value: recentBookings.length || 0 },
      { label: "Hạng thành viên", value: user?.membership?.tier || "Member" },
      { label: "Điểm tích lũy", value: Number(user?.membership?.points || 0).toLocaleString("vi-VN") },
      {
        label: "Đã chi tiêu",
        value: `${recentBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0).toLocaleString("vi-VN")} VND`,
      },
    ],
    [recentBookings, user?.membership]
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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSaveError("Vui lòng chọn file ảnh.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      setIsSaving(true);
      setSaveMessage("");
      setSaveError("");

      try {
        // Gửi file dạng data URL; backend lưu trực tiếp vào database.
        const updatedUser = await uploadMyAvatar({
          fileName: file.name,
          fileData: reader.result,
        });
        const normalizedUser = updateStoredUser(updatedUser);

        setUser(normalizedUser);
        setFormData((current) => ({
          ...current,
          avatar: normalizedUser.avatar,
        }));
        setSaveMessage("Tải ảnh đại diện thành công.");
      } catch (error) {
        setSaveError(error.message || "Không thể tải ảnh đại diện.");
      } finally {
        setIsSaving(false);
        event.target.value = "";
      }
    };

    reader.readAsDataURL(file);
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
          <span className="profile-kicker">Hồ sơ</span>
          <h1>Đăng nhập để mở hồ sơ của bạn.</h1>
          <p>Thông tin tài khoản, lịch sử đặt vé gần đây và thao tác nhanh sẽ hiển thị tại đây.</p>
          <div className="profile-actions">
            <Link to="/login" className="profile-primary">
              Đến trang đăng nhập
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
          <div className="profile-avatar-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName || user.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar--fallback">
                {(user.fullName || user.name || "U").trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-copy">
            <span className="profile-kicker">Hồ sơ</span>
            <h1>{user.fullName || user.name || "Người dùng CineSky"}</h1>
            <p>Quản lý thông tin tài khoản, xem lại các vé đã đặt và tiếp tục khám phá phim mới.</p>
          </div>
        </div>

        <div className="profile-membership-container">
          <MembershipCard3D user={user} recentBookings={recentBookings} />
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <h2>Thông tin tài khoản</h2>
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
                <span>Link ảnh đại diện</span>
                <input
                  className="profile-input"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleFieldChange}
                  placeholder="https://..."
                />
              </label>
              <label className="profile-field">
                <span>Tải ảnh đại diện</span>
                <span className="profile-file-picker">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isSaving}
                  />
                  <span className="profile-file-picker__button">Chọn ảnh</span>
                  <span className="profile-file-picker__text">PNG, JPG, WebP hoặc GIF</span>
                </span>
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
              <p className="profile-note">Ảnh đại diện có thể nhập bằng link hoặc tải file nhỏ hơn 2MB.</p>
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
          <h2>Thao tác nhanh</h2>
          <div className="profile-actions">
            <Link to="/history" className="profile-secondary">
              Lịch sử đặt vé
            </Link>
            <Link to="/?tab=now" className="profile-secondary">
              Xem phim đang chiếu
            </Link>
            <a href="#favorites" className="profile-secondary">
              Phim yêu thích
            </a>
            <Link to="/feedback" className="profile-primary">
              Gửi góp ý
            </Link>
          </div>
        </article>
      </section>

      <section className="profile-card" id="favorites">
        <div className="profile-card__header">
          <h2>Phim yêu thích</h2>
          <Link to="/filter" className="profile-inline-link">
            Khám phá thêm
          </Link>
        </div>

        {favoriteMovies.length > 0 ? (
          <div className="profile-favorites">
            {favoriteMovies.map((favorite) => {
              const favoriteTitle = favorite.movieTitle || favorite.movie?.title || "Phim yêu thích";
              const favoritePoster = favorite.moviePoster || favorite.movie?.poster;

              return (
              <Link key={favorite.id} to={`/movie/${favorite.movieId}`} className="profile-favorite">
                {favoritePoster ? (
                  <img src={favoritePoster} alt={favoriteTitle} className="profile-favorite-poster" />
                ) : (
                  <div className="profile-favorite-fallback-poster" />
                )}
                <div className="profile-favorite-info">
                  <strong>{favoriteTitle}</strong>
                  <span>Đã lưu vào danh sách yêu thích</span>
                </div>
              </Link>
              );
            })}
          </div>
        ) : (
          <p className="profile-muted">Bạn chưa lưu phim yêu thích nào. Bấm “Yêu thích” ở trang chi tiết phim để thêm vào đây.</p>
        )}
      </section>

      <section className="profile-card">
        <div className="profile-card__header">
          <h2>Vé đã đặt gần đây</h2>
          <Link to="/history" className="profile-inline-link">
            Xem toàn bộ lịch sử
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="profile-bookings">
            {recentBookings.slice(0, 4).map((booking) => (
              <article key={booking.id} className="profile-booking">
                <div className="profile-booking-main">
                  <strong>{booking.movieTitle || "Vé xem phim"}</strong>
                  <span>{[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ")}</span>
                </div>
                <div className="profile-booking-seats">
                  <small>{(booking.seatNumbers || []).join(", ") || "Chưa chọn ghế"}</small>
                  <div className="profile-booking-badge">Đã đặt</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="profile-muted">Tài khoản này chưa có vé nào được lưu.</p>
        )}
      </section>
    </main>
  );
}
