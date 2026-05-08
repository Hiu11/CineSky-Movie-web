import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createAdminMovie,
  deleteAdminMovie,
  getAdminActivity,
  getAdminBookings,
  getAdminDeletedMovies,
  getAdminOverview,
  getAdminUsers,
  getMovieById,
  getMovies,
  restoreAdminMovie,
  updateAdminUserRole,
  updateAdminMovie,
  uploadAdminPoster,
} from "../../services/movieService";
import "./AdminPage.css";

const moduleConfig = [
  { key: "movies", label: "Movies", statusLabel: "Status" },
  { key: "showtimes", label: "Showtimes", statusLabel: "Time" },
  { key: "cinemas", label: "Cinemas", statusLabel: "Status" },
  { key: "users", label: "Users", statusLabel: "Role" },
  { key: "orders", label: "Tickets / orders", statusLabel: "Payment" },
  { key: "payments", label: "Payments", statusLabel: "Status" },
  { key: "trash", label: "Trash", statusLabel: "Deleted" },
  { key: "activity", label: "Activity log", statusLabel: "Action" },
];

const initialData = {
  movies: [
    { id: "MV001", name: "Song Hỷ Lâm Nguy", status: "Đang chiếu", time: "20/04/2026", value: "128 vé" },
    { id: "MV002", name: "Mưa Đỏ", status: "Đang chiếu", time: "22/08/2025", value: "96 vé" },
    { id: "MV003", name: "Cải Mả", status: "Đang chiếu", time: "31/10/2025", value: "74 vé" },
    { id: "MV004", name: "Supergirl", status: "Sắp chiếu", time: "26/06/2026", value: "42 quan tâm" },
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
  trash: [],
  activity: [
    { id: "LOG001", name: "Cập nhật phim Mưa Đỏ", status: "UPDATE", time: "05/05/2026", value: "Sửa lịch chiếu và trạng thái" },
    { id: "LOG002", name: "Thêm suất chiếu Song Hỷ", status: "CREATE", time: "05/05/2026", value: "Phòng 01 • 20:40" },
    { id: "LOG003", name: "Xóa đơn OD003", status: "DELETE", time: "04/05/2026", value: "Đơn đã hủy" },
  ],
};

const readOnlyModules = new Set(
  moduleConfig.map((module) => module.key).filter((key) => !["movies", "trash", "activity"].includes(key))
);
const initialRevenueTrend = [0, 0, 0, 0, 0, 0, 0];
const initialMovieRevenue = [];
const initialPaymentState = [
  { label: "Paid", value: 0, color: "#f7b400" },
  { label: "Cancelled", value: 0, color: "#ef4444" },
];

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
    const createdAt = new Date(booking.createdAt);
    const dayIndex = Number.isNaN(createdAt.getTime())
      ? 6
      : Math.min(6, Math.max(0, 6 - Math.floor((Date.now() - createdAt.getTime()) / 86400000)));
    const movieTitle = booking.movieTitle || "Movie ticket";

    dailyRevenue[dayIndex] += revenue;
    revenueByMovie.set(movieTitle, (revenueByMovie.get(movieTitle) || 0) + revenue);

    if (booking.status === "cancelled") {
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
        label: "Paid",
        value: totalBookings ? Math.round(((totalBookings - cancelledCount) / totalBookings) * 100) : 0,
        color: "#f7b400",
      },
      {
        label: "Cancelled",
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
  const [activeModule, setActiveModule] = useState("movies");
  const [records, setRecords] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(createMovieForm);
  const [editingId, setEditingId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [formError, setFormError] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [activePaymentLabel, setActivePaymentLabel] = useState("");
  const [isPosterUploading, setIsPosterUploading] = useState(false);
  const [revenueTrend, setRevenueTrend] = useState(initialRevenueTrend);
  const [movieRevenue, setMovieRevenue] = useState(initialMovieRevenue);
  const [paymentState, setPaymentState] = useState(initialPaymentState);
  const [dashboardStats, setDashboardStats] = useState([
    { label: "Users", value: "0", helper: "Synced from database" },
    { label: "Bookings", value: "0", helper: "Saved ticket bookings" },
    { label: "Reviews", value: "0", helper: "User reviews" },
    { label: "Favorites", value: "0", helper: "Current favorites" },
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
          { label: "Users", value: String(overview.users || 0), helper: "Synced from database" },
          { label: "Bookings", value: String(overview.bookings || 0), helper: "Saved ticket bookings" },
          { label: "Reviews", value: String(overview.reviews || 0), helper: "User reviews" },
          { label: "Favorites", value: String(overview.favorites || 0), helper: `${overview.feedbackEntries || 0} feedback entries` },
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
        const [users, bookings, activity] = await Promise.all([
          getAdminUsers({ limit: 20 }),
          getAdminBookings({ limit: 20 }),
          getAdminActivity({ limit: 50 }).catch(() => []),
        ]);

        if (!isMounted) {
          return;
        }

        const safeBookings = Array.isArray(bookings) ? bookings : [];
        const nextCharts = buildDashboardCharts(safeBookings);

        setRevenueTrend(nextCharts.revenueTrend);
        setMovieRevenue(nextCharts.movieRevenue);
        setPaymentState(nextCharts.paymentState);

        if ((!Array.isArray(users) || users.length === 0) && safeBookings.length === 0 && (!Array.isArray(activity) || activity.length === 0)) {
          return;
        }

        setRecords((current) => ({
          ...current,
          users: Array.isArray(users) && users.length > 0 ? users.map((user) => ({
            id: String(user.id),
            name: user.fullName || user.email,
            status: user.role === "admin" ? "Admin" : "User",
            time: formatAdminDateTime(user.createdAt),
            value: `${user.stats?.bookings || 0} orders • ${user.email || "No email"}`,
            role: user.role || "user",
            email: user.email || "",
          })) : current.users,
          orders: safeBookings.length > 0 ? safeBookings.map((booking) => ({
            id: String(booking.id),
            name: `${(booking.seatNumbers || []).length} tickets ${booking.movieTitle || "Movie ticket"}`,
            status: booking.status === "cancelled" ? "Cancelled" : "Paid",
            time: [booking.displayDate, booking.displayTime].filter(Boolean).join(" • ") || formatAdminDateTime(booking.createdAt),
            value: `${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND • ${booking.customerName || booking.customerEmail || "Guest"}`,
          })) : current.orders,
          payments: safeBookings.length > 0 ? safeBookings.map((booking) => ({
            id: String(booking.id),
            name: `Booking ${String(booking.id).slice(-6)}`,
            status: booking.status === "cancelled" ? "Cancelled" : "Paid",
            time: formatAdminDateTime(booking.createdAt),
            value: `${Number(booking.totalPrice || 0).toLocaleString("vi-VN")} VND`,
          })) : current.payments,
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
          item.id.toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((first, second) =>
        sortDir === "asc"
          ? first.name.localeCompare(second.name, "vi")
          : second.name.localeCompare(first.name, "vi")
      );
  }, [activeRecords, search, sortDir, statusFilter]);

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

  const switchModule = (moduleKey) => {
    setActiveModule(moduleKey);
    setSearch("");
    setStatusFilter("all");
    setPage(1);
    setForm(moduleKey === "movies" ? createMovieForm() : createEmptyForm());
    setEditingId("");
    setSelectedDetail(null);
    setFormError("");
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

      const confirmed = window.confirm(
        editingId ? "Xác nhận lưu thay đổi phim này?" : "Xác nhận thêm phim mới?"
      );

      if (!confirmed) {
        return;
      }

      try {
        const previousMovie = editingId ? await getMovieById(editingId).catch(() => null) : null;
        const savedMovie = editingId
          ? await updateAdminMovie(editingId, movieFormToPayload(form))
          : await createAdminMovie(movieFormToPayload(form));
        const freshMovie = savedMovie;

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
        setSelectedDetail(nextRecord);
        setFormError("");
      } catch (error) {
        window.alert(error.message || "Khong the luu phim.");
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
      setSelectedDetail(record);
      setFormError("");
      return;
    }

    setForm(record);
    setEditingId(record.id);
    setFormError("");
  };

  const handleDelete = async (recordId) => {
    if (readOnlyModules.has(activeModule)) {
      setFormError("This module is read-only until delete APIs are connected.");
      return;
    }

    if (!window.confirm("Xác nhận xóa phim này? Thao tác này không thể hoàn tác.")) {
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

    if (!window.confirm("Khôi phục phim này từ thùng rác?")) {
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

    if (!undo || !window.confirm("Hoàn tác thao tác này?")) {
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

    if (!window.confirm(`Đổi role của ${record.name} thành ${nextRole}?`)) {
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

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          CineSky
        </Link>
        <nav className="admin-nav">
          <button className={activeModule === "dashboard" ? "active" : ""} onClick={() => switchModule("dashboard")}>
            Dashboard
          </button>
          {moduleConfig.map((module) => (
            <button key={module.key} className={activeModule === module.key ? "active" : ""} onClick={() => switchModule(module.key)}>
              {module.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <span>Admin panel</span>
            <h1>{activeModule === "dashboard" ? "Dashboard overview" : `Manage ${activeConfig.label.toLowerCase()}`}</h1>
          </div>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </header>

        {activeModule === "dashboard" ? (
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
                <h2>Revenue trend by {dateRange}</h2>
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
                <h2>Payment status</h2>
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
          <div className="admin-workspace">
            <section className="admin-panel admin-table-panel">
              <div className="admin-toolbar">
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or ID" />
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button onClick={() => setSortDir((current) => (current === "asc" ? "desc" : "asc"))}>
                  Sort {sortDir === "asc" ? "A-Z" : "Z-A"}
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>{activeConfig.statusLabel}</th>
                      <th>Time</th>
                      <th>Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.name}</td>
                        <td><span className="admin-status">{record.status}</span></td>
                        <td>{record.time}</td>
                        <td>{record.value}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button onClick={() => setSelectedDetail(record)}>View</button>
                            {activeModule === "trash" ? (
                              <button onClick={() => handleRestoreMovie(record)}>Restore</button>
                            ) : null}
                            {activeModule === "activity" ? (
                              <button disabled={!record.undo} onClick={() => handleUndoActivity(record)}>Undo</button>
                            ) : null}
                            {activeModule === "users" ? (
                              <button onClick={() => handleToggleUserRole(record)}>
                                {record.role === "admin" ? "Make User" : "Make Admin"}
                              </button>
                            ) : null}
                            {activeModule !== "trash" && activeModule !== "activity" ? (
                              <>
                                {activeModule !== "users" ? <button onClick={() => handleEdit(record)}>Edit</button> : null}
                                {activeModule !== "users" ? <button onClick={() => handleDelete(record.id)}>Delete</button> : null}
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
                <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                <span>Page {page}/{totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
              </div>
            </section>

            <aside className="admin-side-panels">
              {activeModule !== "trash" && activeModule !== "activity" ? (
              <form className="admin-panel admin-form" onSubmit={handleSubmit}>
                <h2>{editingId ? "Edit record" : "Add record"}</h2>
                {formError ? <p className="admin-form-error">{formError}</p> : null}
                {activeModule === "movies" ? (
                  <>
                    <datalist id="genre-suggestions">{movieSuggestions.genres.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="country-suggestions">{movieSuggestions.country.map((item) => <option key={item} value={item} />)}</datalist>
                    <datalist id="showtime-suggestions">{movieSuggestions.showtimes.map((item) => <option key={item} value={item} />)}</datalist>
                    <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Movie ID tự tạo nếu trống" disabled={Boolean(editingId)} />
                    <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tên phim" />
                    <div className="admin-poster-picker">
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
                    <input required value={form.trailer} onChange={(event) => setForm({ ...form, trailer: event.target.value })} placeholder="Link trailer YouTube" />
                    <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Mô tả phim" rows="4" />
                    <div className="admin-multi-field">
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
                    <textarea value={form.cast} onChange={(event) => setForm({ ...form, cast: event.target.value })} placeholder="Diễn viên, mỗi dòng: Tên: Vai" rows="3" />
                    <div className="admin-multi-field">
                      <input value={form.gallery} onChange={(event) => setForm({ ...form, gallery: event.target.value })} placeholder="Gallery URL, cách nhau bằng dấu phẩy hoặc xuống dòng" />
                      <button type="button" onClick={() => appendMultiValue("gallery", form.poster)}>Thêm poster vào gallery</button>
                    </div>
                    <textarea value={form.trailerFacts} onChange={(event) => setForm({ ...form, trailerFacts: event.target.value })} placeholder="Trailer facts, mỗi dòng: Nhãn: Giá trị" rows="3" />
                    <input value={form.trailerPanelLabel} onChange={(event) => setForm({ ...form, trailerPanelLabel: event.target.value })} placeholder="Nhãn panel trailer" />
                    <input value={form.trailerPanelTitle} onChange={(event) => setForm({ ...form, trailerPanelTitle: event.target.value })} placeholder="Tiêu đề panel trailer" />
                    <textarea value={form.trailerPanelDescription} onChange={(event) => setForm({ ...form, trailerPanelDescription: event.target.value })} placeholder="Mô tả panel trailer" rows="3" />
                    <div className="admin-multi-field">
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
                    <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Auto ID if empty" />
                    <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" />
                    <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="Status" />
                    <input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="Time" />
                    <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="Value / note" />
                  </>
                )}
                <button type="submit">{editingId ? "Save changes" : "Add new"}</button>
              </form>
              ) : null}

              <article className="admin-panel admin-detail">
                <h2>Details</h2>
                {selectedDetail ? (
                  <dl>
                    {Object.entries(selectedDetail).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{formatDetailValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>Select a row to view details.</p>
                )}
              </article>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
