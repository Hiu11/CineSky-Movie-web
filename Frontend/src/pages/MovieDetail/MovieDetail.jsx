import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  addMyFavorite,
  createMovieReview,
  deleteMyMovieReview,
  getMovieById,
  getMovieReviews,
  getMovies,
  getMyFavorites,
  removeMyFavorite,
} from "../../services/movieService";
import "./MovieDetail.css";
import DynamicLottie from "../../components/DynamicLottie/DynamicLottie";

const getSessionUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = sessionStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

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

const getReviewRatingTone = (rating) => {
  const normalizedRating = Math.min(10, Math.max(1, Number(rating) || 1));
  return `md-score-tone md-score-tone--${normalizedRating}`;
};

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
  const [isDetailIntroDone, setIsDetailIntroDone] = useState(false);
  const [hasTrailerIntroStarted, setHasTrailerIntroStarted] = useState(false);
  const [isTrailerIntroDone, setIsTrailerIntroDone] = useState(false);
  const [sessionUser] = useState(() => getSessionUser());
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteSaving, setIsFavoriteSaving] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: "8", content: "" });
  const [reviewStatus, setReviewStatus] = useState({ type: "", message: "" });
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  const [isReviewRatingOpen, setIsReviewRatingOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async (silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
        }
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
    const movieRefreshId = window.setInterval(() => fetchMovie(true), 30000);

    return () => {
      isMounted = false;
      window.clearInterval(movieRefreshId);
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
    let isMounted = true;

    const loadEngagement = async () => {
      if (!id) {
        return;
      }

      try {
        const nextReviews = await getMovieReviews(id, { limit: 10 });

        if (isMounted) {
          setReviews(Array.isArray(nextReviews) ? nextReviews : []);
        }
      } catch {
        if (isMounted) {
          setReviews([]);
        }
      }

      if (!sessionUser?.id && !sessionUser?.email) {
        if (isMounted) {
          setIsFavorite(false);
        }
        return;
      }

      try {
        const favorites = await getMyFavorites({ limit: 50 });

        if (isMounted) {
          setIsFavorite(
            Array.isArray(favorites) &&
              favorites.some((favorite) => String(favorite.movieId) === String(id))
          );
        }
      } catch {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    };

    loadEngagement();

    return () => {
      isMounted = false;
    };
  }, [id, sessionUser]);

  useEffect(() => {
    if (location.hash === "#trailer") {
      return;
    }

    setIsTrailerExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, location.hash]);



  useEffect(() => {
    setIsDetailIntroDone(false);

    const introTimer = window.setTimeout(() => {
      setIsDetailIntroDone(true);
    }, 2300);

    return () => window.clearTimeout(introTimer);
  }, [movie?.id]);

  useEffect(() => {
    const node = trailerSectionRef.current;

    setHasTrailerIntroStarted(false);
    setIsTrailerIntroDone(false);

    if (!node) {
      return undefined;
    }

    let trailerTimer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setHasTrailerIntroStarted(true);
        trailerTimer = window.setTimeout(() => {
          setIsTrailerIntroDone(true);
        }, 1900);
        observer.disconnect();
      },
      { threshold: 0.28 }
    );

    observer.observe(node);

    return () => {
      window.clearTimeout(trailerTimer);
      observer.disconnect();
    };
  }, [movie?.id]);

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
      .filter((item) => {
        if (item.id === movie.id) {
          return false;
        }

        return (item.genres || []).some((genre) => (movie.genres || []).includes(genre));
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [catalogMovies, movie]);

  const handleScrollToTrailer = () => {
    trailerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenRelatedMovie = (item) => {
    navigate(`/movie/${item.id}?tab=${item.status === "coming-soon" ? "soon" : "now"}`);
  };

  const handleToggleFavorite = async () => {
    if (!sessionUser?.id && !sessionUser?.email) {
      navigate("/login");
      return;
    }

    try {
      setIsFavoriteSaving(true);

      if (isFavorite) {
        await removeMyFavorite(movie.id);
        setIsFavorite(false);
        setReviewStatus({ type: "success", message: "Đã bỏ khỏi danh sách yêu thích." });
      } else {
        await addMyFavorite(movie.id);
        setIsFavorite(true);
        setReviewStatus({
          type: "success",
          message: "Đã thêm vào yêu thích. Xem lại tại Hồ sơ > Phim yêu thích.",
        });
      }
    } catch (error) {
      setReviewStatus({
        type: "error",
        message: error.message || "Không thể cập nhật phim yêu thích.",
      });
    } finally {
      setIsFavoriteSaving(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!sessionUser?.id && !sessionUser?.email) {
      navigate("/login");
      return;
    }

    try {
      setIsReviewSaving(true);
      setReviewStatus({ type: "", message: "" });

      const savedReview = await createMovieReview(movie.id, {
        rating: Number(reviewForm.rating),
        content: reviewForm.content,
      });

      setReviews((currentReviews) => [
        savedReview,
        ...currentReviews.filter((review) => String(review.user?.id) !== String(sessionUser.id)),
      ]);
      setReviewForm((current) => ({ ...current, content: "" }));
      setReviewStatus({ type: "success", message: "Đã lưu đánh giá của bạn." });
    } catch (error) {
      setReviewStatus({ type: "error", message: error.message || "Không thể lưu đánh giá." });
    } finally {
      setIsReviewSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!sessionUser?.id && !sessionUser?.email) {
      return;
    }

    try {
      setIsReviewSaving(true);
      await deleteMyMovieReview(movie.id);
      setReviews((currentReviews) =>
        currentReviews.filter((review) => String(review.user?.id) !== String(sessionUser.id))
      );
      setReviewStatus({ type: "success", message: "Đã xóa đánh giá của bạn." });
    } catch (error) {
      setReviewStatus({ type: "error", message: error.message || "Không thể xóa đánh giá." });
    } finally {
      setIsReviewSaving(false);
    }
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

        <div className={"md-content-panel" + (isDetailIntroDone ? " is-ready" : " is-intro")}>
          {!isDetailIntroDone ? (
            <div className="md-spoiler-intro" aria-hidden="true">
              <DynamicLottie
                src="/assets/lottie/spoiler-alert.json"
                loop={false}
                autoplay={true}
              />
            </div>
          ) : null}

          <div className="md-detail-copy">
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
            <button
              type="button"
              className={"md-secondary-btn" + (isFavorite ? " is-favorite" : "")}
              onClick={handleToggleFavorite}
              disabled={isFavoriteSaving}
            >
              {isFavorite ? "Đã yêu thích" : "Yêu thích"}
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
        </div>
      </section>

      <section className={"md-trailer" + (isTrailerIntroDone ? " is-ready" : " is-intro")} ref={trailerSectionRef} id="trailer">
        <div className="md-section-header">
          <div>
            <span className="md-kicker">Trailer</span>
            <h2>Xem trước không khí của bộ phim</h2>
          </div>
          <button type="button" className="md-secondary-btn" onClick={() => setIsTrailerExpanded(true)}>
            Phóng to
          </button>
        </div>

        <div className={"md-trailer-layout" + (isTrailerIntroDone ? " is-ready" : " is-intro")}>
          {!isTrailerIntroDone ? (
            <div className="md-trailer-intro" aria-hidden="true">
              {hasTrailerIntroStarted ? (
                <DynamicLottie
                  src="/assets/lottie/movie-clapboard.json"
                  loop={false}
                  autoplay={true}
                />
              ) : null}
            </div>
          ) : null}

          <div className="md-trailer-ready">
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

      <section className="md-extra-section md-review-section">
        <div className="md-section-header">
          <div>
            <span className="md-kicker">Đánh giá</span>
            <h2>Cảm nhận từ người xem</h2>
          </div>
        </div>

        <div className="md-review-layout">
          <form className="md-review-form" onSubmit={handleReviewSubmit} noValidate>
            <label>
              <span>Điểm</span>
              <div className={`filter-control filter-dropdown md-rating-dropdown ${isReviewRatingOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className={`filter-dropdown__trigger md-rating-dropdown__trigger ${getReviewRatingTone(
                    reviewForm.rating
                  )}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setIsReviewRatingOpen((current) => !current);
                  }}
                  aria-expanded={isReviewRatingOpen}
                >
                  {reviewForm.rating}/10
                </button>
                <div
                  className="filter-dropdown__menu md-rating-dropdown__menu"
                  role="listbox"
                  aria-label="Chọn điểm"
                  style={
                    isReviewRatingOpen
                      ? { visibility: "visible", opacity: 1, pointerEvents: "auto", transform: "translateY(0) scale(1)" }
                      : undefined
                  }
                >
                  {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`filter-dropdown__option md-rating-dropdown__option ${getReviewRatingTone(
                        rating
                      )} ${reviewForm.rating === rating ? "is-selected" : ""}`}
                      role="option"
                      aria-selected={reviewForm.rating === rating}
                      onClick={() => {
                        setReviewForm((current) => ({ ...current, rating }));
                        setIsReviewRatingOpen(false);
                      }}
                    >
                      {rating}/10
                    </button>
                  ))}
                </div>
              </div>
            </label>
            <label>
              <span>Nội dung</span>
              <textarea
                value={reviewForm.content}
                onChange={(event) =>
                  setReviewForm((current) => ({ ...current, content: event.target.value }))
                }
                placeholder="Chia sẻ ngắn gọn cảm nhận của bạn về phim"
                rows="4"
                required
              />
            </label>
            {reviewStatus.message ? (
              <p className={"md-review-status md-review-status--" + reviewStatus.type}>
                {reviewStatus.message}
              </p>
            ) : null}
            <div className="md-review-actions">
              <button type="submit" className="md-primary-btn" disabled={isReviewSaving}>
                {isReviewSaving ? "Đang lưu..." : sessionUser ? "Gửi đánh giá" : "Đăng nhập để đánh giá"}
              </button>
              {reviews.some((review) => String(review.user?.id) === String(sessionUser?.id)) ? (
                <button
                  type="button"
                  className="md-secondary-btn"
                  onClick={handleDeleteReview}
                  disabled={isReviewSaving}
                >
                  Xóa đánh giá của tôi
                </button>
              ) : null}
            </div>
          </form>

          <div className="md-review-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="md-review-card">
                  <div>
                    <strong>{review.user?.fullName || "Người dùng CineSky"}</strong>
                    <span className={getReviewRatingTone(review.rating)}>{review.rating}/10</span>
                  </div>
                  <p>{review.content}</p>
                </article>
              ))
            ) : (
              <p className="md-review-empty">Chưa có đánh giá nào cho phim này.</p>
            )}
          </div>
        </div>
      </section>

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
                  <span className="md-related-card__cta">Xem thêm</span>
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
