import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ isLoggedIn, user, onLogout, searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "now";
  const isMovieDetail = location.pathname.startsWith("/movie/");
  const movieDetailTab = isMovieDetail ? tabParam : null;
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <Link to="/" className="logo-link-clean">
          <img src="/assets/images/logo.svg" alt="CineSky" className="logo-image" />
        </Link>

        <form className="search-pill-modern" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm phim, rạp..."
            value={searchQuery ?? ""}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-pill-btn-inner">
            Tìm kiếm
          </button>
        </form>

        {!isLoggedIn ? (
          <div className="auth-btns-header">
            <Link to="/login" className="btn-action btn-gold">
              ĐĂNG NHẬP
            </Link>
            <Link to="/register" className="btn-action btn-violet">
              ĐĂNG KÝ
            </Link>
          </div>
        ) : (
          <div className="user-nav-profile">
            <span className="user-display-name">{user?.name}</span>
            {!avatarFailed && user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "User"}
                className="avatar-frame-small"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className="avatar-frame-small avatar-fallback" aria-label="User avatar">
                {userInitial}
              </div>
            )}
            <button onClick={onLogout} className="btn-action btn-violet">
              ĐĂNG XUẤT
            </button>
          </div>
        )}
      </div>

      <div className="movie-tabs-navigation">
        <Link
          to="/?tab=now"
          className={(location.pathname === "/" && tabParam === "now") || movieDetailTab === "now" ? "tab-btn active" : "tab-btn"}
        >
          PHIM ĐANG CHIẾU
        </Link>
        <Link
          to="/?tab=soon"
          className={(location.pathname === "/" && tabParam === "soon") || movieDetailTab === "soon" ? "tab-btn active" : "tab-btn"}
        >
          PHIM SẮP CHIẾU
        </Link>
        <NavLink to="/filter" className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}>
          LỌC PHIM
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}>
          GIỚI THIỆU
        </NavLink>
        <NavLink to="/feedback" className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}>
          GÓP Ý
        </NavLink>
      </div>
    </header>
  );
}
