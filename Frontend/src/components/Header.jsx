import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

export default function Header({
  isLoggedIn,
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "now";
  const isMovieDetail = location.pathname.startsWith("/movie/");
  const movieDetailTab = isMovieDetail ? tabParam : null;

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
            value={searchQuery}
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
          <div
            className="user-nav-profile"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <span className="user-display-name">{user?.name}</span>
            <img
              src={user?.avatar}
              alt="User"
              className="avatar-frame-small"
              style={{ width: "35px", borderRadius: "50%" }}
            />
            <button onClick={onLogout} className="btn-action btn-violet">
              ĐĂNG XUẤT
            </button>
          </div>
        )}
      </div>

      <div className="movie-tabs-navigation">
        <Link
          to="/?tab=now"
          className={
            (location.pathname === "/" && tabParam === "now") || movieDetailTab === "now"
              ? "tab-btn active"
              : "tab-btn"
          }
        >
          PHIM ĐANG CHIẾU
        </Link>

        <Link
          to="/?tab=soon"
          className={
            (location.pathname === "/" && tabParam === "soon") || movieDetailTab === "soon"
              ? "tab-btn active"
              : "tab-btn"
          }
        >
          PHIM SẮP CHIẾU
        </Link>

        <NavLink
          to="/filter"
          className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}
        >
          LỌC PHIM
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}
        >
          GIỚI THIỆU
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}
        >
          GÓP Ý
        </NavLink>
      </div>
    </header>
  );
}


