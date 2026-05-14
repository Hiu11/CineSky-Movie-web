const defaultCinemaCatalog = [
  {
    name: "CineSky Nguyen Hue",
    address: "12 Nguyen Hue, Quan 1, TP.HCM",
    rooms: ["Sky Hall 1", "Sky Hall 2"],
  },
  {
    name: "CineSky Hai Ba Trung",
    address: "98 Hai Ba Trung, Quan 3, TP.HCM",
    rooms: ["Moon Hall", "Galaxy Hall"],
  },
  {
    name: "CineSky Dien Bien Phu",
    address: "215 Dien Bien Phu, Binh Thanh, TP.HCM",
    rooms: ["Nova Hall", "Aurora Hall"],
  },
];

const seatTemplatesByRoom = {
  "Sky Hall 1": [14, 14, 18, 18, 20, 20, 22, 22, 24, 24],
  "Sky Hall 2": [14, 14, 18, 18, 20, 20, 22, 22, 24, 24],
  "Moon Hall": [16, 16, 20, 20, 22, 22, 24, 24, 26, 26],
  "Galaxy Hall": [16, 16, 20, 20, 22, 22, 24, 24, 26, 26],
  "Nova Hall": [18, 18, 22, 22, 24, 24, 28, 28, 30, 30, 30, 30],
  "Aurora Hall": [18, 18, 22, 22, 24, 24, 28, 28, 30, 30, 30, 30],
};

const buildSeatLabels = (roomName = "") => {
  const rowCounts = seatTemplatesByRoom[roomName] || seatTemplatesByRoom["Moon Hall"];

  return rowCounts.flatMap((seatCount, rowIndex) => {
    const rowKey = String.fromCharCode(65 + rowIndex);

    return Array.from({ length: seatCount }, (_, seatIndex) => `${rowKey}${seatIndex + 1}`);
  });
};

const isValidSeedShowtime = (timeLabel) => /^\d{2}:\d{2}$/.test(String(timeLabel));

const createShowtimesFromMovies = (movies = []) => {
  const baseDate = "2026-05-10";

  return movies.flatMap((movie, movieIndex) => {
    const validShowtimes = Array.isArray(movie.showtimes)
      ? movie.showtimes.filter(isValidSeedShowtime)
      : [];

    if (movie.status !== "now-showing" || validShowtimes.length === 0) {
      return [];
    }

    return defaultCinemaCatalog.flatMap((cinema, cinemaIndex) =>
      validShowtimes.map((timeLabel, timeIndex) => {
        const roomName = cinema.rooms[(movieIndex + cinemaIndex + timeIndex) % cinema.rooms.length];
        const seatLabels = buildSeatLabels(roomName);
        const [hour, minute] = String(timeLabel)
          .split(":")
          .map((value) => Number(value) || 0);
        const start = new Date(
          `${baseDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+07:00`
        );
        const end = new Date(start.getTime() + (movie.duration || 120) * 60000);

        return {
          seedKey: `${movie.legacyId}-${cinema.name}-${roomName}-${timeLabel}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
          movieLegacyId: movie.legacyId,
          cinemaName: cinema.name,
          cinemaAddress: cinema.address,
          roomName,   
          displayDate: baseDate,    
          displayTime: timeLabel,      
          startTime: start,   
          endTime: end,   
          price:
            movie.rating === "C18" || movie.rating === "T18" ? 110000 : 90000,
          seats: seatLabels,
          bookedSeats: [],
        };
      })
    );
  });
};

export { defaultCinemaCatalog, createShowtimesFromMovies };
