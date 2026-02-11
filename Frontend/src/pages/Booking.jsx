import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleConfirmBooking = () => {
    alert(
      `Đặt vé thành công!\n\nPhim: ${movie.title}\nRạp: ${cinema}\nSuất: ${time}\nGhế: ${selectedSeats.join(
        ", "
      )}`
    );
  };

  if (!movie) {
    return <h2 style={{ color: "white" }}>❌ Không tìm thấy phim</h2>;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎟️ Đặt vé</h1>

      <p style={{ opacity: 0.85, marginBottom: 20 }}>
        Phim: <b>{movie.title}</b>
      </p>

      <div style={styles.section}>
        <h3>Chọn rạp</h3>

        <div style={styles.row}>
          {streets.map((street) => (
            <button
              key={street}
              onClick={() => setCinema(street)}
              style={{
                ...styles.optionBtn,
                background: cinema === street ? "#f7b400" : "#2a2d45",
                color: cinema === street ? "#000" : "#fff",
              }}
            >
              {street}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Chọn suất</h3>

        <div style={styles.row}>
          {["09:00", "11:30", "14:00", "16:30", "18:30", "21:00"].map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              style={{
                ...styles.optionBtn,
                background: time === t ? "#f7b400" : "#2a2d45",
                color: time === t ? "#000" : "#fff",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.sectionCenter}>
        <div style={styles.screen}>MÀN HÌNH</div>

        {rows.map((row) => (
          <div key={row} style={styles.seatRow}>
            {Array.from({ length: 10 }, (_, i) => {
              const seat = `${row}${i + 1}`;
              const active = selectedSeats.includes(seat);

              return (
                <button
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  style={{
                    ...styles.seat,
                    background: active ? "#4ade80" : "#2a2d45",
                    color: active ? "#000" : "#fff",
                  }}
                >
                  {seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={styles.summary}>
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
          disabled={selectedSeats.length === 0}
          onClick={handleConfirmBooking}
          style={{
            ...styles.confirmBtn,
            opacity: selectedSeats.length === 0 ? 0.5 : 1,
          }}
        >
          XÁC NHẬN ĐẶT VÉ
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#050816,#0b1020)",
    color: "white",
    padding: "40px 20px",
  },

  title: {
    marginBottom: 10,
  },

  section: {
    marginBottom: 30,
  },

  sectionCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 40,
  },

  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  optionBtn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },

  screen: {
    width: 360,
    background: "#444",
    textAlign: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontWeight: "bold",
  },

  seatRow: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
  },

  seat: {
    width: 36,
    height: 36,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
  },

  summary: {
    maxWidth: 600,
    margin: "0 auto",
    background: "#11152b",
    padding: 20,
    borderRadius: 12,
  },

  confirmBtn: {
    width: "100%",
    marginTop: 16,
    padding: 14,
    background: "#f7b400",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
