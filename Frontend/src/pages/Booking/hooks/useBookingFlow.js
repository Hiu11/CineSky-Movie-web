import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createBooking,
  getBookingHistory,
  getBookingFees,
  getMovieShowtimes,
} from "../../../services/movieService";
import { updateStoredUser } from "../../../services/authService";

// --------------- Constants ---------------
const DATE_OPTIONS_DAYS = 7;
const PAYMENT_WINDOW_SECONDS = 15 * 60;
const DEFAULT_SERVICE_FEE_PER_TICKET = 3000;

export const PAYMENT_PROVIDERS = {
  bank: [
    "Vietcombank", "VietinBank", "BIDV", "Agribank", "Sacombank",
    "Techcombank", "MB Bank", "ACB", "VPBank", "TPBank", "NCB", "OCB",
    "HDBank", "MSB", "SeABank", "SHB", "VIB", "Eximbank",
    "Nam A Bank", "ABBank", "PVcomBank", "BaoViet Bank",
  ],
  card: ["Visa", "Mastercard", "JCB", "UnionPay", "Amex"],
  wallet: ["VNPay QR", "MoMo", "ZaloPay", "ShopeePay"],
};

export const LOCALIZED_PAYMENT_METHODS = [
  { id: "bank", label: "ATM nội địa", helper: "Cổng ngân hàng VNPay" },
  { id: "card", label: "Thẻ quốc tế", helper: "Visa, Mastercard, JCB" },
  { id: "wallet", label: "Ví điện tử", helper: "VNPay QR, MoMo, ZaloPay" },
];

export const PAYMENT_SEARCH_PLACEHOLDERS = {
  bank: "Tìm kiếm ngân hàng...",
  card: "Tìm kiếm loại thẻ...",
  wallet: "Tìm kiếm ví điện tử...",
};

export const PAYMENT_PROVIDER_LOGOS = {
  Vietcombank: { logo: "https://api.vietqr.io/img/VCB.png", color: "#00a859" },
  VietinBank: { logo: "https://api.vietqr.io/img/CTG.png", color: "#0072bc" },
  BIDV: { logo: "https://api.vietqr.io/img/BIDV.png", color: "#0066b2" },
  Agribank: { logo: "https://api.vietqr.io/img/VBA.png", color: "#b32a2a" },
  Sacombank: { logo: "https://api.vietqr.io/img/STB.png", color: "#0d5cba" },
  Techcombank: { logo: "https://api.vietqr.io/img/TCB.png", color: "#ed1c24" },
  "MB Bank": { logo: "https://api.vietqr.io/img/MB.png", color: "#003b95" },
  ACB: { logo: "https://api.vietqr.io/img/ACB.png", color: "#0085cd" },
  VPBank: { logo: "https://api.vietqr.io/img/VPB.png", color: "#00a950" },
  TPBank: { logo: "https://api.vietqr.io/img/TPB.png", color: "#502082" },
  NCB: { logo: "https://api.vietqr.io/img/NCB.png", color: "#0f62ac" },
  OCB: { logo: "https://api.vietqr.io/img/OCB.png", color: "#008940" },
  HDBank: { logo: "https://api.vietqr.io/img/HDB.png", color: "#f8a41b" },
  MSB: { logo: "https://api.vietqr.io/img/MSB.png", color: "#ff6600" },
  SeABank: { logo: "https://api.vietqr.io/img/SEAB.png", color: "#ee1c25" },
  SHB: { logo: "https://api.vietqr.io/img/SHB.png", color: "#f48220" },
  VIB: { logo: "https://api.vietqr.io/img/VIB.png", color: "#005baa" },
  Eximbank: { logo: "https://api.vietqr.io/img/EIB.png", color: "#007bbb" },
  "Nam A Bank": { logo: "https://api.vietqr.io/img/NAB.png", color: "#0a3a7c" },
  ABBank: { logo: "https://api.vietqr.io/img/ABB.png", color: "#007bbf" },
  PVcomBank: { logo: "https://api.vietqr.io/img/PVB.png", color: "#0a56a4" },
  "BaoViet Bank": { logo: "https://api.vietqr.io/img/BVB.png", color: "#0055a5" },
  Visa: { domain: "visa.com", color: "#1a1f71" },
  Mastercard: { domain: "mastercard.com", color: "#eb001b" },
  JCB: { domain: "jcb.co.jp", color: "#003a8c" },
  UnionPay: { domain: "unionpayintl.com", color: "#005a78" },
  Amex: { domain: "americanexpress.com", color: "#007bc4" },
  "VNPay QR": { domain: "vnpay.vn", color: "#005baa" },
  MoMo: { domain: "momo.vn", color: "#a50064" },
  ZaloPay: { domain: "zalopay.vn", color: "#0088ff" },
  ShopeePay: { domain: "shopeepay.vn", color: "#ee4d2d" },
};

