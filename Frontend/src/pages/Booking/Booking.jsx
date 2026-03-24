import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

  const movies = [
    { id: 201, title: "THỎ ƠI!!" },
    { id: 202, title: "TIỂU YÊU QUÁI NÚI LÃNG LÃNG" },
    { id: 203, title: "RUNNING MAN VIỆT NAM MÙA 3: CON RỐI TỰ DO" },
    { id: 1, title: "Avatar: Lửa Và Tro Tàn" },
    { id: 2, title: "Tử Chiến Trên Không" },
    { id: 3, title: "THOR: THẾ GIỚI BÓNG TỐI" },
    { id: 4, title: "ĐÀO, PHỞ VÀ PIANO" },
    { id: 5, title: "1990" },
    { id: 6, title: "MẮT BIẾC" },
    { id: 7, title: "BEAUTY AND THE BEAST" },
    { id: 101, title: "TẾ LỄ QUỶ LINH NHI" },
    { id: 102, title: "MÙI PHỞ (K)" },
    { id: 103, title: "QUỶ NHẬP TRÀNG 2" },
  ];

  const movie = movies.find((m) => m.id === Number(movieId));

  useEffect(() => {
    setSelectedSeats([]);
  }, [movieId]);

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
  };

  const handleConfirmBooking = () => {
    alert(`Đặt vé thành công!\n\nPhim: ${movie.title}\nRạp: ${cinema}\nSuất: ${time}\nGhế: ${selectedSeats.join(", ")}`);
  };

  if (!movie) {
    return <h2 className="booking-page booking-page--empty">Không tìm thấy phim</h2>;
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
            <button key={street} onClick={() => setCinema(street)} className={`booking-page__option ${cinema === street ? "is-active" : ""}`}>
              {street}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-page__section">
        <h3>Chọn suất</h3>
        <div className="booking-page__row">
          {["09:00", "11:30", "14:00", "16:30", "18:30", "21:00"].map((slot) => (
            <button key={slot} onClick={() => setTime(slot)} className={`booking-page__option ${time === slot ? "is-active" : ""}`}>
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-page__screening">
        <div className="booking-page__screen">MÀN HÌNH</div>
        {rows.map((row) => (
          <div key={row} className="booking-page__seat-row">
            {Array.from({ length: 10 }, (_, i) => {
              const seat = `${row}${i + 1}`;
              return (
                <button
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  className={`booking-page__seat ${selectedSeats.includes(seat) ? "is-selected" : ""}`}
                >
                  {seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="booking-page__summary">
        <p><b>Phim:</b> {movie.title}</p>
        <p><b>Rạp:</b> {cinema}</p>
        <p><b>Suất:</b> {time}</p>
        <p><b>Ghế:</b> {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</p>
        <p><b>Số ghế:</b> {selectedSeats.length}</p>
        <button disabled={selectedSeats.length === 0} onClick={handleConfirmBooking} className="booking-page__confirm">
          XÁC NHẬN ĐẶT VÉ
        </button>
      </div>
    </div>
  );
}
