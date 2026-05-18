import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getMovies } from "../../services/movieService";
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
  { to: "/about", label: "Giới thiệu", id: "about" },
  { to: "/feedback", label: "Góp ý", id: "feedback" },
];

const mobileNavIcons = {
  home: "⌂",
  now: "▶",
  soon: "⏱",
  filter: "⌕",
  about: "i",
  feedback: "✎",
};

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
  const searchParams = new URLSearchParams(location.search);
  const hasMovieTab = searchParams.has("tab");
  const tabParam = searchParams.get("tab") || "now";
  const isMovieDetail = location.pathname.startsWith("/movie/");
  const isAdminPage = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const isAdminUser = user?.role === "admin";
  const visibleNavItems = isAdminUser
    ? [...navItems, { to: "/admin", label: "Quản trị", id: "admin" }]
    : navItems;
  const movieDetailTab = isMovieDetail ? searchParams.get("tab") || "now" : null;
  const normalizedQuery = normalizeText(searchQuery).trim();
  const displayName = user?.name || user?.fullName || "User";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

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
        </button>

        {isUserMenuOpen ? (
          <div className="user-menu__panel">
            <Link to="/profile" className="user-menu__item">
              Hồ sơ cá nhân
            </Link>
            <Link to="/history" className="user-menu__item">
              Lịch sử đặt vé
            </Link>
            <Link to="/profile#favorites" className="user-menu__item">
              Phim yêu thích
            </Link>
            <Link to="/feedback" className="user-menu__item">
              Gửi góp ý
            </Link>
            {isAdminUser ? <Link to="/admin" className="user-menu__item">Quản trị</Link> : null}
            <button type="button" className="user-menu__item user-menu__item--danger" onClick={handleLogoutClick}>
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
        {visibleNavItems.map((item) => {
          let isActive = false;

          if (item.id === "home") {
            isActive = location.pathname === "/" && !hasMovieTab;
          } else if (item.id === "now") {
            isActive =
              ((location.pathname === "/" && hasMovieTab && tabParam === "now") || movieDetailTab === "now");
          } else if (item.id === "soon") {
            isActive =
              ((location.pathname === "/" && hasMovieTab && tabParam === "soon") || movieDetailTab === "soon");
          } else if (item.id === "admin") {
            isActive = isAdminPage;
          } else {
            isActive = location.pathname === item.to;
          }

          return item.id === "home" || item.to.startsWith("/?") ? (
            <Link
              key={item.id}
              to={item.to}
              className={(isActive ? "tab-btn active" : "tab-btn") + (item.id === "admin" ? " tab-btn--admin" : "")}
              onClick={(event) => handleNavTransition(event, item.to)}
            >
              {item.label}
            </Link>
          ) : (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive: routeActive }) =>
                (routeActive || isActive ? "tab-btn active" : "tab-btn") +
                (item.id === "admin" ? " tab-btn--admin" : "")
              }
              onClick={(event) => handleNavTransition(event, item.to)}
            >
              {item.label}
            </NavLink>
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
                  <span className="mobile-link-icon" aria-hidden="true">{mobileNavIcons[item.id] || "★"}</span>
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
