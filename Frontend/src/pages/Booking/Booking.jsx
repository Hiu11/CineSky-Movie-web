import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import "./Booking.css";

export default function Booking() {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movieId");

  const streets = [
    "Nguyễn Huệ",
    "Lê Lợi",
    "Hai Bà Trưng",
    "Điện Biên Phủ",
    "Pasteur",
    "Cách Mạng Tháng 8",
    "Lý Tự Trọng",
    "Trần Hưng Đạo",
    "Phan Đình Phùng",
    "Võ Văn Tần",
  ];

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [cinema, setCinema] = useState(streets[0]);
  const [time, setTime] = useState("09:00");
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedSeats([]);
  }, [movieId]);

  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMovieById(movieId);

        if (isMounted) {
          setMovie(data);

          const availableTimes = (data.times || []).filter(
            (slot) => slot !== "Chưa có lịch"
          );
          setTime(availableTimes[0] || "Chưa có lịch");
        }
      } catch (error) {
        if (isMounted) {
          setMovie(null);
          setErrorMessage(
            error.message || "Không thể tải thông tin phim từ server."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (movieId) {
      fetchMovie();
    } else {
      setMovie(null);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const availableTimes = (movie?.times || []).filter(
    (slot) => slot !== "Chưa có lịch"
  );
  const isComingSoon = availableTimes.length === 0;

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((selectedSeat) => selectedSeat !== seat)
        : [...prev, seat]
    );
  };

  const handleConfirmBooking = () => {
    alert(
      `Đặt vé thành công!\n\nPhim: ${movie.title}\nRạp: ${cinema}\nSuất: ${time}\nGhế: ${selectedSeats.join(", ")}`
    );
  };

  if (isLoading) {
    return (
      <h2 className="booking-page booking-page--empty">
        Đang tải thông tin phim...
      </h2>
    );
  }

  if (!movie) {
    return (
      <h2 className="booking-page booking-page--empty">
        {errorMessage || "Không tìm thấy phim"}
      </h2>
    );
  }

  return (
    <div className="booking-page">
      <h1 className="booking-page__title">Đặt vé</h1>
      <p className="booking-page__subtitle">
        Phim: <b>{movie.title}</b>
      </p>

      <div className="booking-page__section">
        <h3>Chọn rạp</h3>
        <div className="booking-page__row">
          {streets.map((street) => (
            <button
              key={street}
              onClick={() => setCinema(street)}
              className={`booking-page__option ${
                cinema === street ? "is-active" : ""
              }`}
            >
              {street}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-page__section">
        <h3>Chọn suất</h3>
        <div className="booking-page__row">
          {availableTimes.length > 0 ? (
            availableTimes.map((slot) => (
              <button
                key={slot}
                onClick={() => setTime(slot)}
                className={`booking-page__option ${
                  time === slot ? "is-active" : ""
                }`}
              >
                {slot}
              </button>
            ))
          ) : (
            <p className="booking-page__subtitle">Phim này chưa có lịch chiếu.</p>
          )}
        </div>
      </div>

      <div className="booking-page__screening">
        <div className="booking-page__screen">MÀN HÌNH</div>
        {rows.map((row) => (
          <div key={row} className="booking-page__seat-row">
            {Array.from({ length: 10 }, (_, index) => {
              const seat = `${row}${index + 1}`;
              return (
                <button
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  className={`booking-page__seat ${
                    selectedSeats.includes(seat) ? "is-selected" : ""
                  }`}
                >
                  {seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="booking-page__summary">
        <p>
          <b>Phim:</b> {movie.title}
        </p>
        <p>
          <b>Rạp:</b> {cinema}
        </p>
        <p>
          <b>Suất:</b> {time}
        </p>
        <p>
          <b>Ghế:</b>{" "}
          {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}
        </p>
        <p>
          <b>Số ghế:</b> {selectedSeats.length}
        </p>
        <button
          disabled={selectedSeats.length === 0 || isComingSoon}
          onClick={handleConfirmBooking}
          className="booking-page__confirm"
        >
          XÁC NHẬN ĐẶT VÉ
        </button>
      </div>
    </div>
  );
}