// --------------- Pure utilities ---------------
export const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");
export const formatCountdown = (totalSeconds = 0) => {
  const safe = Math.max(Number(totalSeconds) || 0, 0);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
};

const buildScreeningDateTime = (dateIso = "", timeLabel = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso)) || !/^\d{2}:\d{2}$/.test(String(timeLabel))) {
    return null;
  }
  const date = new Date(`${dateIso}T${timeLabel}:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isShowtimeInPast = (dateIso = "", timeLabel = "", now = new Date()) => {
  const dt = buildScreeningDateTime(dateIso, timeLabel);
  return dt ? dt.getTime() <= now.getTime() : false;
};

const buildRollingDateOptions = (days = DATE_OPTIONS_DAYS) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      weekdayLabel: new Intl.DateTimeFormat("vi-VN", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(date),
      dateLabel: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(date),
    };
  });
};

// --------------- Main hook ---------------
export function useBookingFlow({ showToast } = {}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const movieId = searchParams.get("movieId");

  const availableDateOptions = useMemo(() => buildRollingDateOptions(), []);

  const [sessionUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const isAuthenticated = Boolean(sessionUser?.id || sessionUser?.email);

  // Booking selections
  const [selectedScreeningDate, setSelectedScreeningDate] = useState(availableDateOptions[0]?.iso || "");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCinemaName, setSelectedCinemaName] = useState("");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [selectedProvider, setSelectedProvider] = useState(PAYMENT_PROVIDERS.bank[0]);
  const [providerSearch, setProviderSearch] = useState("");

  // QR Payment
  const [useQrPayment, setUseQrPayment] = useState(false);
  const [isQrPaymentConfirmed, setIsQrPaymentConfirmed] = useState(false);
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState("");

  // Payment form
  const [paymentForm, setPaymentForm] = useState({ ownerName: "", reference: "", expiry: "", secureCode: "", promoCode: "" });

  // Data
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [serviceFeePerTicket, setServiceFeePerTicket] = useState(DEFAULT_SERVICE_FEE_PER_TICKET);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth > 1240 : true
  );
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const [seatScale, setSeatScale] = useState(1);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Fetch service fee from API (no hardcode)
  useEffect(() => {
    getBookingFees()
      .then((data) => { if (data?.serviceFeePerTicket) setServiceFeePerTicket(data.serviceFeePerTicket); })
      .catch(() => {}); // fallback to default 3000
  }, []);

  useEffect(() => {
    setSelectedSeats([]);
    setSelectedScreeningDate(availableDateOptions[0]?.iso || "");
    setSubmitMessage({ type: "", message: "" });
  }, [availableDateOptions, movieId]);

  useEffect(() => {
    const nextProviders = PAYMENT_PROVIDERS[selectedPaymentMethod];
    setSelectedProvider(nextProviders[0]);
    setProviderSearch("");
    setUseQrPayment(false);
    setIsQrPaymentConfirmed(false);
  }, [selectedPaymentMethod]);

  useEffect(() => {
    const handleResize = () => setIsDesktopViewport(window.innerWidth > 1240);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getMovieShowtimes(movieId);
        if (!mounted) return;
        setMovie(data.movie);
        setShowtimes(data.showtimes || []);
        setSelectedCinemaName("");
        setSelectedShowtimeId("");
        setSelectedSeats([]);
      } catch (err) {
        if (mounted) { setMovie(null); setShowtimes([]); setErrorMessage(err.message || "Không thể tải thông tin đặt vé."); }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (movieId) fetch();
    else { setMovie(null); setShowtimes([]); setIsLoading(false); }
    return () => { mounted = false; };
  }, [movieId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!sessionUser?.id && !sessionUser?.email) { setBookingHistory([]); return; }
      try {
        setIsHistoryLoading(true);
        const payload = await getBookingHistory({ limit: 6 });
        if (mounted) setBookingHistory(Array.isArray(payload?.bookings) ? payload.bookings : []);
      } catch { if (mounted) setBookingHistory([]); }
      finally { if (mounted) setIsHistoryLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [sessionUser]);

  // Derived values
  const cinemaOptions = useMemo(() => {
    const map = new Map();
    showtimes.forEach((st) => {
      if (!map.has(st.cinemaName)) map.set(st.cinemaName, { cinemaName: st.cinemaName, cinemaAddress: st.cinemaAddress });
    });
    return Array.from(map.values());
  }, [showtimes]);

  const filteredShowtimes = useMemo(
    () => showtimes.filter((st) => st.cinemaName === selectedCinemaName && !isShowtimeInPast(selectedScreeningDate, st.displayTime, currentTime)),
    [currentTime, selectedCinemaName, selectedScreeningDate, showtimes]
  );

  const selectedScreeningDateOption = useMemo(
    () => availableDateOptions.find((d) => d.iso === selectedScreeningDate) || availableDateOptions[0] || null,
    [availableDateOptions, selectedScreeningDate]
  );
  const selectedScreeningDateLabel = selectedScreeningDateOption
    ? `${selectedScreeningDateOption.weekdayLabel} • ${selectedScreeningDateOption.dateLabel}` : "";

  const selectedShowtime = useMemo(
    () => showtimes.find((st) => String(st.id) === String(selectedShowtimeId)) || null,
    [showtimes, selectedShowtimeId]
  );

  // Auto-expire stale showtime
  useEffect(() => {
    if (!selectedShowtime || !isShowtimeInPast(selectedScreeningDate, selectedShowtime.displayTime, currentTime)) return;
    setSelectedShowtimeId("");
    setSelectedSeats([]);
    setSubmitMessage({ type: "error", message: "Suất chiếu này đã qua giờ. Vui lòng chọn suất chiếu khác." });
  }, [currentTime, selectedScreeningDate, selectedShowtime]);

  useEffect(() => { setPaymentSecondsLeft(PAYMENT_WINDOW_SECONDS); setIsQrPaymentConfirmed(false); }, [selectedShowtimeId]);

  // Payment countdown
  useEffect(() => {
    if (!selectedShowtime || paymentSecondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setPaymentSecondsLeft((s) => { if (s <= 1) { window.clearInterval(id); return 0; } return s - 1; });
    }, 1000);
    return () => window.clearInterval(id);
  }, [selectedShowtime, paymentSecondsLeft]);

  // QR generation
  const qrPaymentPayload = useMemo(() => JSON.stringify({
    type: "CINESKY_QR_PAYMENT",
    provider: selectedProvider,
    movieId: movie?.id || "",
    movieTitle: movie?.title || "",
    showtimeId: selectedShowtime?.id || "",
    seats: selectedSeats,
    amount: (selectedShowtime ? Number(selectedShowtime.price || 0) * selectedSeats.length : 0) + selectedSeats.length * serviceFeePerTicket,
    currency: "VND",
  }), [movie, selectedProvider, selectedSeats, selectedShowtime, serviceFeePerTicket]);

  useEffect(() => {
    if (!useQrPayment) { setPaymentQrDataUrl(""); setIsQrPaymentConfirmed(false); return; }
    let mounted = true;
    QRCode.toDataURL(qrPaymentPayload, { errorCorrectionLevel: "M", margin: 1, width: 220, color: { dark: "#111827", light: "#ffffff" } })
      .then((url) => { if (mounted) setPaymentQrDataUrl(url); })
      .catch(() => { if (mounted) setPaymentQrDataUrl(""); });
    return () => { mounted = false; };
  }, [qrPaymentPayload, useQrPayment]);

  useEffect(() => { setIsQrPaymentConfirmed(false); }, [selectedShowtimeId, selectedProvider, selectedSeats.length]);

  // Auto-open summary when QR payment is confirmed
  useEffect(() => {
    if (useQrPayment && isQrPaymentConfirmed && selectedCinemaName && selectedShowtimeId && selectedSeats.length > 0) {
      setIsSummaryCollapsed(false);
    }
  }, [useQrPayment, isQrPaymentConfirmed, selectedCinemaName, selectedShowtimeId, selectedSeats.length]);

  const bookedSeats = selectedShowtime?.bookedSeats || [];
  const ticketSubtotal = selectedShowtime ? Number(selectedShowtime.price || 0) * selectedSeats.length : 0;
  const serviceFee = selectedSeats.length > 0 ? selectedSeats.length * serviceFeePerTicket : 0;
  const finalTotal = ticketSubtotal + serviceFee;
  const seatBaseSize = isDesktopViewport ? 30 : 11;
  const isPaymentExpired = Boolean(selectedShowtime) && paymentSecondsLeft <= 0;
  const paymentCountdownLabel = isPaymentExpired ? "Hết giờ" : formatCountdown(paymentSecondsLeft);
  const isComingSoon = showtimes.length === 0;
  const isDesktopSummaryCollapsed = isDesktopViewport && isSummaryCollapsed;

  const isPaymentFormReady = Boolean(
    (useQrPayment && isQrPaymentConfirmed) ||
    (paymentForm.reference.trim() && paymentForm.ownerName.trim() &&
      (selectedPaymentMethod === "wallet" || (paymentForm.expiry.trim() && paymentForm.secureCode.trim())))
  );

  const visibleProviders = useMemo(() => {
    const src = PAYMENT_PROVIDERS[selectedPaymentMethod] || [];
    if (!providerSearch.trim()) return src;
    return src.filter((p) => p.toLowerCase().includes(providerSearch.trim().toLowerCase()));
  }, [providerSearch, selectedPaymentMethod]);

  const movieMetaItems = [
    (movie?.duration || movie?.durationMinutes) ? `${movie.duration || movie.durationMinutes} phút` : "",
    movie?.genre,
    movie?.country,
  ].filter(Boolean);

  const bookingStepStates = useMemo(() => {
    const steps = [
      { id: "cinema", label: "Chọn rạp", helper: selectedCinemaName || "Bắt đầu với cụm rạp phù hợp", complete: Boolean(selectedCinemaName) },
      {
        id: "showtime", label: "Suất chiếu",
        helper: selectedShowtime?.displayTime && selectedScreeningDateLabel
          ? `${selectedScreeningDateLabel} • ${selectedShowtime.displayTime}` : "Tiếp theo là ngày và giờ chiếu",
        complete: Boolean(selectedShowtimeId),
      },
      { id: "seat", label: "Chọn ghế", helper: selectedSeats.length > 0 ? `${selectedSeats.length} ghế đã chọn` : "Chưa chọn ghế", complete: selectedSeats.length > 0 },
      { id: "payment", label: "Thanh toán", helper: isPaymentFormReady ? "Đã đủ thông tin xác nhận" : "Điền thông tin để hoàn tất", complete: Boolean(isPaymentFormReady) },
    ];
    const currentIndex = steps.findIndex((s) => !s.complete);
    return steps.map((s, i) => ({
      ...s,
      status: s.complete ? "complete" : i === (currentIndex === -1 ? steps.length - 1 : currentIndex) ? "current" : "upcoming",
    }));
  }, [isPaymentFormReady, selectedCinemaName, selectedScreeningDateLabel, selectedSeats.length, selectedShowtime, selectedShowtimeId]);

  // Handlers
  const toggleSeat = useCallback((seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats((prev) => prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]);
  }, [bookedSeats]);

  const handleCinemaChange = useCallback((name) => {
    setSelectedCinemaName(name);
    setSelectedShowtimeId("");
    setSelectedSeats([]);
    setSubmitMessage({ type: "", message: "" });
  }, []);

  const handleScreeningDateChange = useCallback((val) => {
    setSelectedScreeningDate(val);
    setSelectedShowtimeId("");
    setSelectedSeats([]);
    setSubmitMessage({ type: "", message: "" });
  }, []);

  const handleShowtimeChange = useCallback((id) => {
    const next = showtimes.find((st) => String(st.id) === String(id));
    if (next && isShowtimeInPast(selectedScreeningDate, next.displayTime, currentTime)) {
      setSelectedShowtimeId("");
      setSelectedSeats([]);
      setSubmitMessage({ type: "error", message: "Suất chiếu này đã qua giờ. Vui lòng chọn suất chiếu khác." });
      return;
    }
    setSelectedShowtimeId(String(id));
    setSelectedSeats([]);
    setSubmitMessage({ type: "", message: "" });
  }, [showtimes, selectedScreeningDate, currentTime]);

  const handlePaymentFieldChange = useCallback((field) => (e) => {
    setPaymentForm((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;
    if (!isAuthenticated) {
      showToast?.({ type: "info", title: "Cần đăng nhập", message: "Vui lòng đăng nhập trước khi đặt vé." });
      setSubmitMessage({ type: "error", message: "Bạn cần đăng nhập trước khi xác nhận đặt vé." });
      navigate("/login");
      return;
    }
    if (!isPaymentFormReady) {
      setSubmitMessage({ type: "error", message: "Vui lòng hoàn thiện thông tin thanh toán trước khi xác nhận đặt vé." });
      return;
    }
    if (isPaymentExpired) {
      setSubmitMessage({ type: "error", message: "Hết thời gian giữ chỗ. Vui lòng chọn lại suất chiếu để tiếp tục thanh toán." });
      return;
    }
    if (isShowtimeInPast(selectedScreeningDate, selectedShowtime.displayTime, currentTime)) {
      setSelectedShowtimeId("");
      setSelectedSeats([]);
      setSubmitMessage({ type: "error", message: "Suất chiếu này đã qua giờ. Vui lòng chọn suất chiếu khác." });
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmitMessage({ type: "", message: "" });
      const booking = await createBooking({
        screeningDate: selectedScreeningDate,
        screeningDateLabel: selectedScreeningDateLabel,
        movieId: movie.id,
        showtimeId: selectedShowtime.id,
        seatNumbers: selectedSeats,
        paymentMethod: selectedPaymentMethod,
        paymentProvider: selectedProvider,
        paymentReference: useQrPayment ? `QR-${Date.now()}` : paymentForm.reference,
      });
      if (booking.membership) updateStoredUser({ ...sessionUser, membership: booking.membership });
      setShowtimes((prev) => prev.map((st) =>
        String(st.id) === String(selectedShowtime.id)
          ? { ...st, bookedSeats: [...new Set([...(st.bookedSeats || []), ...selectedSeats])] }
          : st
      ));
      const receipt = {
        bookingId: booking.id,
        ticketCode: booking.ticketCode,
        movieTitle: movie.title,
        cinemaName: selectedShowtime.cinemaName,
        roomName: selectedShowtime.roomName,
        displayDate: selectedScreeningDateLabel || selectedShowtime.displayDate,
        displayTime: selectedShowtime.displayTime,
        seatNumbers: booking.seatNumbers,
        paymentLabel: [LOCALIZED_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.label, useQrPayment ? `${selectedProvider} QR` : selectedProvider].filter(Boolean).join(" • "),
        totalPrice: booking.totalPrice ?? finalTotal,
        paymentStatus: booking.paymentStatus || "mock_paid",
      };
      sessionStorage.setItem("lastBookingReceipt", JSON.stringify(receipt));
      setSelectedSeats([]);
      showToast?.({ type: "success", title: "Đặt vé thành công", message: `${movie.title} • ${booking.seatNumbers.join(", ")} • ${formatCurrency(booking.totalPrice ?? finalTotal)} VND` });
      navigate("/booking/success", { replace: true, state: { receipt } });
    } catch (err) {
      showToast?.({ type: "error", title: "Đặt vé thất bại", message: err.message || "Không thể đặt vé lúc này." });
      setSubmitMessage({ type: "error", message: err.message || "Không thể đặt vé lúc này." });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedShowtime, selectedSeats, isAuthenticated, isPaymentFormReady, isPaymentExpired,
    selectedScreeningDate, selectedScreeningDateLabel, movie, selectedPaymentMethod, selectedProvider,
    useQrPayment, paymentForm.reference, sessionUser, currentTime, navigate, showToast, finalTotal,
  ]);

  return {
    // Data
    movieId, movie, showtimes, bookingHistory, availableDateOptions, cinemaOptions, filteredShowtimes,
    selectedShowtime, selectedScreeningDateOption, selectedScreeningDateLabel,
    // Selections
    selectedCinemaName, selectedShowtimeId, selectedScreeningDate,
    selectedSeats, selectedPaymentMethod, selectedProvider, providerSearch,
    // Payment state
    paymentForm, useQrPayment, setUseQrPayment, isQrPaymentConfirmed, setIsQrPaymentConfirmed,
    paymentQrDataUrl, visibleProviders,
    // UI state
    isLoading, isHistoryLoading, errorMessage, submitMessage,
    isSubmitting, isDesktopViewport, isSummaryCollapsed, setIsSummaryCollapsed,
    isDesktopSummaryCollapsed, seatScale, setSeatScale, currentTime,
    // Computed
    bookedSeats, ticketSubtotal, serviceFee, finalTotal, seatBaseSize,
    isPaymentExpired, paymentCountdownLabel, isComingSoon, isPaymentFormReady,
    movieMetaItems, bookingStepStates,
    // Handlers
    toggleSeat, handleCinemaChange, handleScreeningDateChange, handleShowtimeChange,
    handlePaymentFieldChange, handleConfirmBooking, setSelectedPaymentMethod, setSelectedProvider,
    setProviderSearch, setShowtimes, setSelectedSeats, isAuthenticated, sessionUser,
    formatCurrency, formatCountdown,
  };
}
