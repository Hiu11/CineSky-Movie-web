import { useEffect, useMemo, useRef, useState } from "react";
import {
  createAdminMovie,
  createAdminPromotion,
  checkInAdminTicket,
  deleteAdminMovie,
  deleteAdminPromotion,
  getAdminActivity,
  getAdminAnalytics,
  getAdminBookings,
  getAdminDeletedMovies,
  getAdminFeedback,
  getAdminOverview,
  getAdminPromotions,
  getAdminUsers,
  lookupAdminTicket,
  getMovieById,
  getMovies,
  restoreAdminMovie,
  searchAdminTmdbMovie,
  updateAdminFeedback,
  updateAdminUserRole,
  updateAdminMovie,
  updateAdminPromotion,
  uploadAdminPoster,
} from "../../services/movieService";
import AdminParticles from "../../components/AdminParticles/AdminParticles";
import AdminAnalyticsView from "./components/AdminAnalyticsView";
import AdminCheckinView from "./components/AdminCheckinView";
import AdminConfirmDialog from "./components/AdminConfirmDialog";
import AdminDashboardView from "./components/AdminDashboardView";
import AdminRecordModal from "./components/AdminRecordModal";
import AdminRecordsTable from "./components/AdminRecordsTable";
import AdminPageHeader from "./components/AdminPageHeader";
import AdminSidebar from "./components/AdminSidebar";
import "./AdminPage.css";

