export const moduleConfig = [
  { key: "dashboard", label: "Tổng quan", statusLabel: "Trạng thái" },
  { key: "revenueAnalytics", label: "Thống kê doanh thu", statusLabel: "Giá trị" },
  { key: "movieAnalytics", label: "Thống kê phim", statusLabel: "Giá trị" },
  { key: "genreAnalytics", label: "Thống kê thể loại", statusLabel: "Giá trị" },
  { key: "cinemaAnalytics", label: "Thống kê rạp", statusLabel: "Giá trị" },
  { key: "timeAnalytics", label: "Thống kê khung giờ", statusLabel: "Giá trị" },
  { key: "paymentAnalytics", label: "Thống kê thanh toán", statusLabel: "Giá trị" },
  { key: "customerAnalytics", label: "Thống kê khách hàng", statusLabel: "Giá trị" },
  { key: "feedbackAnalytics", label: "Thống kê góp ý", statusLabel: "Giá trị" },
  { key: "movies", label: "Phim", statusLabel: "Trạng thái" },
  { key: "promotions", label: "Ưu đãi", statusLabel: "Hạng / loại" },
  { key: "showtimes", label: "Suất chiếu", statusLabel: "Giờ chiếu" },
  { key: "cinemas", label: "Rạp / phòng", statusLabel: "Trạng thái" },
  { key: "users", label: "Người dùng", statusLabel: "Vai trò" },
  { key: "orders", label: "Vé / đơn đặt", statusLabel: "Thanh toán" },
  { key: "payments", label: "Thanh toán", statusLabel: "Trạng thái" },
  { key: "checkin", label: "Check-in vé", statusLabel: "Trạng thái" },
  { key: "feedback", label: "Góp ý", statusLabel: "Xử lý" },
  { key: "trash", label: "Thùng rác", statusLabel: "Đã xóa" },
  { key: "activity", label: "Nhật ký", statusLabel: "Hành động" },
];


export const adminNavGroups = [
  { key: "overview", label: "Tổng quan", items: [{ key: "dashboard", label: "Tổng quan" }] },
  {
    key: "analytics",
    label: "Thống kê",
    items: [
      { key: "revenueAnalytics", label: "Doanh thu" },
      { key: "movieAnalytics", label: "Theo phim" },
      { key: "genreAnalytics", label: "Theo thể loại" },
      { key: "cinemaAnalytics", label: "Theo rạp" },
      { key: "timeAnalytics", label: "Khung giờ" },
      { key: "paymentAnalytics", label: "Thanh toán" },
      { key: "customerAnalytics", label: "Khách hàng" },
      { key: "feedbackAnalytics", label: "Góp ý" },
    ],
  },
  {
    key: "content",
    label: "Nội dung",
    items: [
      { key: "movies", label: "Phim" },
      { key: "promotions", label: "Ưu đãi" },
      { key: "showtimes", label: "Suất chiếu" },
    ],
  },
  {
    key: "cinema",
    label: "Vận hành rạp",
    items: [
      { key: "cinemas", label: "Rạp / phòng" },
      { key: "checkin", label: "Check-in vé" },
    ],
  },
  {
    key: "business",
    label: "Kinh doanh",
    items: [
      { key: "orders", label: "Vé / đơn đặt" },
      { key: "payments", label: "Thanh toán" },
    ],
  },
  {
    key: "customers",
    label: "Khách hàng",
    items: [
      { key: "users", label: "Người dùng" },
      { key: "feedback", label: "Góp ý" },
    ],
  },
  {
    key: "system",
    label: "Hệ thống",
    items: [
      { key: "trash", label: "Thùng rác" },
      { key: "activity", label: "Nhật ký" },
    ],
  },
];
export const ADMIN_MODULE_STORAGE_KEY = "cinesky-admin-active-module";
export const analyticsModuleKeys = new Set([
  "revenueAnalytics",
  "movieAnalytics",
  "genreAnalytics",
  "cinemaAnalytics",
  "timeAnalytics",
  "paymentAnalytics",
  "customerAnalytics",
  "feedbackAnalytics",
]);
export const adminModuleKeys = new Set(moduleConfig.map((module) => module.key));

