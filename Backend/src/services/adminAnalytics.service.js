const analyticsCinemaCatalog = [
  { name: "CineSky Nguyen Hue", rooms: ["Sky Hall 1", "Sky Hall 2"] },
  { name: "CineSky Hai Ba Trung", rooms: ["Moon Hall", "Galaxy Hall"] },
  { name: "CineSky Dien Bien Phu", rooms: ["Nova Hall", "Aurora Hall"] },
];

const analyticsRoomToCinemaName = analyticsCinemaCatalog.reduce((map, cinema) => {
  cinema.rooms.forEach((room) => map.set(room.toLowerCase(), cinema.name));
  return map;
}, new Map());

const analyticsRangeTitles = {
  day: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  year: "Năm nay",
};

const analyticsColors = ["#f7b400", "#38bdf8", "#22c55e", "#f97316", "#a78bfa", "#ef4444"];

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");
const padAnalyticsDatePart = (value) => String(value).padStart(2, "0");
const formatAnalyticsMonthInput = (date = new Date()) =>
  `${date.getFullYear()}-${padAnalyticsDatePart(date.getMonth() + 1)}`;
const normalizeAnalyticsComparable = (value = "") => String(value).trim().toLowerCase();
const normalizeAnalyticsFeedbackRating = (rating) => Math.max(1, Math.min(5, Number(rating) || 1));
const isRevenueBooking = (booking) => booking.paymentStatus !== "refunded";

const parseAnalyticsLocalDate = (value) => {
  const [year, month, day] = String(value || "").split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getAnalyticsRangeSettings = ({ range = "month", date = "", month = "", year = "" } = {}) => {
  const now = new Date();

  if (range === "day") {
    const targetDate = parseAnalyticsLocalDate(date) || now;
    const start = new Date(targetDate);
    const end = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
      start,
      end,
      scopeLabel: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(targetDate),
    };
  }

  if (range === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    return { start, end: now, scopeLabel: analyticsRangeTitles.week };
  }

  if (range === "year") {
    const selectedYear = Number(year) || now.getFullYear();
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    return { start, end, scopeLabel: `Năm ${selectedYear}` };
  }

  const [selectedYear, selectedMonth] = String(month || formatAnalyticsMonthInput(now)).split("-").map(Number);
  const start = new Date(selectedYear || now.getFullYear(), (selectedMonth || now.getMonth() + 1) - 1, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    start,
    end,
    scopeLabel: `Tháng ${padAnalyticsDatePart(start.getMonth() + 1)}/${start.getFullYear()}`,
  };
};

