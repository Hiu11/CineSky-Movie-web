import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMovies } from "../../services/movieService";
import "./AuthLayout.css";

const heroHighlights = [
  { value: "10K+", label: "movie titles" },
  { value: "24/7", label: "showtime flow" },
  { value: "HD", label: "cinema feel" },
];

function FieldGlyph({ name }) {
  switch (name) {
    case "user":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16v10H4z" />
          <path d="m5 8 7 6 7-6" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          <rect x="6" y="11" width="12" height="9" rx="2" />
          <path d="M12 15v2" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h3l1 4-2 2a15 15 0 0 0 5 5l2-2 4 1v3a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 10h16" />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      );
    case "close":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 7 10 10" />
          <path d="m17 7-10 10" />
        </svg>
      );
    default:
      return null;
  }
}

function SocialGlyph({ name }) {
  switch (name) {
    case "google":
      return (
        <span className="auth-social-button__letter auth-social-button__letter--google">G</span>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M14 8h2.5V4.7A13.2 13.2 0 0 0 13.9 4C11.3 4 9.5 5.6 9.5 8.4V11H7v3.5h2.5V20h3.7v-5.5h2.9L16.6 11h-3.4V8.8c0-.6.3-.8.8-.8Z"
            fill="currentColor"
          />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M18.9 7.2c.8-.1 1.5-.5 2.1-1.1-.3.9-.9 1.6-1.7 2.1a3.7 3.7 0 0 1-6.4 3.4A10.5 10.5 0 0 1 5.2 7.7a3.7 3.7 0 0 0 1.2 4.9c-.6 0-1.1-.2-1.6-.5 0 1.8 1.2 3.3 2.9 3.7-.3.1-.7.1-1 .1-.3 0-.5 0-.8-.1.5 1.6 2 2.7 3.8 2.8A7.5 7.5 0 0 1 4 20.1 10.6 10.6 0 0 0 9.8 22c6.9 0 10.8-5.9 10.6-11.2a7.7 7.7 0 0 0 1.9-2Z"
            fill="currentColor"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export function AuthIcon({ name }) {
  return (
    <span className="auth-field__icon" aria-hidden="true">
      <FieldGlyph name={name} />
    </span>
  );
}

export function AuthSocialButtons({ onGoogleClick, onFacebookClick, disabled = false }) {
  return (
    <div className="auth-social-actions" aria-label="Continue with social accounts">
      <button
        type="button"
        className="auth-social-button"
        onClick={onGoogleClick}
        disabled={disabled}
        aria-label="Continue with Google"
      >
        <SocialGlyph name="google" />
      </button>
      <button
        type="button"
        className="auth-social-button"
        onClick={onFacebookClick}
        disabled={disabled}
        aria-label="Continue with Facebook"
      >
        <SocialGlyph name="facebook" />
      </button>
    </div>
  );
}

export function AuthDivider({ label = "Or" }) {
  return (
    <div className="auth-divider" aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

export function AuthSocialFooter() {
  const items = ["facebook", "twitter", "instagram"];

  return (
    <div className="auth-social-footer" aria-label="Social links">
      {items.map((item) => (
        <button key={item} type="button" className="auth-social-footer__button" aria-label={item}>
          <SocialGlyph name={item} />
        </button>
      ))}
    </div>
  );
}

export default function AuthLayout({
  mode,
  subtitle,
  topContent,
  children,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  footerContent,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [posterTiles, setPosterTiles] = useState([]);
  const [posterOffset, setPosterOffset] = useState(0);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(Boolean(location.state?.authPanelOpen));
  const tabs =
    mode === "forgot"
      ? [
          { to: "/login", label: "Login", active: false },
          { to: "/forgot-password", label: "Reset", active: true },
          { to: "/register", label: "Register", active: false },
        ]
      : [
          { to: "/login", label: "Login", active: mode === "login" },
          { to: "/register", label: "Register", active: mode === "register" },
        ];

  useEffect(() => {
    setIsMobilePanelOpen(Boolean(location.state?.authPanelOpen));
  }, [location.state?.authPanelOpen, mode]);

  useEffect(() => {
    let isMounted = true;

    const fetchPosterTiles = async () => {
      try {
        const movies = await getMovies();

        if (!isMounted) {
          return;
        }

        const sortedMovies = movies
          .filter((movie) => movie.poster)
          .reverse()
          .sort((firstMovie, secondMovie) => {
            const firstHeroOrder = firstMovie.heroOrder ?? 999;
            const secondHeroOrder = secondMovie.heroOrder ?? 999;
            const firstStatusOrder = firstMovie.status === "now-showing" ? 0 : 1;
            const secondStatusOrder = secondMovie.status === "now-showing" ? 0 : 1;

            return (
              firstHeroOrder - secondHeroOrder ||
              firstStatusOrder - secondStatusOrder ||
              (firstMovie.catalogOrder ?? 999) - (secondMovie.catalogOrder ?? 999)
            );
          })
          .slice(0, 18);
        const hotPosters = sortedMovies.slice(0, 4);
        const otherPosters = sortedMovies.slice(4);
        const centeredMovies = [...otherPosters.slice(0, 6), ...hotPosters, ...otherPosters.slice(6)];
        const posters = centeredMovies
          .map((movie, index) => ({
            src: movie.poster,
            variant: index % 5 === 0 ? "wide" : index % 3 === 0 ? "tall" : "",
          }));

        setPosterTiles(posters);
      } catch {
        if (isMounted) {
          setPosterTiles([]);
        }
      }
    };

    fetchPosterTiles();
    const posterRefreshId = window.setInterval(fetchPosterTiles, 30000);
    const posterShuffleId = window.setInterval(() => {
      setPosterOffset((currentOffset) => currentOffset + 1);
    }, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(posterRefreshId);
      window.clearInterval(posterShuffleId);
    };
  }, []);

  const wallTiles = useMemo(
    () => {
      if (posterTiles.length === 0) {
        return [];
      }

      const offset = posterOffset % posterTiles.length;
      const shiftedPosters = [...posterTiles.slice(offset), ...posterTiles.slice(0, offset)];
      return [...shiftedPosters, ...shiftedPosters.slice(0, 8)];
    },
    [posterOffset, posterTiles]
  );

  return (
    <div className={`auth-page auth-page--${mode}`}>
      <div className="auth-page__wall" aria-hidden="true">
        {wallTiles.map((poster, index) => (
          <span
            key={`${poster.src}-${index}`}
            className={`auth-page__poster ${poster.variant ? `auth-page__poster--${poster.variant}` : ""}`}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(7, 7, 11, 0.08), rgba(7, 7, 11, 0.56)), url("${encodeURI(
                poster.src
              )}")`,
            }}
          />
        ))}
      </div>

      <div className="auth-page__overlay" aria-hidden="true" />

      <div className="auth-page__content">
        <section className={`auth-page__hero${isMobilePanelOpen ? " auth-page__hero--panel-open" : ""}`}>
          <button
            type="button"
            className="auth-page__mobile-close"
            onClick={() => navigate("/")}
            aria-label="Close and go back home"
          >
            <FieldGlyph name="close" />
          </button>

          <Link to="/" className="auth-page__brand" aria-label="Back to home">
            <span className="auth-page__brand-mark">Cine</span>
            <span className="auth-page__brand-name">Sky</span>
          </Link>

          <p className="auth-page__eyebrow">Movie booking and streaming experience</p>
          <h1 className="auth-page__headline">
            Touch the world
            <br />
            of cinema
          </h1>
          <p className="auth-page__description">
            Discover trending titles, save your watchlist, and book tickets in just a few taps with
            a modern cinema experience.
          </p>

          <div className="auth-page__highlights">
            {heroHighlights.map((item) => (
              <div key={item.label} className="auth-page__highlight">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {mode === "forgot" ? null : (
            <div className="auth-page__mobile-actions" aria-label="Authentication actions">
              <button
                type="button"
                className={mode === "login" ? "auth-page__mobile-action active" : "auth-page__mobile-action"}
                onClick={() => {
                  if (mode !== "login") {
                    navigate("/login", { state: { authPanelOpen: true } });
                    return;
                  }

                  setIsMobilePanelOpen(true);
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={mode === "register" ? "auth-page__mobile-action active" : "auth-page__mobile-action"}
                onClick={() => {
                  if (mode !== "register") {
                    navigate("/register", { state: { authPanelOpen: true } });
                    return;
                  }

                  setIsMobilePanelOpen(true);
                }}
              >
                Đăng ký
              </button>
            </div>
          )}
        </section>

        <section
          className={`auth-card auth-card--${mode}${isMobilePanelOpen ? " auth-card--mobile-open" : ""}`}
        >
          <button
            type="button"
            className="auth-card__close"
            onClick={() => {
              if (window.matchMedia("(max-width: 760px)").matches) {
                setIsMobilePanelOpen(false);
                return;
              }

              navigate("/");
            }}
            aria-label="Close and go back home"
          >
            <FieldGlyph name="close" />
          </button>

          <div className="auth-card__tabs">
            {tabs.map((tab, index) => (
              <div key={tab.to} className="auth-card__tab-group">
                <Link
                  to={tab.to}
                  state={{ authPanelOpen: true }}
                  className={tab.active ? "auth-card__tab active" : "auth-card__tab"}
                >
                  {tab.label}
                </Link>
                {index < tabs.length - 1 ? <span className="auth-card__separator">|</span> : null}
              </div>
            ))}
          </div>

          <p className="auth-card__subtitle">{subtitle}</p>

          {topContent}

          <form className="auth-form" onSubmit={onSubmit}>
            {children}
            <button type="submit" className="auth-form__submit" disabled={submitDisabled}>
              {submitLabel}
            </button>
          </form>

          {footerContent ? <div className="auth-card__footer">{footerContent}</div> : null}
        </section>
      </div>
    </div>
  );
}
