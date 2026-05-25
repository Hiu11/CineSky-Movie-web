import { Link } from "react-router-dom";

export default function BookingHero({ movie, cinemaOptions, showtimes, selectedSeats }) {
  const movieDuration = movie?.duration || movie?.durationMinutes;
  const metaItems = [
    movieDuration ? `${movieDuration} phĂºt` : "",
    movie?.genre,
    movie?.country,
  ].filter(Boolean);

  return (
    <section className="booking-page__hero">
      <div className="booking-page__hero-copy">
        <span className="booking-page__eyebrow">Äáº·t vĂ© nhanh</span>
        <h1 className="booking-page__title">{movie.title}</h1>
        <p className="booking-page__subtitle">
          Chá»n ráº¡p, ngĂ y xem, suáº¥t chiáº¿u, vá»‹ trĂ­ gháº¿ vĂ  phÆ°Æ¡ng thá»©c thanh toĂ¡n Ä‘á»ƒ hoĂ n táº¥t
          tráº£i nghiá»‡m Ä‘áº·t vĂ© theo phong cĂ¡ch CineSky.
        </p>
        <div className="booking-page__meta">
          {metaItems.map((item) => (<span key={item}>{item}</span>))}
        </div>
      </div>
      <div className="booking-page__hero-card">
        <span className="booking-page__hero-label">ThĂ´ng tin nhanh</span>
        <div className="booking-page__hero-grid">
          <div><strong>{cinemaOptions.length}</strong><span>cá»¥m ráº¡p</span></div>
          <div><strong>{showtimes.length}</strong><span>suáº¥t chiáº¿u</span></div>
          <div><strong>{selectedSeats.length}</strong><span>gháº¿ Ä‘ang chá»n</span></div>
        </div>
        <Link
          to={"/movie/" + movie.id + "?tab=" + (movie.status === "coming-soon" ? "soon" : "now")}
          className="booking-page__back-link"
        >
          Xem láº¡i chi tiáº¿t phim
        </Link>
      </div>
    </section>
  );
}
