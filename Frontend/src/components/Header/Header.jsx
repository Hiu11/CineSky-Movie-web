import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getMovies } from "../../services/movieService";
import { getUnreadNotificationCount } from "../../services/notificationService";
import "./Header.css";

const RECENT_SEARCHES_KEY = "cineSkyRecentSearches";

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const navItems = [
  { to: "/", label: "Trang chủ", id: "home" },
  { to: "/?tab=now", label: "Phim đang chiếu", id: "now" },
  { to: "/?tab=soon", label: "Phim sắp chiếu", id: "soon" },
  { to: "/filter", label: "Lọc phim", id: "filter" },
  { to: "/promotions", label: "Ưu đãi", id: "promotions" },
  { to: "/news", label: "Tin tức", id: "news" },
  { to: "/about", label: "Giới thiệu", id: "about" },
  { to: "/feedback", label: "Góp ý", id: "feedback" },
];

const navIconPaths = {
  home: "M3.5 10.5 12 3l8.5 7.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6h-5.6v6H5a1.5 1.5 0 0 1-1.5-1.5z",
  now: "M8 5.5v13l11-6.5z",
  soon: "M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm0 3v5l3.3 2",
  filter: "M4 7h10M18 7h2M4 12h2M10 12h10M4 17h8M16 17h4M14 5v4M8 10v4M14 15v4",
  promotions: "M5 6.5V12l7 7 6.5-6.5-7-7H5zm4 2.5h.01",
  news: "M5 5.5h12a2 2 0 0 1 2 2v11H7a2 2 0 0 1-2-2zm3 4h8M8 13h8M8 16h5",
  about: "M12 10.5v6M12 7.5h.01M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z",
  feedback: "M5.5 6.5h13v9h-8l-5 4v-13zM8.5 10h7M8.5 13h4",
  admin: "M12 4.5 18.5 7v5.2c0 4-2.6 6.6-6.5 8.3-3.9-1.7-6.5-4.3-6.5-8.3V7z",
  profile: "M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 7c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5",
  history: "M5 12a7 7 0 1 0 2-4.9M5 5.5V10h4.5M12 8v4.5l3 1.8",
  favorite: "M12 4.8l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z",
  notification: "M7 17h10l-1.2-1.8V11a3.8 3.8 0 0 0-7.6 0v4.2zM10 19h4",
  logout: "M10 6H6.5A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18H10M14 8l4 4-4 4M18 12H9",
};

const NavIcon = ({ id }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={navIconPaths[id] || navIconPaths.home} />
  </svg>
);

const navGroups = [
  {
    id: "movies",
    label: "Phim",
    title: "Lịch phim CineSky",
    description: "Xem nhanh trang chủ, phim đang chiếu và phim sắp ra mắt.",
    spotlight: "Đặt vé nhanh theo suất chiếu hôm nay",
    items: navItems.filter((item) => ["home", "now", "soon"].includes(item.id)),
  },
  {
    id: "search",
    label: "Lọc phim",
    title: "Bộ lọc thông minh",
    description: "Thu hẹp danh sách phim theo thể loại, quốc gia và thời lượng.",
    spotlight: "Tìm đúng phim trước khi đặt vé",
    items: navItems.filter((item) => ["filter"].includes(item.id)),
  },
  {
    id: "promotions",
    label: "Ưu đãi",
    title: "Voucher & combo",
    description: "Các ưu đãi theo hạng thành viên và combo tiết kiệm.",
    spotlight: "Voucher thành viên Silver, Gold, Diamond",
    items: navItems.filter((item) => ["promotions"].includes(item.id)),
  },
  {
    id: "news",
    label: "Tin tức",
    title: "Góc điện ảnh",
    description: "Tin phim mới, review nhanh, hậu trường và thông tin CineSky.",
    spotlight: "Cập nhật phim sắp ra mắt mỗi tuần",
    items: navItems.filter((item) => ["news", "about"].includes(item.id)),
  },
  {
    id: "support",
    label: "Hỗ trợ",
    title: "Kết nối với CineSky",
    description: "Gửi góp ý để cải thiện trải nghiệm đặt vé và xem phim.",
    spotlight: "Phản hồi của bạn sẽ được admin xử lý",
    items: navItems.filter((item) => ["feedback"].includes(item.id)),
  },
];

