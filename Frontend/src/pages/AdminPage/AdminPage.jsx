import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  createAdminMovie,
  checkInAdminTicket,
  deleteAdminMovie,
  getAdminActivity,
  getAdminBookings,
  getAdminDeletedMovies,
  getAdminFeedback,
  getAdminOverview,
  getAdminUsers,
  lookupAdminTicket,
  getMovieById,
  getMovies,
  restoreAdminMovie,
  searchAdminTmdbMovie,
  updateAdminFeedback,
  updateAdminUserRole,
  updateAdminMovie,
  uploadAdminPoster,
} from "../../services/movieService";
import "./AdminPage.css";

const moduleConfig = [
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


const adminNavGroups = [
  { key: "overview", label: "Tổng quan", items: [{ key: "dashboard", label: "Dashboard" }] },
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
const ADMIN_MODULE_STORAGE_KEY = "cinesky-admin-active-module";
const adminModuleKeys = new Set(["dashboard", ...moduleConfig.map((module) => module.key)]);

const getInitialAdminModule = () => {
  if (typeof window === "undefined") {
    return "movies";
  }

  const urlModule = new URLSearchParams(window.location.search).get("module");
  const storedModule = window.localStorage.getItem(ADMIN_MODULE_STORAGE_KEY);
  const preferredModule = urlModule || storedModule;

  return adminModuleKeys.has(preferredModule) ? preferredModule : "movies";
};

const initialData = {
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
    { id: "RM001", name: "CineSky Quốc Thanh - P01", status: "Hoạt động", time: "120 ghế", value: "4K Laser" },
    { id: "RM002", name: "CineSky Hai Bà Trưng - P02", status: "Bảo trì", time: "96 ghế", value: "Dolby Atmos" },
    { id: "RM003", name: "CineSky Sinh Viên - P03", status: "Hoạt động", time: "108 ghế", value: "Standard" },
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

const createEmptyAdminData = () =>
  Object.keys(initialData).reduce(
    (data, key) => ({
      ...data,
      [key]: [],
    }),
    {}
  );

const readOnlyModules = new Set(
  moduleConfig.map((module) => module.key).filter((key) => !["movies", "promotions", "trash", "activity"].includes(key))
);
const initialRevenueTrend = [0, 0, 0, 0, 0, 0, 0];
const initialMovieRevenue = [];
const initialPaymentState = [
  { label: "Đã thanh toán", value: 0, color: "#f7b400" },
  { label: "Đã hủy", value: 0, color: "#ef4444" },
];

const feedbackStatusOptions = [
  { value: "new", label: "Mới" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "responded", label: "Đã phản hồi" },
  { value: "closed", label: "Đã đóng" },
];

const feedbackCategoryOptions = [
  { value: "booking_issue", label: "Lỗi đặt vé" },
  { value: "payment", label: "Thanh toán" },
  { value: "interface", label: "Giao diện" },
  { value: "movie_showtime", label: "Phim / suất chiếu" },
  { value: "cinema_service", label: "Dịch vụ rạp" },
  { value: "other", label: "Khác" },
];

const feedbackPriorityOptions = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

const feedbackDateFilters = {
  all: 0,
  today: 1,
  week: 7,
  month: 30,
};

const getOptionLabel = (options, value) => options.find((item) => item.value === value)?.label || value || "";
const normalizeFeedbackRating = (rating) => Math.max(1, Math.min(5, Number(rating) || 1));

const dateRangeLabels = {
  day: "hôm nay",
  week: "tuần này",
  month: "tháng này",
  year: "năm nay",
};

const polarToCartesian = (center, radius, angle) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
};

const createPieSlicePath = (startAngle, endAngle) => {
  const center = 60;
  const radius = 50;
  const start = polarToCartesian(center, radius, startAngle);
  const end = polarToCartesian(center, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

const getSliceOffset = (startAngle, endAngle) => {
  const middle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
  return {
    x: `${Math.cos(middle) * 8}px`,
    y: `${Math.sin(middle) * 8}px`,
  };
};

const createEmptyForm = () => ({ id: "", name: "", status: "", time: "", value: "" });
const createMovieForm = () => ({
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

const movieSuggestions = {
  genres: ["Hành động", "Tình cảm", "Hài", "Kinh dị", "Hoạt hình", "Phiêu lưu", "Tâm lý", "Gia đình"],
  country: ["Việt Nam", "Mỹ", "Hàn Quốc", "Nhật Bản", "Trung Quốc", "Thái Lan"],
  rating: ["P", "K", "T13", "T16", "T18", "C18"],
  showtimes: ["09:30", "11:45", "14:00", "16:20", "18:30", "20:45", "22:30"],
};

const formatAdminDateTime = (value) => {
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

const buildDashboardCharts = (bookings = []) => {
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

const joinList = (items = []) => (Array.isArray(items) ? items.join(", ") : "");

const joinKeyValueLines = (items = [], keyName = "label", valueName = "value") =>
  Array.isArray(items)
    ? items.map((item) => `${item?.[keyName] || ""}: ${item?.[valueName] || ""}`.trim()).join("\n")
    : "";

const mapMovieToRecord = (movie) => ({
  ...movie,
  id: String(movie.id),
  name: movie.title,
  status: movie.status === "coming-soon" ? "Coming soon" : "Now showing",
  time: movie.releaseDate || movie.release || "Not updated",
  value: `${movie.rating || "P"} • ${movie.duration || 0} min • ${(movie.genres || []).join(", ")}`,
});

const mapDeletedMovieToRecord = (movie) => ({
  ...mapMovieToRecord(movie),
  status: "Deleted",
  time: formatAdminDateTime(movie.deletedAt),
  value: `Deleted movie • ${movie.rating || "P"} • ${movie.duration || 0} min`,
  deletedMovie: movie,
});

const mapFeedbackToRecord = (feedback) => ({
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

const mapMovieToForm = (movie) => ({
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

const splitList = (value = "") =>
  String(value)
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeComparable = (value = "") => String(value).trim().toLowerCase();

const requiredMovieFields = [
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

const validateMovieForm = (form, movies = [], editingId = "") => {
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

const movieFormToPayload = (form) => ({
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

const formatDetailValue = (value) => {
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

export default function AdminPage() {
  const [activeModule, setActiveModule] = useState(getInitialAdminModule);
  const [records, setRecords] = useState(createEmptyAdminData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState("all");
  const [feedbackDateFilter, setFeedbackDateFilter] = useState("all");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(createMovieForm);
  const [editingId, setEditingId] = useState("");
  const [isCrudMode, setIsCrudMode] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [feedbackDraft, setFeedbackDraft] = useState({
    status: "new",
    category: "other",
    priority: "medium",
    adminNote: "",
    response: "",
  });
  const [formError, setFormError] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [activePaymentLabel, setActivePaymentLabel] = useState("");
  const confirmResolverRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isPosterUploading, setIsPosterUploading] = useState(false);
  const [isTmdbSyncing, setIsTmdbSyncing] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketLookup, setTicketLookup] = useState(null);
  const [ticketMessage, setTicketMessage] = useState("");
  const [isTicketChecking, setIsTicketChecking] = useState(false);
  const [revenueTrend, setRevenueTrend] = useState(initialRevenueTrend);
  const [movieRevenue, setMovieRevenue] = useState(initialMovieRevenue);
  const [paymentState, setPaymentState] = useState(initialPaymentState);
  const [dashboardStats, setDashboardStats] = useState([
    { label: "Người dùng", value: "0", helper: "Đồng bộ từ database" },
    { label: "Vé đã đặt", value: "0", helper: "Đơn vé đã lưu" },
    { label: "Doanh thu", value: "0", helper: "Tổng tiền vé hợp lệ" },
    { label: "Suất chiếu", value: "0", helper: "Lịch chiếu đang có" },
    { label: "Phim đang chiếu", value: "0", helper: "Catalog hoạt động" },
    { label: "Phim sắp chiếu", value: "0", helper: "Chuẩn bị ra mắt" },
    { label: "Đánh giá", value: "0", helper: "Review người dùng" },
    { label: "Tổng góp ý", value: "0", helper: "Feedback đã nhận" },
    { label: "Góp ý mới", value: "0", helper: "Chưa mở xử lý" },
    { label: "Rating góp ý", value: "0", helper: "Điểm trung bình" },
    { label: "Chưa xử lý", value: "0", helper: "Mới / đang xử lý" },
    { label: "Vé đã hủy", value: "0", helper: "Đơn không còn hiệu lực" },
    { label: "Hạng VIP", value: "0", helper: "Gold / Diamond members" },
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const overview = await getAdminOverview();

        if (!isMounted) {
          return;
        }

        setDashboardStats([
          { label: "Người dùng", value: String(overview.users || 0), helper: "Đồng bộ từ database" },
          { label: "Vé đã đặt", value: String(overview.bookings || 0), helper: "Đơn vé đã lưu" },
          { label: "Doanh thu", value: `${Number(overview.revenue || 0).toLocaleString("vi-VN")}đ`, helper: "Tổng tiền vé hợp lệ" },
          { label: "Suất chiếu", value: String(overview.showtimes || 0), helper: "Lịch chiếu đang có" },
          { label: "Phim đang chiếu", value: String(overview.activeMovies || 0), helper: "Catalog hoạt động" },
          { label: "Phim sắp chiếu", value: String(overview.comingSoonMovies || 0), helper: "Chuẩn bị ra mắt" },
          { label: "Đánh giá", value: String(overview.reviews || 0), helper: `${overview.feedbackEntries || 0} phản hồi` },
          { label: "Tổng góp ý", value: String(overview.feedbackEntries || 0), helper: "Feedback đã nhận" },
          { label: "Góp ý mới", value: String(overview.newFeedbackEntries || 0), helper: "Chưa mở xử lý" },
          { label: "Rating góp ý", value: String(overview.averageFeedbackRating || 0), helper: "Điểm trung bình /5" },
          { label: "Chưa xử lý", value: String(overview.unresolvedFeedbackEntries || 0), helper: "Mới / đang xử lý" },
          { label: "Vé đã hủy", value: String(overview.cancelledBookings || 0), helper: `${overview.favorites || 0} lượt yêu thích` },
          { label: "Hạng VIP", value: String(overview.premiumMembers || 0), helper: "Gold / Diamond members" },
        ]);

        const totalBookings = Number(overview.bookings || 0);
        const cancelledBookings = Number(overview.cancelledBookings || 0);

        setPaymentState([
          {
            label: "Đã thanh toán",
            value: totalBookings ? Math.round(((totalBookings - cancelledBookings) / totalBookings) * 100) : 0,
            color: "#f7b400",
          },
          {
            label: "Đã hủy",
            value: totalBookings ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
            color: "#ef4444",
          },
        ]);
      } catch {}
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        const movies = await getMovies({ limit: 100 }).catch(() => []);
        const deletedMovies = await getAdminDeletedMovies().catch(() => []);

        if (!isMounted) {
          return;
        }

        const movieRecords = (Array.isArray(movies) ? movies : []).map(mapMovieToRecord);
        const trashRecords = (Array.isArray(deletedMovies) ? deletedMovies : []).map(mapDeletedMovieToRecord);

        setRecords((current) => ({
          ...current,
          movies: movieRecords.length > 0 ? movieRecords : current.movies,
          trash: trashRecords.length > 0 ? trashRecords : current.trash,
        }));
      } catch (error) {
        if (isMounted) {
          setFormError(error.message || "Cannot load movies.");
        }
      }
    };

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAdminRecords = async () => {
      try {
        const [users, bookings, activity, feedbackEntries] = await Promise.all([
          getAdminUsers({ limit: 20 }),
          getAdminBookings({ limit: 50 }),
          getAdminActivity({ limit: 50 }).catch(() => []),
          getAdminFeedback({ limit: 100 }).catch(() => []),
        ]);

        if (!isMounted) {
          return;
        }

        const safeBookings = Array.isArray(bookings) ? bookings : [];
        const nextCharts = buildDashboardCharts(safeBookings);

        setRevenueTrend(nextCharts.revenueTrend);
        setMovieRevenue(nextCharts.movieRevenue);
        if (
          (!Array.isArray(users) || users.length === 0) &&
          safeBookings.length === 0 &&
          (!Array.isArray(activity) || activity.length === 0) &&
          (!Array.isArray(feedbackEntries) || feedbackEntries.length === 0)
        ) {
          return;
        }

        setRecords((current) => ({
          ...current,
          users: Array.isArray(users) && users.length > 0 ? users.map((user) => ({
            id: String(user.id),
            name: user.fullName || user.email,
            status: user.role === "admin" ? "Quản trị" : user.membership?.tier || "Member",
            time: formatAdminDateTime(user.createdAt),
            value: `${user.membership?.points || 0} điểm • ${user.stats?.bookings || 0} orders • ${user.email || "No email"}`,
            role: user.role || "user",
            email: user.email || "",
            membership: user.membership || null,
          })) : current.users,
          showtimes: safeBookings.length > 0 ? safeBookings.map((booking, index) => ({
            id: `ST${String(index + 1).padStart(3, "0")}`,
            name: `${booking.movieTitle || "Phim"} - ${booking.roomName || "Phòng chiếu"}`,
            status: booking.displayTime || "Đang cập nhật",
            time: booking.displayDate || formatAdminDateTime(booking.createdAt),
            value: `${(booking.seatNumbers || []).length} ghế đã đặt`,
          })) : current.showtimes,
          cinemas: safeBookings.length > 0 ? Array.from(
            new Map(
              safeBookings.map((booking) => [
                `${booking.cinemaName || "CineSky"}-${booking.roomName || "Phòng chiếu"}`,
                {
                  id: `RM${String((booking.roomName || "01").replace(/\D/g, "") || "01").padStart(3, "0")}`,
                  name: `${booking.cinemaName || "CineSky"} - ${booking.roomName || "Phòng chiếu"}`,
                  status: "Hoạt động",
                  time: booking.displayDate || "Theo lịch chiếu",
                  value: `${(booking.seatNumbers || []).length} ghế đã phát sinh vé`,
                },
              ])
            ).values()
          ) : current.cinemas,
          orders: safeBookings.length > 0 ? safeBookings.map((booking) => ({
            id: String(booking.id),
            name: `${(booking.seatNumbers || []).length} vé ${booking.movieTitle || "Vé xem phim"}`,
            status: booking.status === "cancelled" ? "Đã hủy" : booking.status === "used" ? "Đã check-in" : "Đã thanh toán",
            time: [booking.displayDate, booking.displayTime].filter(Boolean).join(" • ") || formatAdminDateTime(booking.createdAt),
            value: `${booking.ticketCode || String(booking.id).slice(-6)} • ${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND • ${booking.customerName || booking.customerEmail || "Guest"}`,
          })) : current.orders,
          payments: safeBookings.length > 0 ? safeBookings.map((booking) => ({
            id: String(booking.id),
            name: `Mock payment ${booking.ticketCode || String(booking.id).slice(-6)}`,
            status: booking.status === "cancelled" ? "Đã hủy" : booking.paymentStatus === "mock_paid" ? "Mock paid" : "Đã thanh toán",
            time: formatAdminDateTime(booking.createdAt),
            value: `${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND • ${booking.paymentProvider || booking.paymentMethod || "Mock"}`,
          })) : current.payments,
          feedback: Array.isArray(feedbackEntries) && feedbackEntries.length > 0
            ? feedbackEntries.map(mapFeedbackToRecord)
            : current.feedback,
          activity: Array.isArray(activity) && activity.length > 0
            ? activity.map((item) => ({
                id: String(item.id),
                name: item.name,
                status: item.status,
                time: formatAdminDateTime(item.time),
                value: [item.value, item.adminName ? `by ${item.adminName}` : ""].filter(Boolean).join(" - "),
                entityType: item.entityType,
                entityId: item.entityId,
              }))
            : current.activity,
        }));
      } catch {}
    };

    loadAdminRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeModule !== "feedback" || !selectedDetail) {
      return;
    }

    setFeedbackDraft({
      status: selectedDetail.statusKey || selectedDetail.status || "new",
      category: selectedDetail.category || "other",
      priority: selectedDetail.priority || "medium",
      adminNote: "",
      response: selectedDetail.response || "",
    });
  }, [activeModule, selectedDetail]);

  const activeConfig = moduleConfig.find((item) => item.key === activeModule) || moduleConfig[0];
  const activeRecords = useMemo(() => records[activeModule] || [], [activeModule, records]);
  const statuses = Array.from(new Set(activeRecords.map((item) => item.status)));

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return activeRecords
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.id.toLowerCase().includes(normalizedSearch) ||
          String(item.email || "").toLowerCase().includes(normalizedSearch) ||
          String(item.message || "").toLowerCase().includes(normalizedSearch) ||
          String(item.value || "").toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesRating =
          activeModule !== "feedback" ||
          feedbackRatingFilter === "all" ||
          Number(item.rating) === Number(feedbackRatingFilter);
        const dateWindow = feedbackDateFilters[feedbackDateFilter] || 0;
        const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        const matchesDate =
          activeModule !== "feedback" ||
          !dateWindow ||
          (createdAt && Date.now() - createdAt <= dateWindow * 86400000);

        return matchesSearch && matchesStatus && matchesRating && matchesDate;
      })
      .sort((first, second) =>
        sortDir === "asc"
          ? first.name.localeCompare(second.name, "vi")
          : second.name.localeCompare(first.name, "vi")
      );
  }, [activeModule, activeRecords, feedbackDateFilter, feedbackRatingFilter, search, sortDir, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / 5));
  const visibleRecords = filteredRecords.slice((page - 1) * 5, page * 5);
  const paymentChartState = paymentState.some((item) => item.value > 0)
    ? paymentState
    : [{ label: "No data", value: 100, color: "#334155" }];
  const addActivity = (entry) => {
    setRecords((current) => ({
      ...current,
      activity: [
        {
          id: `LOG${Date.now()}`,
          name: entry.name,
          status: entry.action,
          time: formatAdminDateTime(new Date().toISOString()),
          value: entry.value || "Movie",
          undo: entry.undo || null,
        },
        ...current.activity,
      ],
    }));
  };

  const appendMultiValue = (field, value) => {
    const trimmedValue = String(value || "").trim();

    if (!trimmedValue) {
      return;
    }

    setForm((current) => {
      const values = splitList(current[field]);

      if (values.some((item) => normalizeComparable(item) === normalizeComparable(trimmedValue))) {
        return current;
      }

      return {
        ...current,
        [field]: [...values, trimmedValue].join(", "),
      };
    });
  };

  const handlePosterFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn file ảnh poster.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ảnh poster nên nhỏ hơn 2MB để lưu vào database.");
      return;
    }

    setIsPosterUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const uploadedPoster = await uploadAdminPoster({
          fileName: file.name,
          fileData: String(reader.result || ""),
        });

        setForm((current) => ({
          ...current,
          poster: uploadedPoster.poster || "",
        }));
        setFormError("");
      } catch (error) {
        setFormError(error.message || "Không thể lưu ảnh poster vào thư mục assets.");
      } finally {
        setIsPosterUploading(false);
      }
    };

    reader.onerror = () => {
      setFormError("Không thể đọc file ảnh poster.");
      setIsPosterUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const askConfirm = ({ title = "Xác nhận thao tác", message = "", confirmText = "Xác nhận" }) =>
    new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmDialog({ title, message, confirmText });
    });

  const closeConfirm = (confirmed) => {
    const resolver = confirmResolverRef.current;
    confirmResolverRef.current = null;
    setConfirmDialog(null);
    if (resolver) {
      resolver(Boolean(confirmed));
    }
  };

  const handleSyncTmdbMetadata = async () => {
    if (!form.title.trim()) {
      setFormError("Nhập tên phim trước khi đồng bộ TMDB.");
      return;
    }

    try {
      setIsTmdbSyncing(true);
      const metadata = await searchAdminTmdbMovie(form.title);

      setForm((current) => ({
        ...current,
        title: metadata.title || current.title,
        poster: metadata.poster || current.poster,
        genres: Array.isArray(metadata.genres) ? metadata.genres.join(", ") : current.genres,
        country: metadata.country || current.country,
        director: metadata.director || current.director,
        duration: metadata.duration ? String(metadata.duration) : current.duration,
        releaseDate: metadata.releaseDate || current.releaseDate,
        trailer: metadata.trailer || current.trailer,
        description: metadata.description || current.description,
        cast: metadata.cast || current.cast,
        gallery: Array.isArray(metadata.gallery) ? metadata.gallery.join(", ") : current.gallery,
        trailerFacts: metadata.trailerFacts || current.trailerFacts,
        trailerPanelLabel: metadata.trailerPanelLabel || current.trailerPanelLabel,
        trailerPanelTitle: metadata.trailerPanelTitle || current.trailerPanelTitle,
        trailerPanelDescription: metadata.trailerPanelDescription || current.trailerPanelDescription,
      }));
      setFormError("Đã nạp metadata TMDB vào form. Kiểm tra lại rồi bấm xác nhận để lưu DB.");
    } catch (error) {
      setFormError(error.message || "Không thể đồng bộ metadata TMDB.");
    } finally {
      setIsTmdbSyncing(false);
    }
  };

  const switchModule = (moduleKey) => {
    const nextModule = adminModuleKeys.has(moduleKey) ? moduleKey : "movies";

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_MODULE_STORAGE_KEY, nextModule);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("module", nextModule);
      window.history.replaceState(null, "", nextUrl);
    }

    setActiveModule(nextModule);
    setSearch("");
    setStatusFilter("all");
    setFeedbackRatingFilter("all");
    setFeedbackDateFilter("all");
    setPage(1);
    setForm(nextModule === "movies" ? createMovieForm() : createEmptyForm());
    setEditingId("");
    setIsCrudMode(false);
    setSelectedDetail(null);
    setFeedbackDraft({ status: "new", category: "other", priority: "medium", adminNote: "", response: "" });
    setFormError("");
  };

  const openCreateForm = () => {
    if (readOnlyModules.has(activeModule)) {
      setFormError("Module này hiện chỉ đọc, chưa có API lưu dữ liệu.");
      return;
    }

    setForm(activeModule === "movies" ? createMovieForm() : createEmptyForm());
    setEditingId("");
    setSelectedDetail(null);
    setIsCrudMode(true);
    setFormError("");
  };

  const closeCrudMode = () => {
    setIsCrudMode(false);
    setForm(activeModule === "movies" ? createMovieForm() : createEmptyForm());
    setEditingId("");
    setFormError("");
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      `cinesky-admin-draft-${activeModule}`,
      JSON.stringify({ form, editingId, savedAt: new Date().toISOString() })
    );
    setFormError("Đã lưu nháp trên trình duyệt.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (readOnlyModules.has(activeModule)) {
      setFormError("This module is read-only until save APIs are connected.");
      return;
    }

    if (activeModule === "movies") {
      const validationMessage = validateMovieForm(form, records.movies, editingId);

      if (validationMessage) {
        setFormError(validationMessage);
        return;
      }

      const confirmed = await askConfirm({
        title: editingId ? "Lưu thay đổi phim" : "Thêm phim mới",
        message: editingId ? "Xác nhận lưu thay đổi phim này?" : "Xác nhận thêm phim mới?",
        confirmText: editingId ? "Lưu thay đổi" : "Thêm phim",
      });

      if (!confirmed) {
        return;
      }

      try {
        const previousMovie = editingId ? await getMovieById(editingId).catch(() => null) : null;
        const savedMovie = editingId
          ? await updateAdminMovie(editingId, movieFormToPayload(form))
          : await createAdminMovie(movieFormToPayload(form));

        if (false && editingId) {
          throw new Error("Backend chưa lưu thay đổi phim. Vui lòng restart backend rồi thử lại.");
        }

        const nextRecord = mapMovieToRecord(savedMovie);

        setRecords((current) => {
          const nextActivity = {
            id: `LOG${Date.now()}`,
            name: nextRecord.name,
            status: editingId ? "UPDATE" : "CREATE",
            time: formatAdminDateTime(new Date().toISOString()),
            value: `ID ${nextRecord.id}`,
            undo: editingId
              ? { type: "update", movieId: nextRecord.id, before: previousMovie, after: savedMovie }
              : { type: "create", movieId: nextRecord.id, movie: savedMovie },
          };

          return {
            ...current,
            movies: editingId
              ? current.movies.map((item) => (item.id === editingId ? nextRecord : item))
              : [nextRecord, ...current.movies],
            activity: [nextActivity, ...current.activity],
          };
        });
        setForm(createMovieForm());
        setEditingId("");
        setIsCrudMode(false);
        setSelectedDetail(nextRecord);
        setFormError("");
      } catch (error) {
        setFormError(error.message || "Không thể lưu phim.");
      }

      return;
    }

    if (!form.name.trim() || !form.status.trim() || !form.time.trim()) {
      setFormError("Please enter name, status, and time.");
      return;
    }

    const nextRecord = {
      ...form,
      id: editingId || form.id.trim() || `${activeModule.slice(0, 2).toUpperCase()}${Date.now().toString().slice(-4)}`,
      value: form.value.trim() || "Not updated",
    };

    setRecords((current) => ({
      ...current,
      [activeModule]: editingId
        ? current[activeModule].map((item) => (item.id === editingId ? nextRecord : item))
        : [nextRecord, ...current[activeModule]],
    }));
    setForm(createEmptyForm());
    setEditingId("");
    setIsCrudMode(false);
    setFormError("");
  };

  const handleEdit = async (record) => {
    if (readOnlyModules.has(activeModule)) {
      setFormError("This module is read-only until save APIs are connected.");
      return;
    }

    if (activeModule === "movies") {
      try {
        const movieDetail = await getMovieById(record.id);
        setForm(mapMovieToForm(movieDetail));
      } catch {
        setForm(mapMovieToForm(record));
      }
      setEditingId(record.id);
      setIsCrudMode(true);
      setSelectedDetail(record);
      setFormError("");
      return;
    }

    setForm(record);
    setEditingId(record.id);
    setIsCrudMode(true);
    setFormError("");
  };

  const handleDelete = async (recordId) => {
    if (readOnlyModules.has(activeModule)) {
      setFormError("This module is read-only until delete APIs are connected.");
      return;
    }

    if (!(await askConfirm({
      title: "Xóa phim",
      message: "Xác nhận xóa phim này? Thao tác này không thể hoàn tác.",
      confirmText: "Xóa phim",
    }))) {
      return;
    }

    if (activeModule === "movies") {
      try {
        const movieSnapshot = await getMovieById(recordId).catch(() => records.movies.find((item) => item.id === recordId));
        const deletedMovie = await deleteAdminMovie(recordId);
        const deletedRecord = mapMovieToRecord(deletedMovie);
        setRecords((current) => ({
          ...current,
          movies: current.movies.filter((item) => item.id !== recordId),
          trash: [mapDeletedMovieToRecord(deletedMovie), ...current.trash.filter((item) => item.id !== recordId)],
        }));
        setSelectedDetail((current) => (current?.id === recordId ? null : current));
        if (editingId === recordId) {
          setForm(createMovieForm());
          setEditingId("");
        }
        setFormError("");
        addActivity({
          action: "DELETE",
          name: deletedRecord.name,
          value: `ID ${deletedRecord.id}`,
          undo: { type: "delete", movieId: deletedRecord.id, movie: movieSnapshot },
        });
      } catch (error) {
        setFormError(error.message || "Không thể xóa phim.");
      }

      return;
    }

    setRecords((current) => ({
      ...current,
      [activeModule]: current[activeModule].filter((item) => item.id !== recordId),
    }));
    setSelectedDetail((current) => (current?.id === recordId ? null : current));
  };

  const handleRestoreMovie = async (trashRecord) => {
    const movie = trashRecord.deletedMovie || trashRecord;
    const validationMessage = validateMovieForm(mapMovieToForm(movie), records.movies, "");

    if (validationMessage && validationMessage.includes("tồn tại")) {
      setFormError(validationMessage);
      return;
    }

    if (!(await askConfirm({
      title: "Khôi phục phim",
      message: "Khôi phục phim này từ thùng rác?",
      confirmText: "Khôi phục",
    }))) {
      return;
    }

    try {
      const restoredMovie = await restoreAdminMovie(movie.id);
      const restoredRecord = mapMovieToRecord(restoredMovie);

      setRecords((current) => ({
        ...current,
        movies: [restoredRecord, ...current.movies],
        trash: current.trash.filter((item) => item.id !== trashRecord.id),
      }));
      setSelectedDetail(restoredRecord);
      setFormError("");
      addActivity({
        action: "RESTORE",
        name: restoredRecord.name,
        value: `ID ${restoredRecord.id}`,
        undo: { type: "restore", movieId: restoredRecord.id, movie: restoredMovie },
      });
    } catch (error) {
      setFormError(error.message || "Không thể khôi phục phim.");
    }
  };

  const handleUndoActivity = async (activity) => {
    const undo = activity.undo;

    if (!undo) {
      return;
    }

    if (!(await askConfirm({
      title: "Hoàn tác",
      message: "Hoàn tác thao tác này?",
      confirmText: "Hoàn tác",
    }))) {
      return;
    }

    try {
      if (undo.type === "create" || undo.type === "restore") {
        await deleteAdminMovie(undo.movieId);
        setRecords((current) => ({
          ...current,
          movies: current.movies.filter((item) => item.id !== undo.movieId),
        }));
      }

      if (undo.type === "delete") {
        const restoredMovie = await restoreAdminMovie(undo.movieId);
        const restoredRecord = mapMovieToRecord(restoredMovie);
        setRecords((current) => ({
          ...current,
          movies: [restoredRecord, ...current.movies.filter((item) => item.id !== restoredRecord.id)],
          trash: current.trash.filter((item) => item.id !== restoredRecord.id),
        }));
      }

      if (undo.type === "update" && undo.before) {
        const restoredMovie = await updateAdminMovie(undo.movieId, movieFormToPayload(mapMovieToForm(undo.before)));
        const restoredRecord = mapMovieToRecord(restoredMovie);
        setRecords((current) => ({
          ...current,
          movies: current.movies.map((item) => (item.id === restoredRecord.id ? restoredRecord : item)),
        }));
      }

      if (undo.type === "role") {
        const updatedUser = await updateAdminUserRole(undo.userId, undo.role);
        setRecords((current) => ({
          ...current,
          users: current.users.map((item) =>
            item.id === undo.userId
              ? {
                  ...item,
                  status: updatedUser.role === "admin" ? "Admin" : "User",
                  role: updatedUser.role,
                }
              : item
          ),
        }));
      }

      setRecords((current) => ({
        ...current,
        activity: current.activity.map((item) =>
          item.id === activity.id ? { ...item, value: `${item.value} • undone`, undo: null } : item
        ),
      }));
      setFormError("");
    } catch (error) {
      setFormError(error.message || "Không thể hoàn tác.");
    }
  };

  const handleToggleUserRole = async (record) => {
    const nextRole = record.role === "admin" ? "user" : "admin";

    if (!(await askConfirm({
      title: "Đổi quyền người dùng",
      message: `Đổi role của ${record.name} thành ${nextRole}?`,
      confirmText: "Đổi role",
    }))) {
      return;
    }

    try {
      const updatedUser = await updateAdminUserRole(record.id, nextRole);

      setRecords((current) => ({
        ...current,
        users: current.users.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: updatedUser.role === "admin" ? "Admin" : "User",
                role: updatedUser.role,
                name: updatedUser.fullName || updatedUser.email,
                value: item.value.replace(record.email || updatedUser.email || "", updatedUser.email || record.email || ""),
                email: updatedUser.email || record.email || "",
              }
            : item
        ),
      }));
      setFormError("");
      addActivity({
        action: "ROLE",
        name: updatedUser.fullName || updatedUser.email,
        value: `Role: ${updatedUser.role}`,
        undo: { type: "role", userId: record.id, role: record.role || "user" },
      });
    } catch (error) {
      setFormError(error.message || "Không thể đổi role.");
    }
  };

  const syncFeedbackRecord = (feedback) => {
    const nextRecord = mapFeedbackToRecord(feedback);

    setRecords((current) => ({
      ...current,
      feedback: current.feedback.map((item) => (item.id === nextRecord.id ? nextRecord : item)),
    }));
    setSelectedDetail(nextRecord);
    return nextRecord;
  };

  const handleSaveFeedbackWork = async (mode = "save") => {
    if (!selectedDetail?.id) {
      return;
    }

    if (mode === "respond" && selectedDetail.response) {
      setFormError("Phản hồi đã gửi cho khách thì không thể sửa.");
      return;
    }

    const payload = {
      status: feedbackDraft.status,
      category: feedbackDraft.category,
      priority: feedbackDraft.priority,
    };

    if (feedbackDraft.adminNote.trim()) {
      payload.adminNote = feedbackDraft.adminNote.trim();
    }

    if (mode === "respond") {
      if (!feedbackDraft.response.trim()) {
        setFormError("Vui lòng nhập nội dung phản hồi.");
        return;
      }
      payload.response = feedbackDraft.response.trim();
    }

    try {
      const updatedFeedback = await updateAdminFeedback(selectedDetail.id, payload);
      syncFeedbackRecord(updatedFeedback);
      setFeedbackDraft((current) => ({ ...current, adminNote: "" }));
      setFormError(mode === "respond" ? "Đã lưu phản hồi mock vào DB." : "Đã lưu cập nhật góp ý.");
    } catch (error) {
      setFormError(error.message || "Không thể cập nhật góp ý.");
    }
  };

  const handleMarkFeedbackSpam = async (record) => {
    if (!(await askConfirm({
      title: "Đánh dấu spam",
      message: "Đánh dấu góp ý này là spam?",
      confirmText: "Đánh dấu spam",
    }))) {
      return;
    }

    try {
      const updatedFeedback = await updateAdminFeedback(record.id, { isSpam: true, status: "closed" });
      syncFeedbackRecord(updatedFeedback);
      setFormError("Đã đánh dấu spam và đóng góp ý.");
    } catch (error) {
      setFormError(error.message || "Không thể đánh dấu spam.");
    }
  };

  const syncCheckedInTicketRecord = (booking) => {
    if (!booking?.id) {
      return;
    }

    setRecords((current) => ({
      ...current,
      orders: current.orders.map((record) =>
        record.id === String(booking.id)
          ? {
              ...record,
              status: booking.status === "used" ? "Đã check-in" : record.status,
              value: `${booking.ticketCode || String(booking.id).slice(-6)} • ${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND • ${booking.customerName || booking.customerEmail || "Guest"}`,
            }
          : record
      ),
      checkin: [
        {
          id: booking.ticketCode || String(booking.id),
          name: booking.movieTitle || "Vé xem phim",
          status: booking.status === "used" ? "Đã check-in" : booking.status === "cancelled" ? "Đã hủy" : "Hợp lệ",
          time: booking.checkedInAt ? formatAdminDateTime(booking.checkedInAt) : [booking.displayDate, booking.displayTime].filter(Boolean).join(" • "),
          value: `${(booking.seatNumbers || []).join(", ")} • ${booking.customerName || booking.customerEmail || "Guest"}`,
        },
        ...current.checkin.filter((record) => record.id !== (booking.ticketCode || String(booking.id))),
      ].slice(0, 20),
    }));
  };

  const handleLookupTicket = async (event) => {
    event?.preventDefault();
    const code = ticketSearch.trim().toUpperCase();

    if (!code) {
      setTicketMessage("Nhập hoặc scan mã vé trước.");
      return;
    }

    try {
      setIsTicketChecking(true);
      setTicketMessage("");
      const booking = await lookupAdminTicket(code);
      setTicketLookup(booking);
      syncCheckedInTicketRecord(booking);
      setTicketMessage("Đã tìm thấy vé.");
    } catch (error) {
      setTicketLookup(null);
      setTicketMessage(error.message || "Không tìm thấy vé.");
    } finally {
      setIsTicketChecking(false);
    }
  };

  const handleCheckInTicket = async () => {
    const code = String(ticketLookup?.ticketCode || ticketSearch).trim().toUpperCase();

    if (!code) {
      return;
    }

    try {
      setIsTicketChecking(true);
      setTicketMessage("");
      const booking = await checkInAdminTicket(code);
      setTicketLookup(booking);
      syncCheckedInTicketRecord(booking);
      setTicketMessage(booking.status === "used" ? "Check-in vé thành công." : "Đã cập nhật vé.");
    } catch (error) {
      setTicketMessage(error.message || "Không thể check-in vé.");
    } finally {
      setIsTicketChecking(false);
    }
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          CineSky
        </Link>
        <nav className="admin-nav">
          {adminNavGroups.map((group) => {
            const isGroupActive = group.items.some((item) => item.key === activeModule);

            return (
              <details key={group.key} className={"admin-nav-group" + (isGroupActive ? " is-active" : "")} open={isGroupActive}>
                <summary>
                  <span>{group.label}</span>
                  <i aria-hidden="true"></i>
                </summary>
                <div className="admin-nav-group__items">
                  {group.items.map((item) => (
                    <button key={item.key} className={activeModule === item.key ? "active" : ""} onClick={() => switchModule(item.key)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </details>
            );
          })}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <span>Trang quản trị</span>
            <h1>{activeModule === "dashboard" ? "Tổng quan vận hành" : `Quản lý ${activeConfig.label.toLowerCase()}`}</h1>
          </div>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
            <option value="day">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </header>

        {activeModule === "checkin" ? (
          <div className="admin-checkin-grid">
            <section className="admin-panel admin-checkin-card">
              <span>Ticket gate</span>
              <h2>Scan / nhập mã vé</h2>
              <form onSubmit={handleLookupTicket} className="admin-checkin-form">
                <input
                  value={ticketSearch}
                  onChange={(event) => setTicketSearch(event.target.value.toUpperCase())}
                  placeholder="VD: CSK01ABC234DE"
                />
                <button type="submit" disabled={isTicketChecking}>
                  {isTicketChecking ? "Đang kiểm tra..." : "Tra vé"}
                </button>
              </form>
              {ticketMessage ? <p className="admin-checkin-message">{ticketMessage}</p> : null}
            </section>

            <section className="admin-panel admin-checkin-result">
              {ticketLookup ? (
                <>
                  <div className="admin-checkin-result__head">
                    <div>
                      <span>{ticketLookup.ticketCode}</span>
                      <h2>{ticketLookup.movieTitle || "Vé xem phim"}</h2>
                    </div>
                    <strong className={`admin-checkin-status admin-checkin-status--${ticketLookup.status}`}>
                      {ticketLookup.status === "used" ? "Đã check-in" : ticketLookup.status === "cancelled" ? "Đã hủy" : "Hợp lệ"}
                    </strong>
                  </div>
                  <div className="admin-checkin-meta">
                    <div>
                      <small>Suất chiếu</small>
                      <strong>{[ticketLookup.displayDate, ticketLookup.displayTime].filter(Boolean).join(" • ") || "Chưa có lịch"}</strong>
                    </div>
                    <div>
                      <small>Phòng / ghế</small>
                      <strong>{ticketLookup.roomName || "Phòng chiếu"} • {(ticketLookup.seatNumbers || []).join(", ")}</strong>
                    </div>
                    <div>
                      <small>Khách hàng</small>
                      <strong>{ticketLookup.customerName || ticketLookup.customerEmail || "Guest"}</strong>
                    </div>
                    <div>
                      <small>Thanh toán</small>
                      <strong>{Number(ticketLookup.totalPrice || 0).toLocaleString("vi-VN")} VND • {ticketLookup.paymentProvider || ticketLookup.paymentMethod || "Mock payment"}</strong>
                    </div>
                  </div>
                  <button
                    className="admin-checkin-confirm"
                    type="button"
                    onClick={handleCheckInTicket}
                    disabled={isTicketChecking || ticketLookup.status === "cancelled" || ticketLookup.status === "used"}
                  >
                    {ticketLookup.status === "used" ? "Vé đã sử dụng" : "Xác nhận check-in"}
                  </button>
                </>
              ) : (
                <p className="admin-checkin-empty">Thông tin vé sẽ hiện ở đây sau khi tra mã.</p>
              )}
            </section>
          </div>
        ) : activeModule === "dashboard" ? (
          <div className="admin-dashboard">
            <div className="admin-stat-grid">
              {dashboardStats.map((item) => (
                <article key={item.label} className="admin-stat-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.helper}</small>
                </article>
              ))}
            </div>

            <div className="admin-chart-grid">
              <article className="admin-panel admin-panel--wide">
                <h2>Xu hướng doanh thu {dateRangeLabels[dateRange] || ""}</h2>
                <div className="admin-line-chart">
                  {revenueTrend.map((value, index) => (
                    <span key={index} style={{ height: `${value}%` }} />
                  ))}
                </div>
              </article>

              <article className="admin-panel">
                <h2>Doanh thu theo phim</h2>
                <div className="admin-bar-chart">
                  {movieRevenue.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong style={{ width: `${item.value}%` }} />
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel">
                <h2>Trạng thái thanh toán</h2>
                <svg className="admin-donut" viewBox="0 0 120 120" aria-label="Payment status">
                  {paymentChartState.map((item, index) => {
                    const startAngle = paymentChartState
                      .slice(0, index)
                      .reduce((total, state) => total + state.value * 3.6, 0);
                    const endAngle = startAngle + item.value * 3.6;
                    const offset = getSliceOffset(startAngle, endAngle);

                    if (item.value >= 100) {
                      return (
                        <circle
                          key={item.label}
                          className="admin-donut__slice"
                          cx="60"
                          cy="60"
                          r="50"
                          fill={item.color}
                          onMouseEnter={() => setActivePaymentLabel(item.label)}
                          onMouseLeave={() => setActivePaymentLabel("")}
                        />
                      );
                    }

                    return (
                      <path
                        key={item.label}
                        className="admin-donut__slice"
                        d={createPieSlicePath(startAngle, endAngle)}
                        fill={item.color}
                        style={{ "--slice-x": offset.x, "--slice-y": offset.y }}
                        onMouseEnter={() => setActivePaymentLabel(item.label)}
                        onMouseLeave={() => setActivePaymentLabel("")}
                      />
                    );
                  })}
                  <circle cx="60" cy="60" r="20" className="admin-donut__hole" />
                </svg>
                <div className="admin-donut-legend">
                  {paymentChartState.map((item) => (
                    <span
                      key={item.label}
                      className={activePaymentLabel === item.label ? "is-active" : ""}
                      style={{ "--legend-color": item.color }}
                    >
                      {item.label}: {item.value}%
                    </span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className={"admin-workspace" + (isCrudMode ? " admin-workspace--editor" : "")}>
            {!isCrudMode ? (
            <section className="admin-panel admin-table-panel">
              <div className="admin-toolbar">
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm theo tên hoặc ID" />
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="all">Tất cả trạng thái</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {activeModule === "feedback" ? (
                  <>
                    <select value={feedbackRatingFilter} onChange={(event) => { setFeedbackRatingFilter(event.target.value); setPage(1); }}>
                      <option value="all">Tất cả rating</option>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>{rating} sao</option>
                      ))}
                    </select>
                    <select value={feedbackDateFilter} onChange={(event) => { setFeedbackDateFilter(event.target.value); setPage(1); }}>
                      <option value="all">Mọi ngày gửi</option>
                      <option value="today">Hôm nay</option>
                      <option value="week">7 ngày</option>
                      <option value="month">30 ngày</option>
                    </select>
                  </>
                ) : null}
                <button onClick={() => setSortDir((current) => (current === "asc" ? "desc" : "asc"))}>
                  Sắp xếp {sortDir === "asc" ? "A-Z" : "Z-A"}
                </button>
                {!readOnlyModules.has(activeModule) ? (
                  <button type="button" onClick={openCreateForm}>
                    Thêm mới
                  </button>
                ) : null}
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên</th>
                      <th>{activeConfig.statusLabel}</th>
                      <th>Thời gian</th>
                      <th>Giá trị</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.name}</td>
                        <td><span className={`admin-status ${record.statusTone ? `admin-status--${record.statusTone}` : ""}`}>{record.status}</span></td>
                        <td>{record.time}</td>
                        <td>{record.value}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button onClick={() => setSelectedDetail(record)}>Xem</button>
                            {activeModule === "trash" ? (
                              <button onClick={() => handleRestoreMovie(record)}>Khôi phục</button>
                            ) : null}
                            {activeModule === "activity" ? (
                              <button disabled={!record.undo} onClick={() => handleUndoActivity(record)}>Hoàn tác</button>
                            ) : null}
                            {activeModule === "users" ? (
                              <button onClick={() => handleToggleUserRole(record)}>
                                {record.role === "admin" ? "Chuyển thành user" : "Cấp admin"}
                              </button>
                            ) : null}
                            {activeModule === "feedback" ? (
                              <>
                                <button onClick={() => handleMarkFeedbackSpam(record)}>Spam</button>
                              </>
                            ) : null}
                            {activeModule !== "trash" && activeModule !== "activity" && activeModule !== "feedback" ? (
                              <>
                                {activeModule !== "users" ? <button onClick={() => handleEdit(record)}>Sửa</button> : null}
                                {activeModule !== "users" ? <button onClick={() => handleDelete(record.id)}>Xóa</button> : null}
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</button>
                <span>Trang {page}/{totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Sau</button>
              </div>
            </section>
            ) : null}

            <aside className="admin-side-panels">
              {activeModule !== "trash" && activeModule !== "activity" && activeModule !== "feedback" ? (
              <form className="admin-panel admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-head">
                  <div>
                    <span>{editingId ? "Chỉnh sửa" : "Tạo mới"}</span>
                    <h2>{editingId ? "Sửa bản ghi" : "Thêm bản ghi"}</h2>
                  </div>
                  {isCrudMode ? (
                    <button type="button" className="admin-form-back" onClick={closeCrudMode}>
                      Back danh sách
                    </button>
                  ) : null}
                </div>
                {formError ? <p className="admin-form-error">{formError}</p> : null}
                {activeModule === "movies" ? (
                  <>
                    <datalist id="genre-suggestions">{movieSuggestions.genres.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="country-suggestions">{movieSuggestions.country.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="showtime-suggestions">{movieSuggestions.showtimes.map((item) => <option key={item} value={item} />)}</datalist>
                    <input className="admin-field--tiny" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Movie ID tự tạo nếu trống" disabled={Boolean(editingId)} />
                    <input className="admin-field--medium" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tên phim" />
                    <button className="admin-field--small admin-tmdb-btn" type="button" onClick={handleSyncTmdbMetadata} disabled={isTmdbSyncing}>
                      {isTmdbSyncing ? "Đang đồng bộ..." : "Đồng bộ TMDB"}
                    </button>
                    <div className="admin-poster-picker admin-field--wide">
                      <label>
                        <span>Chọn ảnh poster từ máy</span>
                        <span className="admin-file-control">
                          <span>{isPosterUploading ? "Đang lưu..." : "Chọn file"}</span>
                          <input type="file" accept="image/*" onChange={handlePosterFileChange} disabled={isPosterUploading} />
                        </span>
                      </label>
                      {form.poster ? (
                        <div className="admin-poster-preview">
                          <img src={form.poster} alt="Poster preview" />
                          <button type="button" onClick={() => setForm({ ...form, poster: "" })}>
                            Xóa ảnh
                          </button>
                          <small>{form.poster}</small>
                        </div>
                      ) : (
                        <small>{isPosterUploading ? "Đang lưu ảnh vào assets/images..." : "Chưa chọn poster. Ảnh sẽ được lưu vào Frontend/public/assets/images."}</small>
                      )}
                    </div>
                    <input className="admin-field--medium" required value={form.trailer} onChange={(event) => setForm({ ...form, trailer: event.target.value })} placeholder="Link trailer YouTube" />
                    <textarea className="admin-field--large" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Mô tả phim" rows="4" />
                    <div className="admin-multi-field admin-field--wide">
                      <input required list="genre-suggestions" value={form.genres} onChange={(event) => setForm({ ...form, genres: event.target.value })} placeholder="Thể loại, cách nhau bằng dấu phẩy hoặc xuống dòng" />
                      <div>
                        {movieSuggestions.genres.slice(0, 5).map((item) => (
                          <button key={item} type="button" onClick={() => appendMultiValue("genres", item)}>{item}</button>
                        ))}
                      </div>
                    </div>
                    <div className="admin-form-grid">
                      <input required list="country-suggestions" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Quốc gia" />
                      <input required value={form.director} onChange={(event) => setForm({ ...form, director: event.target.value })} placeholder="Đạo diễn" />
                    </div>
                    <div className="admin-form-grid">
                      <input required min="1" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Thời lượng phút" />
                      <input required value={form.releaseDate} onChange={(event) => setForm({ ...form, releaseDate: event.target.value })} placeholder="Ngày khởi chiếu" />
                    </div>
                    <div className="admin-form-grid">
                      <select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>
                        <option value="P">P</option>
                        <option value="K">K</option>
                        <option value="T13">T13</option>
                        <option value="T16">T16</option>
                        <option value="T18">T18</option>
                        <option value="C18">C18</option>
                      </select>
                      <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                        <option value="now-showing">Đang chiếu</option>
                        <option value="coming-soon">Sắp chiếu</option>
                      </select>
                    </div>
                    <textarea className="admin-field--wide" value={form.cast} onChange={(event) => setForm({ ...form, cast: event.target.value })} placeholder="Diễn viên, mỗi dòng: Tên: Vai" rows="3" />
                    <div className="admin-multi-field admin-field--wide">
                      <input value={form.gallery} onChange={(event) => setForm({ ...form, gallery: event.target.value })} placeholder="Gallery URL, cách nhau bằng dấu phẩy hoặc xuống dòng" />
                      <button type="button" onClick={() => appendMultiValue("gallery", form.poster)}>Thêm poster vào gallery</button>
                    </div>
                    <textarea className="admin-field--wide" value={form.trailerFacts} onChange={(event) => setForm({ ...form, trailerFacts: event.target.value })} placeholder="Trailer facts, mỗi dòng: Nhãn: Giá trị" rows="3" />
                    <input className="admin-field--small" value={form.trailerPanelLabel} onChange={(event) => setForm({ ...form, trailerPanelLabel: event.target.value })} placeholder="Nhãn panel trailer" />
                    <input className="admin-field--medium" value={form.trailerPanelTitle} onChange={(event) => setForm({ ...form, trailerPanelTitle: event.target.value })} placeholder="Tiêu đề panel trailer" />
                    <textarea className="admin-field--large" value={form.trailerPanelDescription} onChange={(event) => setForm({ ...form, trailerPanelDescription: event.target.value })} placeholder="Mô tả panel trailer" rows="3" />
                    <div className="admin-multi-field admin-field--wide">
                      <input list="showtime-suggestions" value={form.showtimes} onChange={(event) => setForm({ ...form, showtimes: event.target.value })} placeholder="Suất chiếu nhanh, cách nhau bằng dấu phẩy hoặc xuống dòng" />
                      <div>
                        {movieSuggestions.showtimes.slice(0, 4).map((item) => (
                          <button key={item} type="button" onClick={() => appendMultiValue("showtimes", item)}>{item}</button>
                        ))}
                      </div>
                    </div>
                    <div className="admin-form-grid">
                      <input type="number" value={form.catalogOrder} onChange={(event) => setForm({ ...form, catalogOrder: event.target.value })} placeholder="Thứ tự catalog" />
                      <input type="number" value={form.heroOrder} onChange={(event) => setForm({ ...form, heroOrder: event.target.value })} placeholder="Thứ tự hero" />
                    </div>
                  </>
                ) : (
                  <>
                    <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Tự tạo ID nếu để trống" />
                    <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Tên" />
                    <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="Trạng thái" />
                    <input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="Thời gian" />
                    <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="Giá trị / ghi chú" />
                  </>
                )}
                <div className="admin-form-actions">
                  <button type="button" className="admin-draft-btn" onClick={handleSaveDraft}>
                    Lưu nháp
                  </button>
                  <button type="submit">{editingId ? "Xác nhận lưu" : "Xác nhận thêm"}</button>
                </div>
              </form>
              ) : null}

              {!isCrudMode ? (
              <article className="admin-panel admin-detail">
                <h2>Chi tiết</h2>
                {activeModule === "feedback" && selectedDetail ? (
                  <div className="admin-feedback-detail">
                    <div className="admin-feedback-meta">
                      <strong>{selectedDetail.fullName}</strong>
                      <span>{selectedDetail.email}</span>
                      <span>{normalizeFeedbackRating(selectedDetail.rating)}/5 sao • {selectedDetail.time}</span>
                    </div>
                    <p className="admin-feedback-message">{selectedDetail.message}</p>
                    <div className="admin-form-grid">
                      <select value={feedbackDraft.status} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, status: event.target.value })}>
                        {feedbackStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <select value={feedbackDraft.category} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, category: event.target.value })}>
                        {feedbackCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <select value={feedbackDraft.priority} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, priority: event.target.value })}>
                        {feedbackPriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                    <textarea
                      value={feedbackDraft.adminNote}
                      onChange={(event) => setFeedbackDraft({ ...feedbackDraft, adminNote: event.target.value })}
                      placeholder="Admin note nội bộ"
                      aria-label="Admin note nội bộ"
                      rows="3"
                      className="admin-feedback-note"
                    />
                    <textarea
                      value={feedbackDraft.response}
                      onChange={(event) => setFeedbackDraft({ ...feedbackDraft, response: event.target.value })}
                      placeholder="Phản hồi cho khách"
                      aria-label="Phản hồi cho khách"
                      rows="4"
                      className="admin-feedback-response"
                      disabled={Boolean(selectedDetail.response)}
                    />
                    <div className="admin-form-actions">
                      <button type="button" onClick={() => handleSaveFeedbackWork("save")}>Lưu note/trạng thái</button>
                      <button type="button" onClick={() => handleSaveFeedbackWork("respond")} disabled={Boolean(selectedDetail.response)}>
                        {selectedDetail.response ? "Đã gửi phản hồi" : "Gửi phản hồi"}
                      </button>
                    </div>
                    <dl>
                      <div><dt>Category</dt><dd>{selectedDetail.categoryLabel}</dd></div>
                      <div><dt>Priority</dt><dd>{selectedDetail.priorityLabel}</dd></div>
                      <div className="admin-feedback-response-box"><dt>Phản hồi cho khách</dt><dd>{selectedDetail.response || "Chưa phản hồi"}</dd></div>
                      <div className="admin-feedback-note-box"><dt>Admin note</dt><dd>{(selectedDetail.adminNotes || []).map((item) => `${item.adminName || "Admin"}: ${item.note}`).join(" | ") || "Chưa có"}</dd></div>
                      <div><dt>Lịch sử</dt><dd>{(selectedDetail.history || []).map((item) => `${formatAdminDateTime(item.createdAt)}: ${item.action} ${item.to || ""}`).join(" | ") || "Chưa có"}</dd></div>
                    </dl>
                  </div>
                ) : selectedDetail ? (
                  <dl>
                    {Object.entries(selectedDetail).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{formatDetailValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>Chọn một dòng để xem chi tiết.</p>
                )}
              </article>
              ) : null}
            </aside>
          </div>
        )}
      </section>
      {confirmDialog ? (
        <div className="admin-confirm-backdrop" role="presentation" onClick={() => closeConfirm(false)}>
          <section className="admin-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="admin-confirm-title">{confirmDialog.title}</h2>
            <p>{confirmDialog.message}</p>
            <div className="admin-confirm-actions">
              <button type="button" onClick={() => closeConfirm(false)}>Hủy</button>
              <button type="button" onClick={() => closeConfirm(true)}>{confirmDialog.confirmText}</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}




