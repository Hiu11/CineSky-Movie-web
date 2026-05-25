import { Link } from "react-router-dom";

export default function BookingHero({ movie, cinemaOptions, showtimes, selectedSeats }) {
  const movieDuration = movie?.duration || movie?.durationMinutes;
  const metaItems = [
    movieDuration ? `${movieDuration} phút` : "",
    movie?.genre,
    movie?.country,
  ].filter(Boolean);

  return (
    <section className="booking-page__hero">
      <div className="booking-page__hero-copy">
        <span className="booking-page__eyebrow">Đặt vé nhanh</span>
        <h1 className="booking-page__title">{movie.title}</h1>
        <p className="booking-page__subtitle">
          Chọn rạp, ngày xem, suất chiếu, vị trí ghế và phương thức thanh toán để hoàn tất
          trải nghiệm đặt vé theo phong cách CineSky.
        </p>
        <div className="booking-page__meta">
          {metaItems.map((item) => (<span key={item}>{item}</span>))}
        </div>
      </div>
      <div className="booking-page__hero-card">
        <span className="booking-page__hero-label">Thông tin nhanh</span>
        <div className="booking-page__hero-grid">
          <div><strong>{cinemaOptions.length}</strong><span>cụm rạp</span></div>
          <div><strong>{showtimes.length}</strong><span>suất chiếu</span></div>
          <div><strong>{selectedSeats.length}</strong><span>ghế đang chọn</span></div>
        </div>
        <Link
          to={"/movie/" + movie.id + "?tab=" + (movie.status === "coming-soon" ? "soon" : "now")}
          className="booking-page__back-link"
        >
          Xem lại chi tiết phim
        </Link>
      </div>
    </section>
  );
}