const readRecentSearches = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(RECENT_SEARCHES_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
};

const persistRecentSearches = (items) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
};

export default function Header({
  isLoggedIn,
  user,
  onLogout,
  showToast,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchWrapperRef = useRef(null);
  const userMenuRef = useRef(null);
  const transitionPlayerRef = useRef(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [catalogMovies, setCatalogMovies] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const searchParams = new URLSearchParams(location.search);
  const hasMovieTab = searchParams.has("tab");
  const tabParam = searchParams.get("tab") || "now";
  const isMovieDetail = location.pathname.startsWith("/movie/");
  const isAdminPage = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const isAdminUser = user?.role === "admin";
  const visibleNavItems = isAdminUser
    ? [...navItems, { to: "/admin", label: "Quản trị", id: "admin" }]
    : navItems;
  const visibleNavGroups = isAdminUser
    ? [
        ...navGroups,
        {
          id: "admin",
          label: "Admin",
          title: "Khu quản trị",
          description: "Theo dõi và vận hành dữ liệu CineSky.",
          spotlight: "Dashboard, phim, booking và users",
          items: [{ to: "/admin", label: "Quản trị", id: "admin" }],
        },
      ]
    : navGroups;
  const movieDetailTab = isMovieDetail ? searchParams.get("tab") || "now" : null;
  const normalizedQuery = normalizeText(searchQuery).trim();
  const displayName = user?.name || user?.fullName || "User";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "U";
  const membershipLabel =
    typeof user?.membership === "string"
      ? user.membership
      : user?.membership?.tier || user?.membershipTier || "Member CineSky";

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

  useEffect(() => {
    let isMounted = true;

    const loadNotificationCount = async () => {
      if (!isLoggedIn || !user?.id) {
        setNotificationCount(0);
        return;
      }

      try {
        const payload = await getUnreadNotificationCount();

        if (isMounted) {
          setNotificationCount(Number(payload?.unreadCount || 0));
        }
      } catch {
        if (isMounted) {
          setNotificationCount(0);
        }
      }
    };

    loadNotificationCount();
    const refreshTimer = window.setInterval(loadNotificationCount, 30000);
    window.addEventListener("notifications:updated", loadNotificationCount);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("notifications:updated", loadNotificationCount);
    };
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        const movies = await getMovies();

        if (isMounted) {
          setCatalogMovies(Array.isArray(movies) ? movies : []);
        }
      } catch {
        if (isMounted) {
          setCatalogMovies([]);
        }
      }
    };

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setActiveSuggestionIndex(-1);
    setTransitionTarget(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (document.querySelector("script[data-lottie-player]")) {
      return undefined;
    }

    const script = document.createElement("script");

    script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    script.async = true;
    script.dataset.lottiePlayer = "true";
    document.body.appendChild(script);

    return undefined;
  }, []);

  useEffect(() => {
    if (!transitionTarget) {
      return undefined;
    }

    let navigateTimer = 0;
    document.body.classList.add("is-page-transitioning");

    const playTransition = () => {
      const player = transitionPlayerRef.current;

      if (player?.play) {
        player.loop = false;
        player.autoplay = true;
        player.play();
      }
    };

    if (window.customElements?.whenDefined) {
      window.customElements.whenDefined("lottie-player").then(playTransition);
    }

    playTransition();
    navigateTimer = window.setTimeout(() => navigate(transitionTarget), 2200);

    return () => {
      document.body.classList.remove("is-page-transitioning");
      window.clearTimeout(navigateTimer);
    };
  }, [navigate, transitionTarget]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchWrapperRef.current?.contains(event.target)) {
        setIsSearchOpen(false);
        setActiveSuggestionIndex(-1);
      }

      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const suggestionMovies = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return catalogMovies
      .filter((movie) => {
        const haystack = [
          movie.title,
          movie.genre,
          ...(movie.genres || []),
          movie.country,
          movie.director,
        ]
          .filter(Boolean)
          .map((item) => normalizeText(item))
          .join(" ");

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [catalogMovies, normalizedQuery]);

  const isRecentVisible = isSearchOpen && normalizedQuery.length < 2 && recentSearches.length > 0;
  const isSuggestionVisible = isSearchOpen && (normalizedQuery.length >= 2 || isRecentVisible);

  const saveRecentQuery = (query) => {
    const normalizedValue = query.trim();

    if (!normalizedValue) {
      return;
    }

    setRecentSearches((currentItems) => {
      const nextItems = [normalizedValue, ...currentItems.filter((item) => item !== normalizedValue)].slice(0, 6);
      persistRecentSearches(nextItems);
      return nextItems;
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearchOpen(true);
      return;
    }

    saveRecentQuery(searchQuery);
    setIsSearchOpen(false);
    setActiveSuggestionIndex(-1);
    navigate("/");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (movie) => {
    saveRecentQuery(movie.title);
    setIsSearchOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(`/movie/${movie.id}?tab=${movie.status === "coming-soon" ? "soon" : "now"}`);
  };

  const handleRecentSearchClick = (value) => {
    setSearchQuery(value);
    saveRecentQuery(value);
    setIsSearchOpen(false);
    navigate("/");
  };

  const handleSearchInputKeyDown = (event) => {
    if (!isSuggestionVisible || suggestionMovies.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) => (currentIndex + 1) % suggestionMovies.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex <= 0 ? suggestionMovies.length - 1 : currentIndex - 1
      );
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      handleSuggestionClick(suggestionMovies[activeSuggestionIndex]);
    }
  };

  const handleLogoutClick = () => {
    setIsSearchOpen(false);
    setActiveSuggestionIndex(-1);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    onLogout?.();
    window.location.replace("/");
  };

  const handleNavTransition = (event, to) => {
    const currentPath = `${location.pathname}${location.search}`;

    if (to === currentPath || transitionTarget) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setTransitionTarget(to);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    persistRecentSearches([]);
    showToast?.({
      type: "info",
      title: "Đã xóa lịch sử tìm kiếm",
      message: "Các từ khóa tìm gần đây đã được xóa khỏi trình duyệt này.",
    });
  };

  const getNavItemActive = (item) => {
    if (item.id === "home") {
      return location.pathname === "/" && !hasMovieTab;
    }

    if (item.id === "now") {
      return ((location.pathname === "/" && hasMovieTab && tabParam === "now") || movieDetailTab === "now");
    }

    if (item.id === "soon") {
      return ((location.pathname === "/" && hasMovieTab && tabParam === "soon") || movieDetailTab === "soon");
    }

    if (item.id === "admin") {
      return isAdminPage;
    }

    return location.pathname === item.to;
  };

  const renderSearchPanel = () => {
    if (!isSuggestionVisible) {
      return null;
    }

    return (
      <div className="search-suggestions" role="listbox" aria-label="Gợi ý tìm kiếm">
        <div className="search-suggestions__header">
          <span>{normalizedQuery.length >= 2 ? "Gợi ý nhanh" : "Tìm gần đây"}</span>
          <strong>
            {normalizedQuery.length >= 2 ? `${suggestionMovies.length} kết quả` : `${recentSearches.length} mục`}
          </strong>
        </div>

        {normalizedQuery.length >= 2 ? (
          suggestionMovies.length > 0 ? (
            suggestionMovies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                className={"search-suggestion" + (index === activeSuggestionIndex ? " is-active" : "")}
                onClick={() => handleSuggestionClick(movie)}
              >
                <span
                  className={
                    "search-suggestion__status " +
                    (movie.status === "coming-soon"
                      ? "search-suggestion__status--soon"
                      : "search-suggestion__status--now")
                  }
                >
                  {movie.status === "coming-soon" ? "Sắp chiếu" : "Đang chiếu"}
                </span>
                <span className="search-suggestion__content">
                  <strong>{movie.title}</strong>
                  <small>{[movie.genre, `${movie.duration} phút`, movie.country].filter(Boolean).join(" • ")}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="search-suggestions__empty">
              Chưa có phim phù hợp với từ khóa này. Thử tên phim, thể loại hoặc quốc gia khác nhé.
            </div>
          )
        ) : (
          <div className="search-suggestions__recent">
            <div className="search-suggestions__section">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="search-recent-chip"
                  onClick={() => handleRecentSearchClick(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <button type="button" className="search-clear-history" onClick={clearRecentSearches}>
              Xóa lịch sử tìm kiếm
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAuthDesktop = () => {
    if (!isLoggedIn) {
      return (
        <div className="auth-btns-header">
          <Link to="/login" className="btn-action btn-gold">
            Đăng nhập
          </Link>
          <Link to="/register" className="btn-action btn-violet">
            Đăng ký
          </Link>
        </div>
      );
    }

    return (
      <div className="user-menu" ref={userMenuRef}>
        <button
          type="button"
          className="user-menu__trigger"
          onClick={() => setIsUserMenuOpen((current) => !current)}
          aria-expanded={isUserMenuOpen}
        >
          <span className="user-display-name">{displayName}</span>
          {!avatarFailed && user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="avatar-frame-small"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div className="avatar-frame-small avatar-fallback" aria-label="Ảnh đại diện người dùng">
              {userInitial}
            </div>
          )}
          {notificationCount > 0 ? (
            <span className="user-menu__badge">{notificationCount > 99 ? "99+" : notificationCount}</span>
          ) : null}
        </button>

        {isUserMenuOpen ? (
          <div className="user-menu__panel">
            <div className="user-menu__profile-card">
              {!avatarFailed && user?.avatar ? (
                <img src={user.avatar} alt={displayName} />
              ) : (
                <div className="user-menu__profile-avatar">{userInitial}</div>
              )}
              <div>
                <strong>{displayName}</strong>
                <span>{isAdminUser ? "Admin CineSky" : membershipLabel}</span>
              </div>
            </div>

            <div className="user-menu__section">
              <Link to="/profile" className="user-menu__item">
                <span className="user-menu__icon"><NavIcon id="profile" /></span>
                Hồ sơ cá nhân
              </Link>
              <Link to="/history" className="user-menu__item">
                <span className="user-menu__icon"><NavIcon id="history" /></span>
                Lịch sử đặt vé
              </Link>
              <Link to="/profile#favorites" className="user-menu__item">
                <span className="user-menu__icon"><NavIcon id="favorite" /></span>
                Phim yêu thích
              </Link>
            </div>

            <div className="user-menu__section">
              <Link to="/feedback" className="user-menu__item">
                <span className="user-menu__icon"><NavIcon id="feedback" /></span>
                Gửi góp ý
              </Link>
              <Link to="/notifications" className="user-menu__item user-menu__item--notify">
                <span><span className="user-menu__icon"><NavIcon id="notification" /></span>Thông báo</span>
                {notificationCount > 0 ? <strong>{notificationCount > 99 ? "99+" : notificationCount}</strong> : null}
              </Link>
            </div>
            <button type="button" className="user-menu__item user-menu__item--danger" onClick={handleLogoutClick}>
              <span className="user-menu__icon"><NavIcon id="logout" /></span>
              Đăng xuất
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <Link to="/" className="logo-link-clean">
          <img src="/assets/images/logo.svg" alt="CineSky" className="logo-image" />
        </Link>

        <div className="search-shell" ref={searchWrapperRef}>
          <form
            className={"search-pill-modern" + (isSuggestionVisible ? " is-open" : "")}
            onSubmit={handleSearchSubmit}
          >
            <div className="search-pill-modern__field">
              <input
                type="text"
                placeholder="Tìm phim, rạp, thể loại..."
                value={searchQuery ?? ""}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setIsSearchOpen(true);
                  setActiveSuggestionIndex(-1);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchInputKeyDown}
                aria-label="Tìm phim hoặc rạp"
              />

              {searchQuery ? (
                <button
                  type="button"
                  className="search-pill-clear"
                  onClick={handleClearSearch}
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  ×
                </button>
              ) : null}
            </div>

            <button type="submit" className="search-pill-btn-inner">
              Tìm kiếm
            </button>
          </form>

          {renderSearchPanel()}
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu điều hướng"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {renderAuthDesktop()}
        </div>
      </div>

      <div className="movie-tabs-navigation">
        {visibleNavGroups.map((group) => {
          const isGroupActive = group.items.some(getNavItemActive);
          const singleItem = group.items[0];

          return group.items.length === 1 ? (
            <Link
              key={group.id}
              to={singleItem.to}
              className={(isGroupActive ? "tab-btn nav-direct active" : "tab-btn nav-direct") + (singleItem.id === "admin" ? " tab-btn--admin" : "")}
              onClick={(event) => handleNavTransition(event, singleItem.to)}
            >
              {group.label}
            </Link>
          ) : (
            <div key={group.id} className={"nav-dropdown" + (isGroupActive ? " active" : "")}>
              <button type="button" className="tab-btn nav-dropdown__trigger">
                {group.label}
                <span className="nav-dropdown__chevron" aria-hidden="true"></span>
              </button>
              <div className="nav-dropdown__panel">
                <div className="nav-dropdown__content">
                  <div className="nav-dropdown__items">
                    {group.items.map((item) => {
                      const isActive = getNavItemActive(item);
                      const itemContent = (
                        <>
                          <span className="nav-dropdown__icon">
                            <NavIcon id={item.id} />
                          </span>
                          <span>
                            <strong>{item.label}</strong>
                          </span>
                        </>
                      );

                      return item.id === "home" || item.to.startsWith("/?") ? (
                        <Link
                          key={item.id}
                          to={item.to}
                          className={(isActive ? "nav-dropdown__item active" : "nav-dropdown__item") + (item.id === "admin" ? " nav-dropdown__item--admin" : "")}
                          onClick={(event) => handleNavTransition(event, item.to)}
                        >
                          {itemContent}
                        </Link>
                      ) : (
                        <NavLink
                          key={item.id}
                          to={item.to}
                          className={({ isActive: routeActive }) =>
                            (routeActive || isActive ? "nav-dropdown__item active" : "nav-dropdown__item") +
                            (item.id === "admin" ? " nav-dropdown__item--admin" : "")
                          }
                          onClick={(event) => handleNavTransition(event, item.to)}
                        >
                          {itemContent}
                        </NavLink>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isMobileMenuOpen ? (
        <>
          <button
            type="button"
            className="mobile-backdrop"
            aria-label="Đóng menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="mobile-drawer">
            <div className="mobile-drawer__header">
              <strong>CineSky</strong>
              <button
                type="button"
                className="mobile-drawer__close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
              >
                ×
              </button>
            </div>

            <nav className="mobile-nav">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className={"mobile-nav__link" + (item.id === "admin" ? " mobile-nav__link--admin" : "")}
                  onClick={(event) => handleNavTransition(event, item.to)}
                >
                  <span className="mobile-link-icon" aria-hidden="true">
                    <NavIcon id={item.id} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mobile-drawer__footer">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="mobile-auth-link">
                    Hồ sơ
                  </Link>
                  <Link to="/history" className="mobile-auth-link">
                    Lịch sử đặt vé
                  </Link>
                  <Link to="/profile#favorites" className="mobile-auth-link">
                    Phim yêu thích
                  </Link>
                  {isAdminUser ? <Link to="/admin" className="mobile-auth-link">Quản trị</Link> : null}
                  <button
                    type="button"
                    className="mobile-auth-link mobile-auth-link--danger"
                    onClick={handleLogoutClick}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-auth-link mobile-auth-link--gold">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="mobile-auth-link mobile-auth-link--primary">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      ) : null}

      {transitionTarget ? (
        <div className="header-page-transition" aria-hidden="true">
          <div className="header-page-transition__stage">
            <div className="header-page-transition__glow"></div>
            <lottie-player
            ref={transitionPlayerRef}
            src="/assets/lottie/cat-scratches.json"
            background="transparent"
            speed="1.45"
            autoplay
          ></lottie-player>
          </div>
          <span>Loading CineSky</span>
        </div>
      ) : null}
    </header>
  );
}
