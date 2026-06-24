import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MovieCard.css";

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState("");
  const currentTab = new URLSearchParams(location.search).get("tab") || "now";
  const isRental = movie.status === "rental";
  const isComingSoon =
    movie.status === "coming-soon" ||
    (Array.isArray(movie.times) && movie.times.some((time) => normalizeText(time).includes("chua co lich")));
  const detailTab = isRental ? "rent" : isComingSoon ? "soon" : currentTab;
  const bookingDisabled = isComingSoon;
  const bookingLabel = isRental ? "Thuê phim" : isComingSoon ? "Chưa mở bán" : "Đặt vé";

  const previewTimes = useMemo(() => {
    if (isRental) {
      return ["Đã rời rạp"];
    }

    if (!Array.isArray(movie.times)) {
      return [];
    }

    return movie.times.slice(0, 4);
  }, [isRental, movie.times]);

  const openMovieDetail = () => {
    navigate(`/movie/${movie.id}?tab=${detailTab}`);
  };

  const openTrailer = (event) => {
    event.stopPropagation();
    navigate(`/movie/${movie.id}?tab=${detailTab}#trailer`);
  };

  const handleBookingClick = (event) => {
    event.stopPropagation();

    if (isRental) {
      navigate(`/rent?movieId=${movie.id}`);
      return;
    }

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
    <div className="movie-card-container" onClick={openMovieDetail}>
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
            <p className="showtime-label">{isRental ? "Trạng thái" : "Lịch chiếu"}</p>
            <div className="time-grid">
              {previewTimes.map((time, index) => (
                <button key={index} className="time-btn" onClick={(event) => event.stopPropagation()}>
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="card-actions">
            <button className="btn-trailer" onClick={openTrailer}>
              Xem trailer
            </button>

            <button
              className={`btn-book ${bookingDisabled ? "btn-book-disabled" : ""}`}
              onClick={handleBookingClick}
              disabled={bookingDisabled}
              title={bookingDisabled ? "Phim chưa có lịch chiếu" : ""}
            >
              {bookingLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