export const getInitialAdminModule = () => {
  if (typeof window === "undefined") {
    return "movies";
  }

  const urlModule = new URLSearchParams(window.location.search).get("module");
  const storedModule = window.localStorage.getItem(ADMIN_MODULE_STORAGE_KEY);
  const preferredModule = urlModule || storedModule;

  return adminModuleKeys.has(preferredModule) ? preferredModule : "movies";
};

export const initialData = {
  movies: [
    { id: "MV001", name: "Song Hỷ Lâm Nguy", status: "Đang chiếu", time: "20/04/2026", value: "128 vé" },
    { id: "MV002", name: "Mưa Đỏ", status: "Đang chiếu", time: "22/08/2025", value: "96 vé" },
    { id: "MV003", name: "Cải Mả", status: "Đang chiếu", time: "31/10/2025", value: "74 vé" },
    { id: "MV004", name: "Supergirl", status: "Sắp chiếu", time: "26/06/2026", value: "42 quan tâm" },
  ],
  promotions: [
    { id: "PR001", name: "Silver Movie Night", status: "Silver", time: "Đang áp dụng", value: "Giảm 15%" },
    { id: "PR002", name: "Gold Combo Plus", status: "Gold", time: "Đang áp dụng", value: "Combo 69K" },
    { id: "PR003", name: "Diamond Premiere", status: "Diamond", time: "Theo tháng sinh nhật", value: "1 vé miễn phí" },
    { id: "PR004", name: "Hot voucher online", status: "Voucher", time: "Hóa đơn từ 199K", value: "Giảm 30K" },
  ],
  showtimes: [
    { id: "ST001", name: "Song Hỷ - Phòng 01", status: "20:40", time: "05/05/2026", value: "83% ghế" },
    { id: "ST002", name: "Mưa Đỏ - Phòng 02", status: "18:20", time: "05/05/2026", value: "69% ghế" },
    { id: "ST003", name: "Cải Mả - Phòng 03", status: "21:30", time: "05/05/2026", value: "77% ghế" },
  ],
  cinemas: [
    { id: "RM001", name: "CineSky Nguyen Hue - Sky Hall 1", status: "Hoạt động", time: "196 ghế", value: "4K Laser" },
    { id: "RM002", name: "CineSky Hai Ba Trung - Moon Hall", status: "Hoạt động", time: "216 ghế", value: "Dolby Atmos" },
    { id: "RM003", name: "CineSky Dien Bien Phu - Nova Hall", status: "Hoạt động", time: "304 ghế", value: "Standard" },
  ],
  users: [
    { id: "US001", name: "Nguyễn Minh Anh", status: "Member", time: "05/05/2026", value: "3 đơn" },
    { id: "US002", name: "Trần Hoàng Long", status: "Admin", time: "04/05/2026", value: "12 thao tác" },
    { id: "US003", name: "Lê Hà My", status: "Member", time: "03/05/2026", value: "1 đơn" },
  ],
  orders: [
    { id: "OD001", name: "2 vé Song Hỷ Lâm Nguy", status: "Đã thanh toán", time: "05/05/2026", value: "180.000đ" },
    { id: "OD002", name: "4 vé Mưa Đỏ", status: "Chờ thanh toán", time: "05/05/2026", value: "360.000đ" },
    { id: "OD003", name: "1 vé Cải Mả", status: "Đã hủy", time: "04/05/2026", value: "90.000đ" },
  ],
  payments: [
    { id: "PM001", name: "VNPay - OD001", status: "VNPay", time: "05/05/2026", value: "Thành công" },
    { id: "PM002", name: "Momo - OD002", status: "Momo", time: "05/05/2026", value: "Đang xử lý" },
    { id: "PM003", name: "Tiền mặt - OD003", status: "Counter", time: "04/05/2026", value: "Đã hủy" },
  ],
  checkin: [],
  feedback: [],
  trash: [],
  activity: [
    { id: "LOG001", name: "Cập nhật phim Mưa Đỏ", status: "UPDATE", time: "05/05/2026", value: "Sửa lịch chiếu và trạng thái" },
    { id: "LOG002", name: "Thêm suất chiếu Song Hỷ", status: "CREATE", time: "05/05/2026", value: "Phòng 01 • 20:40" },
    { id: "LOG003", name: "Xóa đơn OD003", status: "DELETE", time: "04/05/2026", value: "Đơn đã hủy" },
  ],
};

