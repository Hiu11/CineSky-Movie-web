import { Link, NavLink } from "react-router-dom"; 

export default function Header({ isLoggedIn, user, onLogout, setSearchQuery }) {
  return (
    <header className="main-header">

      <div className="header-top">

        <Link to="/" className="logo-link-clean">
          <h2 className="logo-text-cinestar">CINESTAR</h2>
        </Link>

        <div className="search-pill-modern">
          <input
            type="text"
            placeholder="Tìm phim, rạp..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-pill-btn-inner">Tìm kiếm</button>
        </div>

        {!isLoggedIn ? (
          <div className="auth-btns-header">
            <Link to="/login" className="btn-action btn-gold">ĐĂNG NHẬP</Link>
            <Link to="/register" className="btn-action btn-violet">ĐĂNG KÝ</Link>
          </div>
        ) : (
          <div className="user-nav-profile" style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span className="user-display-name">{user?.name}</span>
            <img
              src={user?.avatar}
              alt="User"
              className="avatar-frame-small"
              style={{width:"35px",borderRadius:"50%"}}
            />
            <button onClick={onLogout} className="btn-action btn-violet">
              ĐĂNG XUẤT
            </button>
          </div>
        )}

      </div>

      <nav className="header-bottom-nav">
        <ul>
          <li>Chọn rạp</li>
          <li>Lịch chiếu</li>
          <li>Khuyến mãi</li>
          <li>Tổ chức sự kiện</li>
          <li>Dịch vụ giải trí khác</li>
          <li><NavLink to="/about">Giới thiệu</NavLink></li>
          <li><NavLink to="/feedback">Góp ý</NavLink></li>
        </ul>
      </nav>

    </header>
  );
}