import {
  moduleConfig,
  adminNavGroups,
  ADMIN_MODULE_STORAGE_KEY,
  analyticsModuleKeys,
  adminModuleKeys,
  getInitialAdminModule,
  initialData,
  createEmptyAdminData,
  readOnlyModules,
  initialRevenueTrend,
  initialMovieRevenue,
  initialPaymentState,
  feedbackDateFilters,
  getOptionLabel,
  dateRangeTitles,
  padDatePart,
  formatDateInput,
  formatMonthInput,
  getCurrentYearInput,
  parseLocalDateInput,
  getAnalyticsRangeSettings,
  cinemaCatalog,
  defaultCinemaName,
  roomToCinemaName,
  normalizeCinemaName,
  createEmptyForm,
  createPromotionForm,
  createMovieForm,
  formatAdminDateTime,
  buildDashboardCharts,
  getBookingDate,
  isRecordInAnalyticsRange,
  isBookingInRange,
  normalizeChartRows,
  addMapValue,
  findMovieByTitle,
  buildAnalyticsData,
  joinList,
  joinKeyValueLines,
  mapMovieToRecord,
  mapPromotionToRecord,
  mapDeletedMovieToRecord,
  mapFeedbackToRecord,
  mapMovieToForm,
  mapPromotionToForm,
  splitList,
  normalizeComparable,
  requiredMovieFields,
  validateMovieForm,
  validatePromotionForm,
  movieFormToPayload,
  promotionFormToPayload
} from "./utils/adminPageUtils";
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
  const [analyticsDate, setAnalyticsDate] = useState(formatDateInput);
  const [analyticsMonth, setAnalyticsMonth] = useState(formatMonthInput);
  const [analyticsYear, setAnalyticsYear] = useState(getCurrentYearInput);
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
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [showAllMovieAnalytics, setShowAllMovieAnalytics] = useState(false);
  const [adminFeedbackAlerts, setAdminFeedbackAlerts] = useState([]);
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

    const loadAnalytics = async () => {
      try {
        const analytics = await getAdminAnalytics({
          range: dateRange,
          date: dateRange === "day" ? analyticsDate : "",
          month: dateRange === "month" ? analyticsMonth : "",
          year: dateRange === "year" ? analyticsYear : "",
        });

        if (isMounted) {
          setAdminAnalytics(analytics);
        }
      } catch {
        if (isMounted) {
          setAdminAnalytics(null);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [analyticsDate, analyticsMonth, analyticsYear, dateRange]);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        const movies = await getMovies({ limit: 500 }).catch(() => []);
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
        const [users, bookings, activity, feedbackEntries, promotions] = await Promise.all([
          getAdminUsers({ limit: 20 }),
          getAdminBookings({ limit: 500 }),
          getAdminActivity({ limit: 50 }).catch(() => []),
          getAdminFeedback({ limit: 100 }).catch(() => []),
          getAdminPromotions().catch(() => []),
        ]);

        if (!isMounted) {
          return;
        }

        const safeBookings = Array.isArray(bookings) ? bookings : [];
        const feedbackRecords = Array.isArray(feedbackEntries) ? feedbackEntries.map(mapFeedbackToRecord) : [];
        const nextCharts = buildDashboardCharts(safeBookings);

        setAdminBookings(safeBookings);
        setRevenueTrend(nextCharts.revenueTrend);
        setMovieRevenue(nextCharts.movieRevenue);
        setAdminFeedbackAlerts(feedbackRecords.filter((item) => item.statusKey === "new").slice(0, 3));
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
                `${normalizeCinemaName(booking.cinemaName, booking.roomName)}-${booking.roomName || "Phòng chiếu"}`,
                {
                  id: `RM${String((booking.roomName || "01").replace(/\D/g, "") || "01").padStart(3, "0")}`,
                  name: `${normalizeCinemaName(booking.cinemaName, booking.roomName)} - ${booking.roomName || "Phòng chiếu"}`,
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
          feedback: feedbackRecords.length > 0
            ? feedbackRecords
            : current.feedback,
          promotions: Array.isArray(promotions) && promotions.length > 0
            ? promotions.map(mapPromotionToRecord)
            : current.promotions,
          activity: Array.isArray(activity) && activity.length > 0
            ? activity.map((item) => ({
                id: String(item.id),
                name: item.name,
                status: item.status,
                time: formatAdminDateTime(item.time),
                createdAt: item.time,
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
  const analyticsFilters = useMemo(
    () => ({
      date: analyticsDate,
      month: analyticsMonth,
      year: analyticsYear,
    }),
    [analyticsDate, analyticsMonth, analyticsYear]
  );
  const analyticsData = useMemo(
    () => {
      if (adminAnalytics) {
        return adminAnalytics;
      }

      return buildAnalyticsData({
        bookings: adminBookings,
        movies: records.movies,
        users: records.users,
        feedback: records.feedback,
        range: dateRange,
        filters: analyticsFilters,
      });
    },
    [adminAnalytics, adminBookings, analyticsFilters, dateRange, records.feedback, records.movies, records.users]
  );
  const compactDashboardStats = useMemo(() => dashboardStats.slice(0, 4), [dashboardStats]);
  const supportDashboardStats = useMemo(() => dashboardStats.slice(4), [dashboardStats]);
  const visibleMovieAnalyticsRows = showAllMovieAnalytics
    ? analyticsData.allMovieRows
    : analyticsData.allMovieRows.slice(0, 8);
  const activeTitle = analyticsModuleKeys.has(activeModule)
    ? activeConfig.label
    : activeModule === "dashboard"
      ? "Tổng quan vận hành"
      : `Quản lý ${activeConfig.label.toLowerCase()}`;

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
      .sort((first, second) => {
        if (activeModule === "activity") {
          return new Date(second.createdAt || second.time).getTime() - new Date(first.createdAt || first.time).getTime();
        }

        return sortDir === "asc"
          ? first.name.localeCompare(second.name, "vi")
          : second.name.localeCompare(first.name, "vi");
      });
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

  const getEmptyFormForModule = (moduleKey = activeModule) => {
    if (moduleKey === "movies") return createMovieForm();
    if (moduleKey === "promotions") return createPromotionForm();
    return createEmptyForm();
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
        setFormError(error.message || "Không thể lưu ảnh poster vào database.");
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
    const nextModule = adminModuleKeys.has(moduleKey) ? moduleKey : "dashboard";

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
    setForm(getEmptyFormForModule(nextModule));
    setEditingId("");
    setIsCrudMode(false);
    setSelectedDetail(null);
    setFeedbackDraft({ status: "new", category: "other", priority: "medium", adminNote: "", response: "" });
    setFormError("");
  };

  const openFeedbackAlerts = () => {
    switchModule("feedback");
    setStatusFilter("Mới");
    setSelectedDetail(adminFeedbackAlerts[0] || null);
  };

  const getDraftKey = (moduleKey = activeModule) => `cinesky-admin-draft-${moduleKey}`;

  const openCreateForm = async () => {
    if (readOnlyModules.has(activeModule)) {
      setFormError("Module này hiện chỉ đọc, chưa có API lưu dữ liệu.");
      return;
    }

    let nextForm = getEmptyFormForModule(activeModule);
    let nextEditingId = "";
    const draftRaw = localStorage.getItem(getDraftKey());

    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw);
        const shouldRestore = await askConfirm({
          title: "Khôi phục bản nháp",
          message: "Bạn có bản nháp đã lưu trên trình duyệt. Khôi phục để tiếp tục nhập?",
          confirmText: "Khôi phục",
        });

        if (shouldRestore && draft?.form) {
          nextForm = draft.form;
          nextEditingId = draft.editingId || "";
        }
      } catch {
        localStorage.removeItem(getDraftKey());
      }
    }

    setForm(nextForm);
    setEditingId(nextEditingId);
    setSelectedDetail(null);
    setIsCrudMode(true);
    setFormError("");
  };

  const closeCrudMode = () => {
    setIsCrudMode(false);
    setForm(getEmptyFormForModule(activeModule));
    setEditingId("");
    setFormError("");
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      getDraftKey(),
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
        localStorage.removeItem(getDraftKey("movies"));

        setRecords((current) => {
          const nextActivity = {
            id: `LOG${Date.now()}`,
            name: nextRecord.name,
            status: editingId ? "UPDATE" : "CREATE",
            time: formatAdminDateTime(new Date().toISOString()),
            createdAt: new Date().toISOString(),
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

    if (activeModule === "promotions") {
      const validationMessage = validatePromotionForm(form, records.promotions, editingId);

      if (validationMessage) {
        setFormError(validationMessage);
        return;
      }

      const confirmed = await askConfirm({
        title: editingId ? "Luu thay doi uu dai" : "Them uu dai moi",
        message: editingId ? "Xac nhan luu thay doi uu dai nay?" : "Xac nhan them uu dai moi?",
        confirmText: editingId ? "Luu thay doi" : "Them uu dai",
      });

      if (!confirmed) {
        return;
      }

      try {
        const savedPromotion = editingId
          ? await updateAdminPromotion(editingId, promotionFormToPayload(form))
          : await createAdminPromotion(promotionFormToPayload(form));
        const nextRecord = mapPromotionToRecord(savedPromotion);

        localStorage.removeItem(getDraftKey("promotions"));
        setRecords((current) => ({
          ...current,
          promotions: editingId
            ? current.promotions.map((item) => (item.id === editingId ? nextRecord : item))
            : [nextRecord, ...current.promotions],
          activity: [
            {
              id: `LOG${Date.now()}`,
              name: nextRecord.name,
              status: editingId ? "PROMO_UPDATE" : "PROMO_CREATE",
              time: formatAdminDateTime(new Date().toISOString()),
              createdAt: new Date().toISOString(),
              value: nextRecord.value,
            },
            ...current.activity,
          ],
        }));
        setForm(createPromotionForm());
        setEditingId("");
        setIsCrudMode(false);
        setSelectedDetail(nextRecord);
        setFormError("");
      } catch (error) {
        setFormError(error.message || "Khong the luu uu dai.");
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

    if (activeModule === "promotions") {
      setForm(mapPromotionToForm(record));
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

    if (activeModule === "promotions") {
      try {
        const disabledPromotion = await deleteAdminPromotion(recordId);
        const disabledRecord = mapPromotionToRecord(disabledPromotion);

        setRecords((current) => ({
          ...current,
          promotions: current.promotions.map((item) => (item.id === recordId ? disabledRecord : item)),
          activity: [
            {
              id: `LOG${Date.now()}`,
              name: disabledRecord.name,
              status: "PROMO_DISABLE",
              time: formatAdminDateTime(new Date().toISOString()),
              createdAt: new Date().toISOString(),
              value: disabledRecord.value,
            },
            ...current.activity,
          ],
        }));
        setSelectedDetail((current) => (current?.id === recordId ? disabledRecord : current));
        if (editingId === recordId) {
          setForm(createPromotionForm());
          setEditingId("");
        }
        setFormError("");
      } catch (error) {
        setFormError(error.message || "Khong the tat uu dai.");
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
      <AdminParticles />
      <AdminSidebar activeModule={activeModule} navGroups={adminNavGroups} onSwitchModule={switchModule} />

      <section className="admin-main">
        <AdminPageHeader
          activeTitle={activeTitle}
          analyticsDate={analyticsDate}
          analyticsMonth={analyticsMonth}
          analyticsYear={analyticsYear}
          dateRange={dateRange}
          setAnalyticsDate={setAnalyticsDate}
          setAnalyticsMonth={setAnalyticsMonth}
          setAnalyticsYear={setAnalyticsYear}
          setDateRange={setDateRange}
        />

        {adminFeedbackAlerts.length > 0 ? (
          <section className="admin-feedback-alert">
            <div>
              <span>{adminFeedbackAlerts.length} góp ý mới</span>
              <h2>Có phản hồi mới</h2>
            </div>
            <button type="button" onClick={openFeedbackAlerts}>
              Xem góp ý mới
            </button>
          </section>
        ) : null}

        {activeModule === "checkin" ? (
          <AdminCheckinView
            handleCheckInTicket={handleCheckInTicket}
            handleLookupTicket={handleLookupTicket}
            isTicketChecking={isTicketChecking}
            setTicketSearch={setTicketSearch}
            ticketLookup={ticketLookup}
            ticketMessage={ticketMessage}
            ticketSearch={ticketSearch}
          />
        ) : activeModule === "dashboard" ? (
          <AdminDashboardView
            analyticsData={analyticsData}
            compactDashboardStats={compactDashboardStats}
            dateRange={dateRange}
            supportDashboardStats={supportDashboardStats}
            switchModule={switchModule}
          />
        ) : analyticsModuleKeys.has(activeModule) ? (
          <AdminAnalyticsView
            activeModule={activeModule}
            analyticsData={analyticsData}
            setShowAllMovieAnalytics={setShowAllMovieAnalytics}
            showAllMovieAnalytics={showAllMovieAnalytics}
            visibleMovieAnalyticsRows={visibleMovieAnalyticsRows}
          />

        ) : (
          <div className={"admin-workspace" + (isCrudMode ? " admin-workspace--editor" : "")}>
            <AdminRecordsTable
              activeConfig={activeConfig}
              activeModule={activeModule}
              feedbackDateFilter={feedbackDateFilter}
              feedbackRatingFilter={feedbackRatingFilter}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleMarkFeedbackSpam={handleMarkFeedbackSpam}
              handleRestoreMovie={handleRestoreMovie}
              handleToggleUserRole={handleToggleUserRole}
              handleUndoActivity={handleUndoActivity}
              isCrudMode={isCrudMode}
              openCreateForm={openCreateForm}
              page={page}
              search={search}
              setFeedbackDateFilter={setFeedbackDateFilter}
              setFeedbackRatingFilter={setFeedbackRatingFilter}
              setPage={setPage}
              setSearch={setSearch}
              setSelectedDetail={setSelectedDetail}
              setSortDir={setSortDir}
              setStatusFilter={setStatusFilter}
              sortDir={sortDir}
              statusFilter={statusFilter}
              statuses={statuses}
              totalPages={totalPages}
              visibleRecords={visibleRecords}
            />

            <AdminRecordModal
              activeModule={activeModule}
              appendMultiValue={appendMultiValue}
              closeCrudMode={closeCrudMode}
              editingId={editingId}
              feedbackDraft={feedbackDraft}
              form={form}
              formError={formError}
              handlePosterFileChange={handlePosterFileChange}
              handleSaveDraft={handleSaveDraft}
              handleSaveFeedbackWork={handleSaveFeedbackWork}
              handleSubmit={handleSubmit}
              handleSyncTmdbMetadata={handleSyncTmdbMetadata}
              isCrudMode={isCrudMode}
              isPosterUploading={isPosterUploading}
              isTmdbSyncing={isTmdbSyncing}
              selectedDetail={selectedDetail}
              setFeedbackDraft={setFeedbackDraft}
              setForm={setForm}
              setSelectedDetail={setSelectedDetail}
            />
          </div>
        )}
      </section>
      <AdminConfirmDialog dialog={confirmDialog} onClose={closeConfirm} />
    </main>
  );
}