export const createEmptyAdminData = () =>
  Object.keys(initialData).reduce(
    (data, key) => ({
      ...data,
      [key]: [],
    }),
    {}
  );

export const readOnlyModules = new Set(
  moduleConfig.map((module) => module.key).filter((key) => !["movies", "promotions"].includes(key))
);
export const initialRevenueTrend = [0, 0, 0, 0, 0, 0, 0];
export const initialMovieRevenue = [];
export const initialPaymentState = [
  { label: "Đã thanh toán", value: 0, color: "#f7b400" },
  { label: "Đã hủy", value: 0, color: "#ef4444" },
];

export const feedbackStatusOptions = [
  { value: "new", label: "Mới" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "responded", label: "Đã phản hồi" },
  { value: "closed", label: "Đã đóng" },
];

export const feedbackCategoryOptions = [
  { value: "booking_issue", label: "Lỗi đặt vé" },
  { value: "payment", label: "Thanh toán" },
  { value: "interface", label: "Giao diện" },
  { value: "movie_showtime", label: "Phim / suất chiếu" },
  { value: "cinema_service", label: "Dịch vụ rạp" },
  { value: "other", label: "Khác" },
];

export const feedbackPriorityOptions = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

export const feedbackDateFilters = {
  all: 0,
  today: 1,
  week: 7,
  month: 30,
};

export const getOptionLabel = (options, value) => options.find((item) => item.value === value)?.label || value || "";
export const normalizeFeedbackRating = (rating) => Math.max(1, Math.min(5, Number(rating) || 1));

export const getAdminStatusTone = (status = "") => {
  const value = String(status || "").trim().toLowerCase();

  if (!value) {
    return "neutral";
  }

  if (value.includes("hủy") || value.includes("cancel") || value.includes("deleted") || value.includes("xóa") || value.includes("spam") || value.includes("lỗi")) {
    return "danger";
  }

  if (value.includes("chờ") || value.includes("pending") || value.includes("đang") || value.includes("in_progress") || value.includes("processing") || value.includes("upcoming") || value.includes("sắp")) {
    return "warning";
  }

  if (value.includes("paid") || value.includes("thanh toán") || value.includes("thành công") || value.includes("check-in") || value.includes("used") || value.includes("hoạt động") || value.includes("responded") || value.includes("đã phản hồi")) {
    return "success";
  }

  if (value.includes("admin") || value.includes("quản trị") || value.includes("role") || value.includes("create") || value.includes("update")) {
    return "info";
  }

  if (value.includes("member") || value.includes("user") || value.includes("mock")) {
    return "purple";
  }

  if (value.includes("closed") || value.includes("đã đóng") || value.includes("not updated")) {
    return "neutral";
  }

  return "default";
};

export const dateRangeLabels = {
  day: "hôm nay",
  week: "tuần này",
  month: "tháng này",
  year: "năm nay",
};

export const dateRangeTitles = {
  day: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  year: "Năm nay",
};

export const padDatePart = (value) => String(value).padStart(2, "0");

export const formatDateInput = (date = new Date()) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

