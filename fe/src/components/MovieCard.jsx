import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div
      className="movie-card-container"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="movie-card-box">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
          <div className="poster-overlay">
            <div className="overlay-tags">
              <span className="tag-2d">2D</span>
              <span className={`tag-rating ${movie.ratingClass}`}>
                {movie.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>

          <p className="movie-meta">
            <span className={`rating-badge ${movie.ratingClass}`}>
              {movie.rating}
            </span>
            {movie.genre} | {movie.duration} Phút
          </p>

          <p className="rating-desc">{movie.ratingDesc}</p>

          <div className="showtimes-section">
            <p className="showtime-label">Lịch chiếu:</p>
            <div className="time-grid">
              {movie.times.map((time, index) => (
                <button
                  key={index}
                  className="time-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="card-actions">
            <button
              className="btn-trailer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movie/${movie.id}#trailer`);
              }}
            >
              Xem Trailer
            </button>

            <button
              className="btn-book"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/booking?movieId=${movie.id}`);
              }}
            >
              ĐẶT VÉ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;