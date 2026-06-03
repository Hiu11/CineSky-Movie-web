import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState("");
  const currentTab = new URLSearchParams(location.search).get("tab") || "now";
  const isComingSoon = Array.isArray(movie.times) && movie.times.includes("Chưa có lịch");

  const previewTimes = useMemo(() => {
    if (!Array.isArray(movie.times)) {
      return [];
    }

    return movie.times.slice(0, 4);
  }, [movie.times]);

  const handleBookingClick = (event) => {
    event.stopPropagation();

    if (isComingSoon) {
      setNotice("Phim chưa có lịch chiếu. Vui lòng quay lại sau.");
      window.setTimeout(() => setNotice(""), 2600);
      return;
    }

    navigate(`/booking?movieId=${movie.id}`);
  };

  const handlePosterError = (event) => {
    if (event.currentTarget.src.includes("dai-tiec-trang-mau-1.jpg")) {
      event.currentTarget.src = "/assets/images/dai-tiec-trang-mau.jpg";
    }
  };

  return (
    <div className="movie-card-container" onClick={() => navigate(`/movie/${movie.id}?tab=${currentTab}`)}>
      <div className="movie-card-box">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} onError={handlePosterError} />
          <div className="poster-overlay" />
          <div className="overlay-tags">
            <span className="tag-2d">2D</span>
          </div>
        </div>

        <div className="movie-info">
          {notice ? <div className="movie-card-notice">{notice}</div> : null}
          <h3 className="movie-title">{movie.title}</h3>

          <p className="movie-meta">
            <span className={`rating-badge ${movie.ratingClass}`}>{movie.rating}</span>
            <span>{movie.genre}</span>
            <span>{movie.duration} phút</span>
          </p>

          <div className="showtimes-section">
            <p className="showtime-label">Lịch chiếu</p>
            <div className="time-grid">
              {previewTimes.map((time, index) => (
                <button key={index} className="time-btn" onClick={(event) => event.stopPropagation()}>
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="card-actions">
            <button
              className="btn-trailer"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/movie/${movie.id}?tab=${currentTab}#trailer`);
              }}
            >
              Xem trailer
            </button>

            <button
              className={`btn-book ${isComingSoon ? "btn-book-disabled" : ""}`}
              onClick={handleBookingClick}
              disabled={isComingSoon}
              title={isComingSoon ? "Phim chưa có lịch chiếu" : ""}
            >
              Đặt vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