export const formatMonthInput = (date = new Date()) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`;

export const getCurrentYearInput = () => String(new Date().getFullYear());

export const parseLocalDateInput = (value) => {
  const [year, month, day] = String(value || "").split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAnalyticsRangeSettings = ({ range = "month", date = "", month = "", year = "" } = {}) => {
  const now = new Date();

  if (range === "day") {
    const targetDate = parseLocalDateInput(date) || now;
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

    return { start, end: now, scopeLabel: "Tuần này" };
  }

  if (range === "year") {
    const selectedYear = Number(year) || now.getFullYear();
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    return { start, end, scopeLabel: `Năm ${selectedYear}` };
  }

  const [selectedYear, selectedMonth] = String(month || formatMonthInput(now)).split("-").map(Number);
  const start = new Date(selectedYear || now.getFullYear(), (selectedMonth || now.getMonth() + 1) - 1, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    start,
    end,
    scopeLabel: `Tháng ${padDatePart(start.getMonth() + 1)}/${start.getFullYear()}`,
  };
};

export const chartColors = ["#f7b400", "#38bdf8", "#22c55e", "#f97316", "#a78bfa", "#ef4444"];

export const cinemaCatalog = [
  { name: "CineSky Nguyen Hue", rooms: ["Sky Hall 1", "Sky Hall 2"] },
  { name: "CineSky Hai Ba Trung", rooms: ["Moon Hall", "Galaxy Hall"] },
  { name: "CineSky Dien Bien Phu", rooms: ["Nova Hall", "Aurora Hall"] },
];

export const defaultCinemaName = cinemaCatalog[0].name;
export const roomToCinemaName = cinemaCatalog.reduce((map, cinema) => {
  cinema.rooms.forEach((room) => map.set(room.toLowerCase(), cinema.name));
  return map;
}, new Map());

export const normalizeCinemaName = (cinemaName = "", roomName = "") => {
  const normalizedName = String(cinemaName || "").trim();
  const matchedCinema = cinemaCatalog.find((cinema) => cinema.name.toLowerCase() === normalizedName.toLowerCase());

  if (matchedCinema) {
    return matchedCinema.name;
  }

  const matchedByRoom = roomToCinemaName.get(String(roomName || "").trim().toLowerCase());
  return matchedByRoom || defaultCinemaName;
};

export const polarToCartesian = (center, radius, angle) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
};

export const createPieSlicePath = (startAngle, endAngle) => {
  const center = 60;
  const radius = 50;
  const start = polarToCartesian(center, radius, startAngle);
  const end = polarToCartesian(center, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

export const getSliceOffset = (startAngle, endAngle) => {
  const middle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
  return {
    x: `${Math.cos(middle) * 8}px`,
    y: `${Math.sin(middle) * 8}px`,
  };
};

export const createEmptyForm = () => ({ id: "", name: "", status: "", time: "", value: "" });
export const createMovieForm = () => ({
  id: "",
  title: "",
  poster: "",
  genres: "",
  country: "",
  director: "",
  duration: "",
  rating: "P",
  status: "now-showing",
  releaseDate: "",
  trailer: "",
  description: "",
  cast: "",
  gallery: "",
  trailerFacts: "",
  trailerPanelLabel: "Thông tin nhanh",
  trailerPanelTitle: "",
  trailerPanelDescription: "",
  showtimes: "",
  catalogOrder: "999",
  heroOrder: "",
});

export const movieSuggestions = {
  genres: ["Hành động", "Tình cảm", "Hài", "Kinh dị", "Hoạt hình", "Phiêu lưu", "Tâm lý", "Gia đình"],
  country: ["Việt Nam", "Mỹ", "Hàn Quốc", "Nhật Bản", "Trung Quốc", "Thái Lan"],
  rating: ["P", "K", "T13", "T16", "T18", "C18"],
  showtimes: ["09:30", "11:45", "14:00", "16:20", "18:30", "20:45", "22:30"],
};

export const formatAdminDateTime = (value) => {
  if (!value) {
    return "Not updated";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const buildDashboardCharts = (bookings = []) => {
  const dailyRevenue = Array(7).fill(0);
  const revenueByMovie = new Map();
  const totalBookings = bookings.length;
  let cancelledCount = 0;

  bookings.forEach((booking) => {
    const revenue = Number(booking.totalPrice || 0);
    const isCancelled = booking.status === "cancelled";
    const createdAt = new Date(booking.createdAt);
    const dayIndex = Number.isNaN(createdAt.getTime())
      ? 6
      : Math.min(6, Math.max(0, 6 - Math.floor((Date.now() - createdAt.getTime()) / 86400000)));
    const movieTitle = booking.movieTitle || "Movie ticket";

    if (!isCancelled) {
      dailyRevenue[dayIndex] += revenue;
      revenueByMovie.set(movieTitle, (revenueByMovie.get(movieTitle) || 0) + revenue);
    }

    if (isCancelled) {
      cancelledCount += 1;
    }
  });

  const maxDailyRevenue = Math.max(...dailyRevenue, 1);
  const maxMovieRevenue = Math.max(...revenueByMovie.values(), 1);

  return {
    revenueTrend: dailyRevenue.map((value) => Math.round((value / maxDailyRevenue) * 100)),
    movieRevenue: [...revenueByMovie.entries()]
      .sort((first, second) => second[1] - first[1])
      .slice(0, 4)
      .map(([label, value]) => ({
        label,
        value: Math.max(4, Math.round((value / maxMovieRevenue) * 100)),
      })),
    paymentState: [
      {
        label: "Đã thanh toán",
        value: totalBookings ? Math.round(((totalBookings - cancelledCount) / totalBookings) * 100) : 0,
        color: "#f7b400",
      },
      {
        label: "Đã hủy",
        value: totalBookings ? Math.round((cancelledCount / totalBookings) * 100) : 0,
        color: "#ef4444",
      },
    ],
  };
};

export const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export const getBookingDate = (booking) => {
  const date = new Date(booking?.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isRecordInAnalyticsRange = (record, range, filters = {}) => {
  const date = getBookingDate(record);

  if (!date) {
    return false;
  }

  const { start, end } = getAnalyticsRangeSettings({ range, ...filters });
  return date >= start && date <= end;
};

export const isBookingInRange = (booking, range, filters = {}) => {
  const date = getBookingDate(booking);

  if (!date) {
    return false;
  }

  const { start, end } = getAnalyticsRangeSettings({ range, ...filters });
  return date >= start && date <= end;
};

export const normalizeChartRows = (items, limit = 6) => {
  const topItems = [...items]
    .sort((first, second) => Number(second.value || 0) - Number(first.value || 0))
    .slice(0, limit);
  const maxValue = Math.max(...topItems.map((item) => Number(item.value || 0)), 1);

  return topItems.map((item, index) => ({
    ...item,
    percent: Math.max(item.value > 0 ? 5 : 0, Math.round((Number(item.value || 0) / maxValue) * 100)),
    color: item.color || chartColors[index % chartColors.length],
  }));
};

export const addMapValue = (map, key, amount) => {
  const label = key || "Chưa cập nhật";
  map.set(label, (map.get(label) || 0) + Number(amount || 0));
};

export const findMovieByTitle = (movies, title) =>
  movies.find((movie) => normalizeComparable(movie.title || movie.name) === normalizeComparable(title));

export const buildAnalyticsData = ({ bookings = [], movies = [], users = [], feedback = [], range = "month", filters = {} }) => {
  const scopedBookings = bookings.filter((booking) => isBookingInRange(booking, range, filters));
  const scopedFeedback = feedback.filter((item) => isRecordInAnalyticsRange(item, range, filters));
  const paidBookings = scopedBookings.filter((booking) => booking.status !== "cancelled");
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
  const byCinema = new Map(cinemaCatalog.map((cinema) => [cinema.name, 0]));
  const byRoom = new Map();
  const bySeatVolume = new Map();
  const byHour = new Map();
  const byWeekday = new Map();
  const byTicketSize = new Map();
  const byPaymentCount = new Map();

  scopedBookings.forEach((booking) => {
    const revenue = booking.status === "cancelled" ? 0 : Number(booking.totalPrice || 0);
    const date = getBookingDate(booking);
    const movieTitle = booking.movieTitle || "Phim chưa cập nhật";
    const movie = findMovieByTitle(movies, movieTitle);
    const genres = movie?.genres?.length ? movie.genres : ["Chưa phân loại"];

    addMapValue(byMovie, movieTitle, revenue);
    genres.forEach((genre) => addMapValue(byGenre, genre, revenue));
    addMapValue(byStatus, booking.status === "cancelled" ? "Đã hủy" : booking.status === "used" ? "Đã check-in" : "Đã thanh toán", 1);
    addMapValue(byPayment, booking.paymentProvider || booking.paymentMethod || "Mock", revenue);
    addMapValue(byCinema, normalizeCinemaName(booking.cinemaName, booking.roomName), revenue);
    addMapValue(byRoom, booking.roomName || "Chưa rõ phòng", revenue);
    addMapValue(bySeatVolume, normalizeCinemaName(booking.cinemaName, booking.roomName), (booking.seatNumbers || []).length);
    addMapValue(byPaymentCount, booking.paymentProvider || booking.paymentMethod || "Mock", 1);

    if (date) {
      addMapValue(
        byDay,
        new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date),
        revenue
      );
      addMapValue(
        byMonth,
        new Intl.DateTimeFormat("vi-VN", { month: "2-digit", year: "numeric" }).format(date),
        revenue
      );
      addMapValue(
        byWeekday,
        new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
        revenue
      );
    }

    const hour = Number(String(booking.displayTime || "").split(":")[0]);
    const slot = Number.isFinite(hour)
      ? hour < 12
        ? "Sáng"
        : hour < 18
          ? "Chiều"
          : "Tối"
      : "Chưa rõ";
    addMapValue(byHour, slot, revenue);

    const seatCount = (booking.seatNumbers || []).length;
    const ticketSize = seatCount <= 1 ? "1 vé" : seatCount === 2 ? "2 vé" : seatCount <= 4 ? "3-4 vé" : "5+ vé";
    addMapValue(byTicketSize, ticketSize, 1);
  });

  const genreRows = normalizeChartRows([...byGenre.entries()].map(([label, value]) => ({ label, value })), 8);
  const movieRows = normalizeChartRows([...byMovie.entries()].map(([label, value]) => ({ label, value })), 8);
  const dailyRows = normalizeChartRows([...byDay.entries()].map(([label, value]) => ({ label, value })), 10);
  const monthlyRows = normalizeChartRows([...byMonth.entries()].map(([label, value]) => ({ label, value })), 12);
  const statusRows = normalizeChartRows([...byStatus.entries()].map(([label, value]) => ({ label, value })), 4);
  const paymentRows = normalizeChartRows([...byPayment.entries()].map(([label, value]) => ({ label, value })), 5);
  const cinemaRows = normalizeChartRows([...byCinema.entries()].map(([label, value]) => ({ label, value })), 5);
  const roomRows = normalizeChartRows([...byRoom.entries()].map(([label, value]) => ({ label, value })), 8);
  const seatVolumeRows = normalizeChartRows([...bySeatVolume.entries()].map(([label, value]) => ({ label, value })), 5);
  const hourRows = normalizeChartRows([...byHour.entries()].map(([label, value]) => ({ label, value })), 4);
  const weekdayRows = normalizeChartRows([...byWeekday.entries()].map(([label, value]) => ({ label, value })), 7);
  const ticketSizeRows = normalizeChartRows([...byTicketSize.entries()].map(([label, value]) => ({ label, value })), 4);
  const paymentCountRows = normalizeChartRows([...byPaymentCount.entries()].map(([label, value]) => ({ label, value })), 5);
  const tierRows = normalizeChartRows(
    [...users.reduce((map, user) => {
      addMapValue(map, user.membership?.tier || user.status || "Member", 1);
      return map;
    }, new Map()).entries()].map(([label, value]) => ({ label, value })),
    5
  );
  const feedbackRows = normalizeChartRows(
    [...scopedFeedback.reduce((map, item) => {
      addMapValue(map, item.priorityLabel || item.priority || "Trung bình", 1);
      return map;
    }, new Map()).entries()].map(([label, value]) => ({ label, value })),
    5
  );
  const feedbackStatusRows = normalizeChartRows(
    [...scopedFeedback.reduce((map, item) => {
      addMapValue(map, item.status || item.statusKey || "new", 1);
      return map;
    }, new Map()).entries()].map(([label, value]) => ({ label, value })),
    5
  );
  const feedbackCategoryRows = normalizeChartRows(
    [...scopedFeedback.reduce((map, item) => {
      addMapValue(map, item.categoryLabel || item.category || "Khác", 1);
      return map;
    }, new Map()).entries()].map(([label, value]) => ({ label, value })),
    6
  );
  const feedbackRatingRows = normalizeChartRows(
    [...scopedFeedback.reduce((map, item) => {
      addMapValue(map, `${normalizeFeedbackRating(item.rating)} sao`, 1);
      return map;
    }, new Map()).entries()].map(([label, value]) => ({ label, value })),
    5
  );
  const allMovieRows = movies
    .map((movie) => {
      const title = movie.title || movie.name || "Phim chưa cập nhật";
      return {
        id: movie.id,
        label: title,
        value: byMovie.get(title) || 0,
        status: movie.status === "Coming soon" || movie.status === "coming-soon" ? "Sắp chiếu" : "Đang chiếu",
        genres: Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.value || "Chưa cập nhật",
        releaseDate: movie.releaseDate || movie.time || "Chưa cập nhật",
      };
    })
    .sort((first, second) => Number(second.value || 0) - Number(first.value || 0) || first.label.localeCompare(second.label, "vi"));

  return {
    scopeLabel: getAnalyticsRangeSettings({ range, ...filters }).scopeLabel || dateRangeTitles[range] || "Tháng này",
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
    dailyRows,
    monthlyRows,
    statusRows,
    paymentRows,
    cinemaRows,
    roomRows,
    seatVolumeRows,
    hourRows,
    weekdayRows,
    ticketSizeRows,
    paymentCountRows,
    tierRows,
    feedbackRows,
    feedbackStatusRows,
    feedbackCategoryRows,
    feedbackRatingRows,
    topMovie: movieRows[0],
    topGenre: genreRows[0],
  };
};

export const joinList = (items = []) => (Array.isArray(items) ? items.join(", ") : "");

export const joinKeyValueLines = (items = [], keyName = "label", valueName = "value") =>
  Array.isArray(items)
    ? items.map((item) => `${item?.[keyName] || ""}: ${item?.[valueName] || ""}`.trim()).join("\n")
    : "";

export const mapMovieToRecord = (movie) => ({
  ...movie,
  id: String(movie.id),
  name: movie.title,
  status: movie.status === "coming-soon" ? "Coming soon" : "Now showing",
  time: movie.releaseDate || movie.release || "Not updated",
  value: `${movie.rating || "P"} • ${movie.duration || 0} min • ${(movie.genres || []).join(", ")}`,
});

export const mapDeletedMovieToRecord = (movie) => ({
  ...mapMovieToRecord(movie),
  status: "Deleted",
  time: formatAdminDateTime(movie.deletedAt),
  value: `Deleted movie • ${movie.rating || "P"} • ${movie.duration || 0} min`,
  deletedMovie: movie,
});

export const mapFeedbackToRecord = (feedback) => ({
  ...feedback,
  id: String(feedback.id),
  name: `${feedback.fullName || "Người dùng"} - ${feedback.headline || "Góp ý"}`,
  status: getOptionLabel(feedbackStatusOptions, feedback.status || "new"),
  statusKey: feedback.status || "new",
  statusTone: `feedback-${feedback.status || "new"}`,
  categoryLabel: getOptionLabel(feedbackCategoryOptions, feedback.category || "other"),
  priorityLabel: getOptionLabel(feedbackPriorityOptions, feedback.priority || "medium"),
  time: formatAdminDateTime(feedback.createdAt),
  rating: normalizeFeedbackRating(feedback.rating),
  value: `${normalizeFeedbackRating(feedback.rating)}/5 - ${feedback.email || "No email"}`,
});

export const mapMovieToForm = (movie) => ({
  id: String(movie.id || ""),
  title: movie.title || "",
  poster: movie.poster || "",
  genres: joinList(movie.genres),
  country: movie.country || "",
  director: movie.director || "",
  duration: String(movie.duration || ""),
  rating: movie.rating || "P",
  status: movie.status || "now-showing",
  releaseDate: movie.releaseDate || movie.release || "",
  trailer: movie.trailer || "",
  description: movie.description || "",
  cast: joinKeyValueLines(movie.cast, "name", "role"),
  gallery: joinList(movie.gallery),
  trailerFacts: joinKeyValueLines(movie.trailerFacts),
  trailerPanelLabel: movie.trailerPanel?.label || "Thông tin nhanh",
  trailerPanelTitle: movie.trailerPanel?.title || movie.title || "",
  trailerPanelDescription: movie.trailerPanel?.description || "",
  showtimes: joinList(movie.showtimes || movie.times),
  catalogOrder: String(movie.catalogOrder ?? 999),
  heroOrder: movie.heroOrder === null || movie.heroOrder === undefined ? "" : String(movie.heroOrder),
});

export const splitList = (value = "") =>
  String(value)
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

export const normalizeComparable = (value = "") => String(value).trim().toLowerCase();

export const requiredMovieFields = [
  ["title", "tên phim"],
  ["poster", "ảnh poster"],
  ["trailer", "link trailer"],
  ["description", "mô tả"],
  ["genres", "thể loại"],
  ["country", "quốc gia"],
  ["director", "đạo diễn"],
  ["duration", "thời lượng"],
  ["releaseDate", "ngày khởi chiếu"],
];

export const validateMovieForm = (form, movies = [], editingId = "") => {
  const missingField = requiredMovieFields.find(([key]) => !String(form[key] || "").trim());

  if (missingField) {
    return `Không được để trống ${missingField[1]}.`;
  }

  if (Number(form.duration) <= 0) {
    return "Thời lượng phải lớn hơn 0.";
  }

  const duplicatedMovie = movies.find(
    (movie) =>
      movie.id !== editingId &&
      (normalizeComparable(movie.title || movie.name) === normalizeComparable(form.title) ||
        (form.id && String(movie.id) === String(form.id)))
  );

  if (duplicatedMovie) {
    return `Phim "${duplicatedMovie.title || duplicatedMovie.name}" đã tồn tại.`;
  }

  return "";
};

export const movieFormToPayload = (form) => ({
  legacyId: form.id ? Number(form.id) : undefined,
  title: form.title,
  poster: form.poster,
  genres: splitList(form.genres),
  country: form.country,
  director: form.director,
  duration: Number(form.duration) || 0,
  rating: form.rating,
  status: form.status,
  releaseDate: form.releaseDate,
  trailer: form.trailer,
  description: form.description,
  cast: form.cast,
  gallery: splitList(form.gallery),
  trailerFacts: form.trailerFacts,
  trailerPanel: {
    label: form.trailerPanelLabel,
    title: form.trailerPanelTitle || form.title,
    description: form.trailerPanelDescription,
  },
  showtimes: splitList(form.showtimes),
  catalogOrder: Number(form.catalogOrder) || 999,
  heroOrder: form.heroOrder === "" ? null : Number(form.heroOrder),
});

export const formatDetailValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" ? Object.values(item).filter(Boolean).join(": ") : item))
      .join(", ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean).join(" • ");
  }

  return value ?? "";
};
