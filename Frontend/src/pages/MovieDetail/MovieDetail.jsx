import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMovieById, getMovies } from "../../services/movieService";
import "./MovieDetail.css";

const DetailSkeleton = () => (
  <main className="md-page">
    <section className="md-shell md-shell--skeleton" aria-hidden="true">
      <div className="md-poster-skeleton"></div>
      <div className="md-copy-skeleton">
        <div className="md-skeleton-line md-skeleton-line--eyebrow"></div>
        <div className="md-skeleton-line md-skeleton-line--title"></div>
        <div className="md-skeleton-line md-skeleton-line--title md-skeleton-line--short"></div>
        <div className="md-skeleton-line md-skeleton-line--body"></div>
        <div className="md-skeleton-line md-skeleton-line--body"></div>
        <div className="md-skeleton-line md-skeleton-line--body md-skeleton-line--short"></div>
        <div className="md-quick-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="md-quick-card md-quick-card--skeleton"></div>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trailerSectionRef = useRef(null);
  const [movie, setMovie] = useState(null);
  const [catalogMovies, setCatalogMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTrailerExpanded, setIsTrailerExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [movieData, moviesData] = await Promise.all([getMovieById(id), getMovies()]);

        if (isMounted) {
          setMovie(movieData);
          setCatalogMovies(Array.isArray(moviesData) ? moviesData : []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Không thể tải thông tin phim từ server.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovie();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isTrailerExpanded) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsTrailerExpanded(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isTrailerExpanded]);

  useEffect(() => {
    if (location.hash !== "#trailer") {
      return;
    }

    trailerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, movie?.id]);

  useEffect(() => {
    if (location.hash === "#trailer") {
      return;
    }

    setIsTrailerExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, location.hash]);

  const isComingSoon = movie?.status === "coming-soon";

  const quickFacts = useMemo(
    () =>
      movie
        ? [
            { label: "Thời lượng", value: `${movie.duration} phút` },
            { label: "Khởi chiếu", value: movie.release },
            { label: "Quốc gia", value: movie.country },
            { label: "Đạo diễn", value: movie.director },
          ]
        : [],
    [movie]
  );

  const previewTimes = useMemo(() => {
    if (!Array.isArray(movie?.times)) {
      return [];
    }

    return movie.times.filter((time) => time && time !== "Chưa có lịch").slice(0, 5);
  }, [movie]);

  const trailerFacts = useMemo(() => {
    if (Array.isArray(movie?.trailerFacts) && movie.trailerFacts.length > 0) {
      return movie.trailerFacts;
    }

    return [];
  }, [movie]);

  const trailerPanel = useMemo(
    () =>
      movie?.trailerPanel || {
        label: "Thông tin nhanh",
        title: movie?.title || "",
        description:
          "Xem trailer trước khi chọn suất để nắm nhanh không khí, trạng thái phát hành và các mốc lịch chiếu nổi bật của bộ phim.",
      },
    [movie]
  );

  const galleryItems = useMemo(() => {
    if (Array.isArray(movie?.gallery) && movie.gallery.length > 0) {
      return movie.gallery;
    }

    return movie?.poster ? [movie.poster] : [];
  }, [movie]);

  const castMembers = useMemo(() => {
    if (Array.isArray(movie?.cast) && movie.cast.length > 0) {
      return movie.cast;
    }

    return [];
  }, [movie]);

  const relatedMovies = useMemo(() => {
    if (!movie || catalogMovies.length === 0) {
      return [];
    }

    return catalogMovies
      .filter((item) => item.id !== movie.id)
      .map((item) => {
        const sharedGenres = (item.genres || []).filter((genre) => (movie.genres || []).includes(genre)).length;
        const score = sharedGenres * 2 + (item.country === movie.country ? 1 : 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((first, second) => second.score - first.score)
      .slice(0, 3);
  }, [catalogMovies, movie]);

  const handleScrollToTrailer = () => {
    trailerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenRelatedMovie = (item) => {
    navigate(`/movie/${item.id}?tab=${item.status === "coming-soon" ? "soon" : "now"}`);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!movie) {
    return (
      <main className="md-page">
        <section className="md-empty-state">
          <span className="md-kicker">Không khả dụng</span>
          <h2>{errorMessage || "Không tìm thấy phim"}</h2>
          <p>Vui lòng quay lại danh sách phim để chọn một phim khác hoặc thử lại sau.</p>
          <button type="button" className="md-primary-btn" onClick={() => navigate("/?tab=now")}>
            Quay lại danh sách phim
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="md-page">
      <section className="md-shell">
        <div className="md-poster-panel">
          <div className="md-posterWrap">
            <img className="md-poster" src={movie.poster} alt={movie.title} />
          </div>
        </div>

        <div className="md-content-panel">
          <div className="md-topline">
            <span className="md-status-chip">{isComingSoon ? "Sắp chiếu" : "Đang chiếu"}</span>
            <span className={`md-rating-chip ${movie.ratingClass}`}>{movie.rating}</span>
          </div>

          <h1 className="md-title">{movie.title}</h1>
          <p className="md-description">{movie.description}</p>

          <div className="md-genre-row">
            {(movie.genres || []).map((genre) => (
              <span className="md-genre" key={genre}>
                {genre}
              </span>
            ))}
          </div>

          <div className="md-quick-grid">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="md-quick-card">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>

          <div className="md-actions">
            <button
              type="button"
              className="md-primary-btn"
              onClick={() => navigate(`/booking?movieId=${movie.id}`)}
              disabled={isComingSoon}
            >
              {isComingSoon ? "Chưa mở đặt vé" : "Đặt vé ngay"}
            </button>
            <button type="button" className="md-secondary-btn" onClick={handleScrollToTrailer}>
              Xem trailer
            </button>
          </div>

          <aside className="md-highlight-card">
            <div>
              <span className="md-highlight-card__label">Lịch chiếu nhanh</span>
              <strong>{isComingSoon ? "Đang cập nhật" : `${previewTimes.length} suất nổi bật`}</strong>
            </div>
            <div className="md-highlight-card__times">
              {previewTimes.length > 0 ? (
                previewTimes.map((time) => <span key={time}>{time}</span>)
              ) : (
                <span className="md-highlight-card__times-empty">Phim này chưa có lịch chiếu khả dụng.</span>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="md-trailer" ref={trailerSectionRef} id="trailer">
        <div className="md-section-header">
          <div>
            <span className="md-kicker">Trailer</span>
            <h2>Xem trước không khí của bộ phim</h2>
          </div>
          <button type="button" className="md-secondary-btn" onClick={() => setIsTrailerExpanded(true)}>
            Phóng to
          </button>
        </div>

        <div className="md-trailer-layout">
          <div className="md-videoWrap">
            <div className="md-video">
              <iframe
                src={movie.trailer}
                title={`Trailer ${movie.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <aside className="md-trailer-side">
            <div className="md-trailer-sideCard">
              <span className="md-highlight-card__label">{trailerPanel.label}</span>
              <h3>{trailerPanel.title}</h3>
              <p>{trailerPanel.description}</p>
            </div>

            <div className="md-trailer-facts">
              {trailerFacts.map((item) => (
                <div key={item.label} className="md-trailer-fact">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="md-trailer-sideActions">
              {!isComingSoon ? (
                <button type="button" className="md-primary-btn" onClick={() => navigate(`/booking?movieId=${movie.id}`)}>
                  Đặt vé ngay
                </button>
              ) : (
                <button type="button" className="md-secondary-btn" onClick={() => navigate("/?tab=soon")}>
                  Xem phim sắp chiếu
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>

      {galleryItems.length > 0 ? (
        <section className="md-extra-section">
          <div className="md-section-header">
            <div>
              <span className="md-kicker">Gallery</span>
              <h2>Một vài khung hình nổi bật</h2>
            </div>
          </div>

          <div className="md-gallery-grid">
            {galleryItems.map((item, index) => (
              <article key={item + index} className="md-gallery-card">
                <img src={item} alt={`${movie.title} still ${index + 1}`} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {castMembers.length > 0 ? (
        <section className="md-extra-section">
          <div className="md-section-header">
            <div>
              <span className="md-kicker">Diễn viên</span>
              <h2>Những gương mặt nổi bật trong phim</h2>
            </div>
          </div>

          <div className="md-cast-grid">
            {castMembers.map((member) => (
              <article key={member.name + member.role} className="md-cast-card">
                <div className="md-cast-card__avatar">{member.name.charAt(0)}</div>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {relatedMovies.length > 0 ? (
        <section className="md-extra-section">
          <div className="md-section-header">
            <div>
              <span className="md-kicker">Liên quan</span>
              <h2>Phim có thể bạn cũng quan tâm</h2>
            </div>
          </div>

          <div className="md-related-grid">
            {relatedMovies.map((item) => (
              <button
                key={item.id}
                type="button"
                className="md-related-card"
                onClick={() => handleOpenRelatedMovie(item)}
              >
                <img src={item.poster} alt={item.title} />
                <div className="md-related-card__body">
                  <strong>{item.title}</strong>
                  <span>{[item.genre, `${item.duration} phút`].filter(Boolean).join(" • ")}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {isTrailerExpanded ? (
        <div
          className="md-trailerModal"
          role="dialog"
          aria-modal="true"
          aria-label={`Trailer phim ${movie.title}`}
          onClick={() => setIsTrailerExpanded(false)}
        >
          <div className="md-trailerModalDialog" onClick={(event) => event.stopPropagation()}>
            <div className="md-trailerModalHeader">
              <h2>Trailer: {movie.title}</h2>
              <button
                type="button"
                className="md-closeBtn"
                onClick={() => setIsTrailerExpanded(false)}
                aria-label="Đóng trailer"
              >
                ×
              </button>
            </div>

            <div className="md-video md-video--expanded">
              <iframe
                src={movie.trailer}
                title={`Trailer ${movie.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