const normalizeAnalyticsCinemaName = (cinemaName = "", roomName = "") => {
  const normalizedName = String(cinemaName || "").trim();
  const matchedCinema = analyticsCinemaCatalog.find(
    (cinema) => cinema.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (matchedCinema) {
    return matchedCinema.name;
  }

  return analyticsRoomToCinemaName.get(String(roomName || "").trim().toLowerCase()) || analyticsCinemaCatalog[0].name;
};

const getAnalyticsRecordDate = (record) => {
  const date = new Date(record?.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isAnalyticsRecordInRange = (record, range, filters = {}) => {
  const date = getAnalyticsRecordDate(record);

  if (!date) {
    return false;
  }

  const { start, end } = getAnalyticsRangeSettings({ range, ...filters });
  return date >= start && date <= end;
};

const addAnalyticsMapValue = (map, key, amount) => {
  const label = key || "Chưa cập nhật";
  map.set(label, (map.get(label) || 0) + Number(amount || 0));
};

const normalizeAnalyticsRows = (items, limit = 6) => {
  const topItems = [...items]
    .sort((first, second) => Number(second.value || 0) - Number(first.value || 0))
    .slice(0, limit);
  const maxValue = Math.max(...topItems.map((item) => Number(item.value || 0)), 1);

  return topItems.map((item, index) => ({
    ...item,
    percent: Math.max(item.value > 0 ? 5 : 0, Math.round((Number(item.value || 0) / maxValue) * 100)),
    color: item.color || analyticsColors[index % analyticsColors.length],
  }));
};

export const buildAdminAnalyticsPayload = ({ bookings = [], movies = [], users = [], feedback = [], range = "month", filters = {} }) => {
  const scopedBookings = bookings.filter((booking) => isAnalyticsRecordInRange(booking, range, filters));
  const scopedFeedback = feedback.filter((item) => isAnalyticsRecordInRange(item, range, filters));
  const paidBookings = scopedBookings.filter(isRevenueBooking);
  const totalRevenue = paidBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  const totalSeats = paidBookings.reduce((sum, booking) => sum + (booking.seatNumbers || []).length, 0);
  const checkedIn = scopedBookings.filter((booking) => booking.status === "used").length;
  const cancelled = scopedBookings.filter((booking) => booking.status === "cancelled").length;

  const byMovie = new Map();
  const byGenre = new Map();
  const byDay = new Map();
  const byMonth = new Map();
  const byStatus = new Map();
  const byPayment = new Map();
  const byCinema = new Map(analyticsCinemaCatalog.map((cinema) => [cinema.name, 0]));
  const byRoom = new Map();
  const bySeatVolume = new Map();
  const byHour = new Map();
  const byWeekday = new Map();
  const byTicketSize = new Map();
  const byPaymentCount = new Map();
  const movieByTitle = new Map(movies.map((movie) => [normalizeAnalyticsComparable(movie.title || movie.name), movie]));

  scopedBookings.forEach((booking) => {
    const revenue = isRevenueBooking(booking) ? Number(booking.totalPrice || 0) : 0;
    const date = getAnalyticsRecordDate(booking);
    const movieTitle = booking.movieTitle || "Phim chưa cập nhật";
    const movie = movieByTitle.get(normalizeAnalyticsComparable(movieTitle));
    const genres = movie?.genres?.length ? movie.genres : ["Chưa phân loại"];

    addAnalyticsMapValue(byMovie, movieTitle, revenue);
    genres.forEach((genre) => addAnalyticsMapValue(byGenre, genre, revenue));
    addAnalyticsMapValue(
      byStatus,
      booking.status === "cancelled"
        ? "Đã hủy (đã thanh toán)"
        : booking.status === "expired"
        ? "Quá hạn (đã thanh toán)"
        : booking.status === "used"
        ? "Đã check-in"
        : "Đã thanh toán",
      1
    );
    addAnalyticsMapValue(byPayment, booking.paymentProvider || booking.paymentMethod || "Mock", revenue);
    addAnalyticsMapValue(byCinema, normalizeAnalyticsCinemaName(booking.cinemaName, booking.roomName), revenue);
    addAnalyticsMapValue(byRoom, booking.roomName || "Chưa rõ phòng", revenue);
    addAnalyticsMapValue(bySeatVolume, normalizeAnalyticsCinemaName(booking.cinemaName, booking.roomName), (booking.seatNumbers || []).length);
    addAnalyticsMapValue(byPaymentCount, booking.paymentProvider || booking.paymentMethod || "Mock", 1);

    if (date) {
      addAnalyticsMapValue(byDay, new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date), revenue);
      addAnalyticsMapValue(byMonth, new Intl.DateTimeFormat("vi-VN", { month: "2-digit", year: "numeric" }).format(date), revenue);
      addAnalyticsMapValue(byWeekday, new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date), revenue);
    }

    const hour = Number(String(booking.displayTime || "").split(":")[0]);
    const slot = Number.isFinite(hour) ? (hour < 12 ? "Sáng" : hour < 18 ? "Chiều" : "Tối") : "Chưa rõ";
    addAnalyticsMapValue(byHour, slot, revenue);

    const seatCount = (booking.seatNumbers || []).length;
    const ticketSize = seatCount <= 1 ? "1 vé" : seatCount === 2 ? "2 vé" : seatCount <= 4 ? "3-4 vé" : "5+ vé";
    addAnalyticsMapValue(byTicketSize, ticketSize, 1);
  });

  const movieRows = normalizeAnalyticsRows([...byMovie.entries()].map(([label, value]) => ({ label, value })), 8);
  const allMovieRows = movies
    .map((movie) => {
      const title = movie.title || movie.name || "Phim chưa cập nhật";
      return {
        id: formatMovieId(movie.legacyId || movie.id),
        label: title,
        value: byMovie.get(title) || 0,
        status: movie.status === "coming-soon" ? "Sắp chiếu" : "Đang chiếu",
        genres: Array.isArray(movie.genres) ? movie.genres.join(", ") : "Chưa cập nhật",
        releaseDate: movie.releaseDate || "Chưa cập nhật",
      };
    })
    .sort((first, second) => Number(second.value || 0) - Number(first.value || 0) || first.label.localeCompare(second.label, "vi"));

  const feedbackRows = normalizeAnalyticsRows(
    [...scopedFeedback.reduce((map, item) => {
      addAnalyticsMapValue(map, item.priorityLabel || item.priority || "Trung bình", 1);
      return map;
    }, new Map()).entries()].map(([label, value]) => ({ label, value })),
    5
  );

  const genreRows = normalizeAnalyticsRows([...byGenre.entries()].map(([label, value]) => ({ label, value })), 8);

  return {
    source: "be-db",
    scopeLabel: getAnalyticsRangeSettings({ range, ...filters }).scopeLabel || analyticsRangeTitles[range] || "Tháng này",
    totalRevenue,
    totalSeats,
    totalBookings: scopedBookings.length,
    paidBookings: paidBookings.length,
    checkedIn,
    cancelled,
    averageOrder: paidBookings.length ? Math.round(totalRevenue / paidBookings.length) : 0,
    movieRows,
    allMovieRows,
    genreRows,
    dailyRows: normalizeAnalyticsRows([...byDay.entries()].map(([label, value]) => ({ label, value })), 10),
    monthlyRows: normalizeAnalyticsRows([...byMonth.entries()].map(([label, value]) => ({ label, value })), 12),
    statusRows: normalizeAnalyticsRows([...byStatus.entries()].map(([label, value]) => ({ label, value })), 4),
    paymentRows: normalizeAnalyticsRows([...byPayment.entries()].map(([label, value]) => ({ label, value })), 5),
    cinemaRows: normalizeAnalyticsRows([...byCinema.entries()].map(([label, value]) => ({ label, value })), 5),
    roomRows: normalizeAnalyticsRows([...byRoom.entries()].map(([label, value]) => ({ label, value })), 8),
    seatVolumeRows: normalizeAnalyticsRows([...bySeatVolume.entries()].map(([label, value]) => ({ label, value })), 5),
    hourRows: normalizeAnalyticsRows([...byHour.entries()].map(([label, value]) => ({ label, value })), 4),
    weekdayRows: normalizeAnalyticsRows([...byWeekday.entries()].map(([label, value]) => ({ label, value })), 7),
    ticketSizeRows: normalizeAnalyticsRows([...byTicketSize.entries()].map(([label, value]) => ({ label, value })), 4),
    paymentCountRows: normalizeAnalyticsRows([...byPaymentCount.entries()].map(([label, value]) => ({ label, value })), 5),
    tierRows: normalizeAnalyticsRows(
      [...users.reduce((map, user) => {
        addAnalyticsMapValue(map, user.membership?.tier || user.status || "Member", 1);
        return map;
      }, new Map()).entries()].map(([label, value]) => ({ label, value })),
      5
    ),
    feedbackRows,
    feedbackStatusRows: normalizeAnalyticsRows(
      [...scopedFeedback.reduce((map, item) => {
        addAnalyticsMapValue(map, item.status || "new", 1);
        return map;
      }, new Map()).entries()].map(([label, value]) => ({ label, value })),
      5
    ),
    feedbackCategoryRows: normalizeAnalyticsRows(
      [...scopedFeedback.reduce((map, item) => {
        addAnalyticsMapValue(map, item.category || "Khác", 1);
        return map;
      }, new Map()).entries()].map(([label, value]) => ({ label, value })),
      6
    ),
    feedbackRatingRows: normalizeAnalyticsRows(
      [...scopedFeedback.reduce((map, item) => {
        addAnalyticsMapValue(map, `${normalizeAnalyticsFeedbackRating(item.rating)} sao`, 1);
        return map;
      }, new Map()).entries()].map(([label, value]) => ({ label, value })),
      5
    ),
    topMovie: movieRows[0],
    topGenre: genreRows[0],
  };
};
