import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createBooking,
  getBookingHistory,
  getMovieShowtimes,
} from "../../services/movieService";
import { updateStoredUser } from "../../services/authService";
import "./Booking.css";

const PAYMENT_PROVIDERS = {
  bank: [
    "Vietcombank",
    "VietinBank",
    "BIDV",
    "Agribank",
    "Sacombank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "VPBank",
    "TPBank",
    "NCB",
    "OCB",
    "HDBank",
    "MSB",
    "SeABank",
    "SHB",
    "VIB",
    "Eximbank",
    "Nam A Bank",
    "ABBank",
    "PVcomBank",
    "BaoViet Bank",
  ],
  card: ["Visa", "Mastercard", "JCB", "UnionPay", "Amex"],
  wallet: ["VNPay QR", "MoMo", "ZaloPay", "ShopeePay"],
};

const PAYMENT_PROVIDER_LOGOS = {
  Vietcombank: { domain: "vietcombank.com.vn", color: "#16a34a" },
  VietinBank: { domain: "vietinbank.vn", color: "#2563eb" },
  BIDV: { domain: "bidv.com.vn", color: "#0891b2" },
  Agribank: { domain: "agribank.com.vn", color: "#b91c1c" },
  Sacombank: { domain: "sacombank.com.vn", logo: "https://www.sacombank.com.vn/favicon.ico", color: "#d4a019" },
  Techcombank: { domain: "techcombank.com", color: "#dc2626" },
  "MB Bank": { domain: "mbbank.com.vn", color: "#1d4ed8" },
  ACB: { domain: "acb.com.vn", logo: "https://www.acb.com.vn/favicon.ico", color: "#0284c7" },
  VPBank: { domain: "vpbank.com.vn", color: "#65a30d" },
  TPBank: { domain: "tpb.vn", color: "#7c3aed" },
  NCB: { domain: "ncb-bank.vn", color: "#dc2626" },
  OCB: { domain: "ocb.com.vn", color: "#0ea5e9" },
  HDBank: { domain: "hdbank.com.vn", color: "#dc2626" },
  MSB: { domain: "msb.com.vn", color: "#f97316" },
  SeABank: { domain: "seabank.com.vn", color: "#ef4444" },
  SHB: { domain: "shb.com.vn", color: "#f97316" },
  VIB: { domain: "vib.com.vn", color: "#f97316" },
  Eximbank: { domain: "eximbank.com.vn", color: "#2563eb" },
  "Nam A Bank": { domain: "namabank.com.vn", color: "#2563eb" },
  ABBank: { domain: "abbank.vn", color: "#10b981" },
  PVcomBank: { domain: "pvcombank.com.vn", color: "#059669" },
  "BaoViet Bank": { domain: "baovietbank.vn", color: "#2563eb" },
  Visa: { domain: "visa.com", color: "#1d4ed8" },
  Mastercard: { domain: "mastercard.com", color: "#f97316" },
  JCB: { domain: "global.jcb", logo: "https://www.global.jcb/en/favicon.ico", color: "#0f766e" },
  UnionPay: { domain: "unionpayintl.com", color: "#dc2626" },
  Amex: { domain: "americanexpress.com", color: "#0284c7" },
  "VNPay QR": { domain: "vnpay.vn", color: "#2563eb" },
  MoMo: { domain: "momo.vn", color: "#be185d" },
  ZaloPay: { domain: "zalopay.vn", color: "#2563eb" },
  ShopeePay: { domain: "shopeepay.vn", color: "#f97316" },
};

const getProviderLogo = (provider = "") => {
  const meta = PAYMENT_PROVIDER_LOGOS[provider] || { domain: "vnpay.vn" };
  if (meta.logo) {
    return meta.logo;
  }

  return `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128`;
};

const PAYMENT_WINDOW_SECONDS = 15 * 60;
const DATE_OPTIONS_DAYS = 7;

const LOCALIZED_PAYMENT_METHODS = [
  { id: "bank", label: "ATM nội địa", helper: "Cổng ngân hàng VNPay" },
  { id: "card", label: "Thẻ quốc tế", helper: "Visa, Mastercard, JCB" },
  { id: "wallet", label: "Ví điện tử", helper: "VNPay QR, MoMo, ZaloPay" },
];

const PAYMENT_SEARCH_PLACEHOLDERS = {
  bank: "Tìm kiếm ngân hàng...",
  card: "Tìm kiếm loại thẻ...",
  wallet: "Tìm kiếm ví điện tử...",
};

const createSeatPatternRows = (rowBlocks = []) =>
  rowBlocks.map((blocks, rowIndex) => ({
    rowKey: String.fromCharCode(65 + rowIndex),
    left: blocks[0] || 0,
    center: blocks[1] || 0,
    right: blocks[2] || 0,
  }));

const SMALL_HALL_SEAT_PATTERN = createSeatPatternRows([
  [2, 10, 2],
  [2, 10, 2],
  [2, 14, 2],
  [2, 14, 2],
  [2, 16, 2],
  [2, 16, 2],
  [2, 18, 2],
  [2, 18, 2],
  [3, 18, 3],
  [3, 18, 3],
]);

const MEDIUM_HALL_SEAT_PATTERN = createSeatPatternRows([
  [2, 12, 2],
  [2, 12, 2],
  [2, 16, 2],
  [2, 16, 2],
  [2, 18, 2],
  [2, 18, 2],
  [3, 18, 3],
  [3, 18, 3],
  [3, 20, 3],
  [3, 20, 3],
]);

const LARGE_HALL_SEAT_PATTERN = createSeatPatternRows([
  [2, 14, 2],
  [2, 14, 2],
  [3, 16, 3],
  [3, 16, 3],
  [3, 18, 3],
  [3, 18, 3],
  [4, 20, 4],
  [4, 20, 4],
  [4, 22, 4],
  [4, 22, 4],
  [4, 22, 4],
  [4, 22, 4],
]);

const ROOM_SEAT_PATTERNS = {
  "Sky Hall 1": SMALL_HALL_SEAT_PATTERN,
  "Sky Hall 2": SMALL_HALL_SEAT_PATTERN,
  "Moon Hall": MEDIUM_HALL_SEAT_PATTERN,
  "Galaxy Hall": MEDIUM_HALL_SEAT_PATTERN,
  "Nova Hall": LARGE_HALL_SEAT_PATTERN,
  "Aurora Hall": LARGE_HALL_SEAT_PATTERN,
};

const groupSeatsByRow = (seatLabels = []) => {
  const rowMap = new Map();

  seatLabels.forEach((seatLabel) => {
    const rowKey = String(seatLabel).replace(/\d+/g, "") || "ROW";
    const currentSeats = rowMap.get(rowKey) || [];
    currentSeats.push(seatLabel);
    rowMap.set(rowKey, currentSeats);
  });

  return Array.from(rowMap.entries()).map(([rowKey, seats]) => ({
    rowKey,
    seats: seats.sort(
      (first, second) =>
        Number(String(first).replace(/\D+/g, "")) -
        Number(String(second).replace(/\D+/g, ""))
    ),
  }));
};

const getFallbackSeatPattern = (seatCount = 0) => {
  if (seatCount <= 6) {
    return { left: 0, center: seatCount, right: 0 };
  }

  const sideCount = seatCount >= 26 ? 3 : 2;
  const centerCount = Math.max(seatCount - sideCount * 2, 0);

  return {
    left: sideCount,
    center: centerCount,
    right: sideCount,
  };
};

const getSeatPatternForRow = (roomName = "", rowKey = "", rowIndex = 0, seatCount = 0) => {
  const roomPattern = ROOM_SEAT_PATTERNS[roomName] || [];
  const matchedPattern =
    roomPattern.find((pattern) => pattern.rowKey === rowKey) || roomPattern[rowIndex];

  if (
    matchedPattern &&
    matchedPattern.left + matchedPattern.center + matchedPattern.right === seatCount
  ) {
    return matchedPattern;
  }

  return getFallbackSeatPattern(seatCount);
};

const splitSeatRowByPattern = (seatLabels = [], seatPattern = { left: 0, center: 0, right: 0 }) => {
  const leftCount = Math.max(seatPattern.left || 0, 0);
  const centerCount = Math.max(seatPattern.center || 0, 0);

  return {
    leftSeats: seatLabels.slice(0, leftCount),
    centerSeats: seatLabels.slice(leftCount, leftCount + centerCount),
    rightSeats: seatLabels.slice(leftCount + centerCount),
  };
};

const buildSeatSlots = (seatLabels = [], slotCount = 0, align = "center") => {
  if (slotCount <= seatLabels.length) {
    return seatLabels;
  }

  const totalPadding = slotCount - seatLabels.length;
  const leadingPadding =
    align === "start" ? 0 : align === "end" ? totalPadding : Math.floor(totalPadding / 2);
  const trailingPadding = totalPadding - leadingPadding;

  return [
    ...Array.from({ length: leadingPadding }, () => null),
    ...seatLabels,
    ...Array.from({ length: trailingPadding }, () => null),
  ];
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatCountdown = (totalSeconds = 0) => {
  const safeSeconds = Math.max(Number(totalSeconds) || 0, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
};

const buildScreeningDateTime = (dateIso = "", timeLabel = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso)) || !/^\d{2}:\d{2}$/.test(String(timeLabel))) {
    return null;
  }

  const date = new Date(`${dateIso}T${timeLabel}:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isShowtimeInPast = (dateIso = "", timeLabel = "", now = new Date()) => {
  const screeningDateTime = buildScreeningDateTime(dateIso, timeLabel);
  return screeningDateTime ? screeningDateTime.getTime() <= now.getTime() : false;
};

const buildRollingDateOptions = (days = DATE_OPTIONS_DAYS) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`,
      weekdayLabel: new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(date),
      dateLabel: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(date),
    };
  });
};

const formatBookingCreatedAt = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getSeatToneForRow = (rowKey = "", totalRows = 0) => {
  const rowIndex = Math.max(String(rowKey).charCodeAt(0) - 65, 0);

  if (totalRows >= 10 && rowIndex >= totalRows - 2) {
    return "couple";
  }

  if (rowIndex >= Math.max(3, Math.floor(totalRows / 3)) && rowIndex <= totalRows - 3) {
    return "vip";
  }

  return "standard";
};

export default function Booking({ showToast }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const movieId = searchParams.get("movieId");
  const availableDateOptions = useMemo(() => buildRollingDateOptions(), []);
  const [sessionUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const rawUser = sessionStorage.getItem("user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  });
  const isAuthenticated = Boolean(sessionUser?.id || sessionUser?.email);

  const [selectedScreeningDate, setSelectedScreeningDate] = useState(availableDateOptions[0]?.iso || "");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCinemaName, setSelectedCinemaName] = useState("");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank");
  const [selectedProvider, setSelectedProvider] = useState(PAYMENT_PROVIDERS.bank[0]);
  const [providerSearch, setProviderSearch] = useState("");
  const [useQrPayment, setUseQrPayment] = useState(false);
  const [isQrPaymentConfirmed, setIsQrPaymentConfirmed] = useState(false);
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    ownerName: "",
    reference: "",
    expiry: "",
    secureCode: "",
    promoCode: "",
  });
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    const handleResize = () => {
      setIsDesktopViewport(window.innerWidth > 1240);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBookingData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMovieShowtimes(movieId);

        if (!isMounted) {
          return;
        }

        setMovie(data.movie);
        setShowtimes(data.showtimes || []);
        setSelectedCinemaName("");
        setSelectedShowtimeId("");
        setSelectedSeats([]);
      } catch (error) {
        if (isMounted) {
          setMovie(null);
          setShowtimes([]);
          setErrorMessage(error.message || "Không thể tải thông tin đặt vé từ server.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (movieId) {
      fetchBookingData();
    } else {
      setMovie(null);
      setShowtimes([]);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  useEffect(() => {
    let isMounted = true;

    const loadBookingHistory = async () => {
      if (!sessionUser?.id && !sessionUser?.email) {
        if (isMounted) {
          setBookingHistory([]);
        }
        return;
      }

      try {
        setIsHistoryLoading(true);
        const historyPayload = await getBookingHistory({
          limit: 6,
        });

        if (isMounted) {
          setBookingHistory(Array.isArray(historyPayload?.bookings) ? historyPayload.bookings : []);
        }
      } catch {
        if (isMounted) {
          setBookingHistory([]);
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    loadBookingHistory();

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const cinemaOptions = useMemo(() => {
    const cinemaMap = new Map();

    showtimes.forEach((showtime) => {
      if (!cinemaMap.has(showtime.cinemaName)) {
        cinemaMap.set(showtime.cinemaName, {
          cinemaName: showtime.cinemaName,
          cinemaAddress: showtime.cinemaAddress,
        });
      }
    });

    return Array.from(cinemaMap.values());
  }, [showtimes]);

  const filteredShowtimes = useMemo(
    () =>
      showtimes.filter(
        (showtime) =>
          showtime.cinemaName === selectedCinemaName &&
          !isShowtimeInPast(selectedScreeningDate, showtime.displayTime, currentTime)
      ),
    [currentTime, selectedCinemaName, selectedScreeningDate, showtimes]
  );
  const selectedScreeningDateOption = useMemo(
    () =>
      availableDateOptions.find((dateOption) => dateOption.iso === selectedScreeningDate) ||
      availableDateOptions[0] ||
      null,
    [availableDateOptions, selectedScreeningDate]
  );
  const selectedScreeningDateLabel = selectedScreeningDateOption
    ? `${selectedScreeningDateOption.weekdayLabel} • ${selectedScreeningDateOption.dateLabel}`
    : "";

  const selectedShowtime = useMemo(
    () =>
      showtimes.find((showtime) => String(showtime.id) === String(selectedShowtimeId)) ||
      null,
    [showtimes, selectedShowtimeId]
  );

  useEffect(() => {
    if (!selectedShowtime || !isShowtimeInPast(selectedScreeningDate, selectedShowtime.displayTime, currentTime)) {
      return;
    }

    setSelectedShowtimeId("");
    setSelectedSeats([]);
    setSubmitMessage({
      type: "error",
      message: "Suất chiếu này đã qua giờ. Vui lòng chọn suất chiếu khác.",
    });
  }, [currentTime, selectedScreeningDate, selectedShowtime]);

  useEffect(() => {
    setPaymentSecondsLeft(PAYMENT_WINDOW_SECONDS);
    setIsQrPaymentConfirmed(false);
  }, [selectedShowtimeId]);

  useEffect(() => {
    if (!selectedShowtime || paymentSecondsLeft <= 0) {
      return undefined;
    }

    const countdownInterval = window.setInterval(() => {
      setPaymentSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(countdownInterval);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(countdownInterval);
    };
  }, [selectedShowtime, paymentSecondsLeft]);

  const groupedSeats = useMemo(
    () => groupSeatsByRow(selectedShowtime?.seats || []),
    [selectedShowtime]
  );
  const preparedSeatRows = useMemo(
    () =>
      groupedSeats.map((group, rowIndex) => {
        const seatPattern = getSeatPatternForRow(
          selectedShowtime?.roomName || "",
          group.rowKey,
          rowIndex,
          group.seats.length
        );
        const seatBlocks = splitSeatRowByPattern(group.seats, seatPattern);

        return {
          ...group,
          ...seatPattern,
          ...seatBlocks,
        };
      }),
    [groupedSeats, selectedShowtime]
  );
  const seatLayoutMetrics = useMemo(
    () =>
      preparedSeatRows.reduce(
        (metrics, group) => {
          return {
            maxLeft: Math.max(metrics.maxLeft, group.left || 0),
            maxCenter: Math.max(metrics.maxCenter, group.center || 0),
            maxRight: Math.max(metrics.maxRight, group.right || 0),
          };
        },
        { maxLeft: 0, maxCenter: 0, maxRight: 0 }
      ),
    [preparedSeatRows]
  );
  const isDesktopSummaryCollapsed = isDesktopViewport && isSummaryCollapsed;

  const visibleProviders = useMemo(() => {
    const source = PAYMENT_PROVIDERS[selectedPaymentMethod] || [];
    if (!providerSearch.trim()) {
      return source;
    }

    return source.filter((provider) =>
      provider.toLowerCase().includes(providerSearch.trim().toLowerCase())
    );
  }, [providerSearch, selectedPaymentMethod]);

  const isComingSoon = showtimes.length === 0;
  const movieDuration = movie?.duration || movie?.durationMinutes || movie?.runtime || movie?.time;
  const movieMetaItems = [
    movieDuration ? `${movieDuration} phút` : "",
    movie?.genre,
    movie?.country,
  ].filter(Boolean);
  const bookedSeats = selectedShowtime?.bookedSeats || [];
  const isPaymentExpired = Boolean(selectedShowtime) && paymentSecondsLeft <= 0;
  const paymentCountdownLabel = isPaymentExpired
    ? "Hết giờ"
    : formatCountdown(paymentSecondsLeft);
  const ticketSubtotal = selectedShowtime
    ? Number(selectedShowtime.price || 0) * selectedSeats.length
    : 0;
  const serviceFee = selectedSeats.length > 0 ? selectedSeats.length * 3000 : 0;
  const finalTotal = ticketSubtotal + serviceFee;
  const seatBaseSize = isDesktopViewport ? 30 : 11;

  useEffect(() => {
    setIsQrPaymentConfirmed(false);
  }, [finalTotal, selectedProvider, selectedSeats]);

  const qrPaymentPayload = useMemo(
    () =>
      JSON.stringify({
        type: "CINESKY_QR_PAYMENT",
        provider: selectedProvider,
        movieId: movie?.id || "",
        movieTitle: movie?.title || "",
        showtimeId: selectedShowtime?.id || "",
        seats: selectedSeats,
        amount: finalTotal,
        currency: "VND",
      }),
    [finalTotal, movie, selectedProvider, selectedSeats, selectedShowtime]
  );

  useEffect(() => {
    if (!useQrPayment) {
      setPaymentQrDataUrl("");
      setIsQrPaymentConfirmed(false);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(qrPaymentPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (isMounted) {
          setPaymentQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPaymentQrDataUrl("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [qrPaymentPayload, useQrPayment]);

  const isPaymentFormReady = Boolean(
    (useQrPayment && isQrPaymentConfirmed) ||
      (paymentForm.reference.trim() &&
      paymentForm.ownerName.trim() &&
      (selectedPaymentMethod === "wallet" ||
        (paymentForm.expiry.trim() && paymentForm.secureCode.trim())))
  );
  const bookingStepStates = useMemo(() => {
    const steps = [
      {
        id: "cinema",
        label: "Chọn rạp",
        helper: selectedCinemaName || "Bắt đầu với cụm rạp phù hợp",
        complete: Boolean(selectedCinemaName),
      },
      {
        id: "showtime",
        label: "Suất chiếu",
        helper:
          selectedShowtime?.displayTime && selectedScreeningDateLabel
            ? `${selectedScreeningDateLabel} • ${selectedShowtime.displayTime}`
            : "Tiếp theo là ngày và giờ chiếu",
        complete: Boolean(selectedShowtimeId),
      },
      {
        id: "seat",
        label: "Chọn ghế",
        helper: selectedSeats.length > 0 ? `${selectedSeats.length} ghế đã chọn` : "Chưa chọn ghế",
        complete: selectedSeats.length > 0,
      },
      {
        id: "payment",
        label: "Thanh toán",
        helper: isPaymentFormReady ? "Đã đủ thông tin xác nhận" : "Điền thông tin để hoàn tất",
        complete: Boolean(isPaymentFormReady),
      },
    ];

    const currentIndex = steps.findIndex((step) => !step.complete);

    return steps.map((step, index) => ({
      ...step,
      status:
        step.complete ? "complete" : index === (currentIndex === -1 ? steps.length - 1 : currentIndex) ? "current" : "upcoming",
    }));
  }, [isPaymentFormReady, selectedCinemaName, selectedScreeningDateLabel, selectedSeats.length, selectedShowtime, selectedShowtimeId]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) {
      return;
    }

    setSelectedSeats((previousSeats) =>
      previousSeats.includes(seat)
        ? previousSeats.filter((selectedSeat) => selectedSeat !== seat)
        : [...previousSeats, seat]
    );
  };

  const handleCinemaChange = (cinemaName) => {
    setSelectedCinemaName(cinemaName);
    setSelectedShowtimeId("");
    setSelectedSeats([]);
    setSubmitMessage({ type: "", message: "" });
  };

  const handleScreeningDateChange = (dateValue) => {
    setSelectedScreeningDate(dateValue);
    setSelectedShowtimeId("");
    setSelectedSeats([]);
    setSubmitMessage({ type: "", message: "" });
  };

  const handleShowtimeChange = (showtimeId) => {
    const nextShowtime = showtimes.find((showtime) => String(showtime.id) === String(showtimeId));

    if (nextShowtime && isShowtimeInPast(selectedScreeningDate, nextShowtime.displayTime, currentTime)) {
      setSelectedShowtimeId("");
      setSelectedSeats([]);
      setSubmitMessage({
        type: "error",
        message: "Suất chiếu này đã qua giờ. Vui lòng chọn suất chiếu khác.",
      });
      return;
    }

    setSelectedShowtimeId(String(showtimeId));
    setSelectedSeats([]);
    setSubmitMessage({ type: "", message: "" });
  };

  const handlePaymentFieldChange = (field) => (event) => {
    setPaymentForm((previousState) => ({
      ...previousState,
      [field]: event.target.value,
    }));
  };

  const handleConfirmBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      return;
    }

    if (!isAuthenticated) {
      showToast?.({
        type: "info",
        title: "Cần đăng nhập",
        message: "Vui lòng đăng nhập trước khi đặt vé.",
      });
      setSubmitMessage({
        type: "error",
        message: "Bạn cần đăng nhập trước khi xác nhận đặt vé.",
      });
      navigate("/login");
      return;
    }

    if (!isPaymentFormReady) {
      showToast?.({
        type: "error",
        title: "Thiếu thông tin thanh toán",
        message: "Vui lòng hoàn thiện thông tin thanh toán trước khi xác nhận đặt vé.",
      });
      setSubmitMessage({
        type: "error",
        message: "Vui lòng hoàn thiện thông tin thanh toán trước khi xác nhận đặt vé.",
      });
      return;
    }

    if (isPaymentExpired) {
      showToast?.({
        type: "error",
        title: "Hết thời gian giữ chỗ",
        message: "Vui lòng chọn lại suất chiếu để tiếp tục.",
      });
      setSubmitMessage({
        type: "error",
        message: "Hết thời gian giữ chỗ. Vui lòng chọn lại suất chiếu để tiếp tục thanh toán.",
      });
      return;
    }

    if (isShowtimeInPast(selectedScreeningDate, selectedShowtime.displayTime, currentTime)) {
      setSelectedShowtimeId("");
      setSelectedSeats([]);
      setSubmitMessage({
        type: "error",
        message: "Suất chiếu này đã qua giờ. Vui lòng chọn suất chiếu khác.",
      });
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

      if (booking.membership) {
        updateStoredUser({ ...sessionUser, membership: booking.membership });
      }

      setShowtimes((currentShowtimes) =>
        currentShowtimes.map((showtime) =>
          String(showtime.id) === String(selectedShowtime.id)
            ? {
                ...showtime,
                bookedSeats: [...new Set([...(showtime.bookedSeats || []), ...selectedSeats])],
              }
            : showtime
        )
      );

      const receipt = {
        bookingId: booking.id,
        ticketCode: booking.ticketCode,
        movieTitle: movie.title,
        cinemaName: selectedShowtime.cinemaName,
        roomName: selectedShowtime.roomName,
        displayDate: selectedScreeningDateLabel || selectedShowtime.displayDate,
        displayTime: selectedShowtime.displayTime,
        seatNumbers: booking.seatNumbers,
        paymentLabel: [
          LOCALIZED_PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)?.label,
          useQrPayment ? `${selectedProvider} QR` : selectedProvider,
        ]
          .filter(Boolean)
          .join(" • "),
        totalPrice: booking.totalPrice ?? finalTotal,
        paymentStatus: booking.paymentStatus || "mock_paid",
      };

      sessionStorage.setItem("lastBookingReceipt", JSON.stringify(receipt));
      setSelectedSeats([]);
      setSubmitMessage({
        type: "success",
        message:
          "Đặt vé thành công cho " +
          booking.seatNumbers.join(", ") +
          ". Tổng tiền: " +
          formatCurrency(booking.totalPrice ?? finalTotal) +
          " VND.",
      });
      showToast?.({
        type: "success",
        title: "Đặt vé thành công",
        message: `${movie.title} • ${booking.seatNumbers.join(", ")} • ${formatCurrency(booking.totalPrice ?? finalTotal)} VND`,
      });
      navigate("/booking/success", {
        replace: true,
        state: { receipt },
      });
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Đặt vé thất bại",
        message: error.message || "Không thể đặt vé lúc này.",
      });
      setSubmitMessage({
        type: "error",
        message: error.message || "Không thể đặt vé lúc này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="booking-page booking-page--empty">
        <div className="booking-page__empty-card">
          <span className="booking-page__eyebrow">Đang tải</span>
          <h2>Đang tải thông tin đặt vé...</h2>
          <p>Hệ thống đang chuẩn bị dữ liệu phim, rạp và suất chiếu cho bạn.</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="booking-page booking-page--empty">
        <div className="booking-page__empty-card">
          <span className="booking-page__eyebrow">Không khả dụng</span>
          <h2>{errorMessage || "Không tìm thấy phim"}</h2>
          <p>Vui lòng quay lại danh sách phim để chọn một phim khác hoặc thử lại sau.</p>
          <Link to="/?tab=now" className="booking-page__back-link">
            Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <section className="booking-page__hero">
        <div className="booking-page__hero-copy">
          <span className="booking-page__eyebrow">Đặt vé nhanh</span>
          <h1 className="booking-page__title">{movie.title}</h1>
          <p className="booking-page__subtitle">
            Chọn rạp, ngày xem, suất chiếu, vị trí ghế và phương thức thanh toán để hoàn tất
            trải nghiệm đặt vé theo phong cách CineSky.
          </p>
          <div className="booking-page__meta">
            {movieMetaItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="booking-page__hero-card">
          <span className="booking-page__hero-label">Thông tin nhanh</span>
          <div className="booking-page__hero-grid">
            <div>
              <strong>{cinemaOptions.length}</strong>
              <span>cụm rạp</span>
            </div>
            <div>
              <strong>{showtimes.length}</strong>
              <span>suất chiếu</span>
            </div>
            <div>
              <strong>{selectedSeats.length}</strong>
              <span>ghế đang chọn</span>
            </div>
          </div>
          <Link
            to={"/movie/" + movie.id + "?tab=" + (movie.status === "coming-soon" ? "soon" : "now")}
            className="booking-page__back-link"
          >
            Xem lại chi tiết phim
          </Link>
        </div>
      </section>

      <section className="booking-page__progress" aria-label="Tiến trình đặt vé">
        {bookingStepStates.map((step, index) => (
          <article
            key={step.id}
            className={`booking-page__progress-card booking-page__progress-card--${step.status}`}
          >
            <span className="booking-page__progress-index">0{index + 1}</span>
            <div className="booking-page__progress-copy">
              <strong>{step.label}</strong>
              <small>{step.helper}</small>
            </div>
          </article>
        ))}
      </section>

      <div
        className={
          "booking-page__layout" + (isDesktopSummaryCollapsed ? " is-summary-collapsed" : "")
        }
      >
        <div className="booking-page__main">
          <section className="booking-page__panel">
            <div className="booking-page__panel-header">
              <div>
                <span className="booking-page__eyebrow">Bước 1</span>
                <h2>Chọn rạp</h2>
              </div>
              <p>Ưu tiên cụm rạp thuận tiện để tiếp tục chọn suất chiếu nhanh hơn.</p>
            </div>

            <div className="booking-page__row">
              {cinemaOptions.length > 0 ? (
                cinemaOptions.map((cinema) => (
                  <button
                    key={cinema.cinemaName}
                    onClick={() => handleCinemaChange(cinema.cinemaName)}
                    className={
                      "booking-page__option" +
                      (selectedCinemaName === cinema.cinemaName ? " is-active" : "")
                    }
                  >
                    <span>{cinema.cinemaName}</span>
                    <small>{cinema.cinemaAddress}</small>
                  </button>
                ))
              ) : (
                <p className="booking-page__hint">Phim này hiện chưa có rạp và lịch chiếu.</p>
              )}
            </div>
          </section>

          <section className="booking-page__panel">
            <div className="booking-page__panel-header">
              <div>
                <span className="booking-page__eyebrow">Bước 2</span>
                <h2>Chọn suất chiếu</h2>
              </div>
              <p>Chọn ngày xem và khung giờ phù hợp với lịch trình của bạn trong rạp đã chọn.</p>
            </div>

            <div className="booking-page__date-strip" aria-label="Chọn ngày chiếu">
              {availableDateOptions.map((dateOption) => (
                <button
                  key={dateOption.iso}
                  type="button"
                  onClick={() => handleScreeningDateChange(dateOption.iso)}
                  className={
                    "booking-page__date-option" +
                    (selectedScreeningDate === dateOption.iso ? " is-active" : "")
                  }
                >
                  <span>{dateOption.weekdayLabel}</span>
                  <strong>{dateOption.dateLabel}</strong>
                </button>
              ))}
            </div>

            <div className="booking-page__row">
              {filteredShowtimes.length > 0 ? (
                filteredShowtimes.map((showtime) => (
                  <button
                    key={showtime.id}
                    onClick={() => handleShowtimeChange(showtime.id)}
                    className={
                      "booking-page__option booking-page__option--showtime" +
                      (selectedShowtimeId === String(showtime.id) ? " is-active" : "")
                    }
                  >
                    <span>{showtime.displayTime}</span>
                    <small>{selectedScreeningDateLabel + " • " + showtime.roomName}</small>
                  </button>
                ))
              ) : (
                <p className="booking-page__hint">Phim này hiện chưa có suất chiếu khả dụng.</p>
              )}
            </div>
          </section>

          <section className="booking-page__panel booking-page__panel--screening">
            <div className="booking-page__panel-header booking-page__panel-header--split">
              <div>
                <span className="booking-page__eyebrow">Bước 3</span>
                <h2>Chọn ghế</h2>
              </div>
              <div className="booking-page__screening-meta">
                <span>{selectedScreeningDateLabel || selectedShowtime?.displayDate || "Chưa có lịch"}</span>
                <span>{selectedShowtime?.displayTime || "Chưa có suất"}</span>
                <span>{selectedShowtime?.roomName || "Chưa có phòng"}</span>
              </div>
            </div>

            <div className="booking-page__screening-toolbar">
              <div className="booking-page__legend">
              <span className="booking-page__legend-item">
                <i className="booking-page__legend-swatch"></i>
                Còn trống
              </span>
              <span className="booking-page__legend-item">
                <i className="booking-page__legend-swatch booking-page__legend-swatch--vip"></i>
                Ghế VIP
              </span>
              <span className="booking-page__legend-item">
                <i className="booking-page__legend-swatch booking-page__legend-swatch--couple"></i>
                Ghế couple
              </span>
              <span className="booking-page__legend-item">
                <i className="booking-page__legend-swatch booking-page__legend-swatch--selected"></i>
                Đang chọn
              </span>
              <span className="booking-page__legend-item">
                <i className="booking-page__legend-swatch booking-page__legend-swatch--booked"></i>
                Đã có người đặt
              </span>
              </div>
              <div className="booking-page__zoom-controls">
                <span>Thu phóng ghế</span>
                <button type="button" onClick={() => setSeatScale((current) => Math.max(0.65, current - 0.05))}>
                  -
                </button>
                <strong>{Math.round(seatScale * 100)}%</strong>
                <button type="button" onClick={() => setSeatScale((current) => Math.min(1.5, current + 0.05))}>
                  +
                </button>
              </div>
            </div>

            <div className="booking-page__screening" style={{ "--booking-seat-size": `${Math.round(seatBaseSize * seatScale)}px` }}>
              <div className="booking-page__screen-shell">
                <span className="booking-page__screen-caption">screen</span>
                <div className="booking-page__screen"></div>
              </div>

              {preparedSeatRows.length > 0 ? (
                preparedSeatRows.map((group) => {
                  const seatTone = getSeatToneForRow(group.rowKey, preparedSeatRows.length);
                  const leftSeatSlots = buildSeatSlots(
                    group.leftSeats,
                    seatLayoutMetrics.maxLeft,
                    "start"
                  );
                  const centerSeatSlots = buildSeatSlots(
                    group.centerSeats,
                    seatLayoutMetrics.maxCenter,
                    "center"
                  );
                  const rightSeatSlots = buildSeatSlots(
                    group.rightSeats,
                    seatLayoutMetrics.maxRight,
                    "end"
                  );

                  return (
                    <div key={group.rowKey} className="booking-page__seat-row">
                      <span className="booking-page__seat-label">{group.rowKey}</span>

                      <div className="booking-page__seat-cluster">
                        <div
                          className="booking-page__seat-block booking-page__seat-block--left"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(seatLayoutMetrics.maxLeft, 1)}, var(--booking-seat-size))`,
                          }}
                        >
                          {leftSeatSlots.map((seat, seatIndex) => {
                            if (!seat) {
                              return (
                                <span
                                  key={`${group.rowKey}-left-empty-${seatIndex}`}
                                  className="booking-page__seat-placeholder"
                                  aria-hidden="true"
                                ></span>
                              );
                            }

                            const isBooked = bookedSeats.includes(seat);
                            const isSelected = selectedSeats.includes(seat);

                            return (
                              <button
                                key={seat}
                                onClick={() => toggleSeat(seat)}
                                className={
                                  "booking-page__seat booking-page__seat--" +
                                  seatTone +
                                  (isSelected ? " is-selected" : "") +
                                  (isBooked ? " is-booked" : "")
                                }
                                disabled={isBooked}
                              >
                                {seat}
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className="booking-page__seat-block booking-page__seat-block--center"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(seatLayoutMetrics.maxCenter, 1)}, var(--booking-seat-size))`,
                          }}
                        >
                          {centerSeatSlots.map((seat, seatIndex) => {
                            if (!seat) {
                              return (
                                <span
                                  key={`${group.rowKey}-center-empty-${seatIndex}`}
                                  className="booking-page__seat-placeholder"
                                  aria-hidden="true"
                                ></span>
                              );
                            }

                            const isBooked = bookedSeats.includes(seat);
                            const isSelected = selectedSeats.includes(seat);

                            return (
                              <button
                                key={seat}
                                onClick={() => toggleSeat(seat)}
                                className={
                                  "booking-page__seat booking-page__seat--center booking-page__seat--" +
                                  seatTone +
                                  (isSelected ? " is-selected" : "") +
                                  (isBooked ? " is-booked" : "")
                                }
                                disabled={isBooked}
                              >
                                {seat}
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className="booking-page__seat-block booking-page__seat-block--right"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(seatLayoutMetrics.maxRight, 1)}, var(--booking-seat-size))`,
                          }}
                        >
                          {rightSeatSlots.map((seat, seatIndex) => {
                            if (!seat) {
                              return (
                                <span
                                  key={`${group.rowKey}-right-empty-${seatIndex}`}
                                  className="booking-page__seat-placeholder"
                                  aria-hidden="true"
                                ></span>
                              );
                            }

                            const isBooked = bookedSeats.includes(seat);
                            const isSelected = selectedSeats.includes(seat);

                            return (
                              <button
                                key={seat}
                                onClick={() => toggleSeat(seat)}
                                className={
                                  "booking-page__seat booking-page__seat--" +
                                  seatTone +
                                  (isSelected ? " is-selected" : "") +
                                  (isBooked ? " is-booked" : "")
                                }
                                disabled={isBooked}
                              >
                                {seat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <span className="booking-page__seat-label booking-page__seat-label--right">
                        {group.rowKey}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="booking-page__hint booking-page__hint--center">
                  Suất chiếu này chưa có sơ đồ ghế.
                </p>
              )}
            </div>
          </section>

          <section className="booking-page__panel booking-page__panel--payment">
            <div className="booking-page__panel-header booking-page__panel-header--split">
              <div>
                <span className="booking-page__eyebrow">Bước 4</span>
                <h2>Chọn thanh toán</h2>
              </div>
              <p>Giao diện thử nghiệm mô phỏng luồng chọn cổng thanh toán và thông tin xác nhận.</p>
            </div>

            <div className="booking-page__payment-methods">
              {LOCALIZED_PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={
                    "booking-page__payment-method" +
                    (selectedPaymentMethod === method.id ? " is-active" : "")
                  }
                >
                  <span>{method.label}</span>
                  <small>{method.helper}</small>
                </button>
              ))}
            </div>

            <div className="booking-page__payment-layout">
              <div className="booking-page__payment-bank-card">
                <div className="booking-page__payment-card-header">
                  <div>
                    <strong>Chọn nhà cung cấp</strong>
                    <span>{LOCALIZED_PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)?.helper}</span>
                  </div>
                  <span className="booking-page__payment-badge">Test UI</span>
                </div>

                <div className="booking-page__payment-search">
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={(event) => setProviderSearch(event.target.value)}
                    placeholder={PAYMENT_SEARCH_PLACEHOLDERS[selectedPaymentMethod] || "Tìm kiếm nhà cung cấp..."}
                  />
                </div>

                <div className="booking-page__provider-grid">
                  {visibleProviders.map((provider) => {
                    const logo = getProviderLogo(provider);
                    const providerColor = PAYMENT_PROVIDER_LOGOS[provider]?.color || "#f7b400";

                    return (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => setSelectedProvider(provider)}
                        className={
                          "booking-page__provider-tile" +
                          (selectedProvider === provider ? " is-active" : "")
                        }
                        style={{ "--provider-color": providerColor }}
                      >
                        <img
                          className="booking-page__provider-logo"
                          src={logo}
                          alt={`${provider} logo`}
                        />
                        <span>{provider}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="booking-page__payment-form-card">
                <div className="booking-page__payment-card-header">
                  <div>
                    <strong>Thông tin thanh toán</strong>
                    <span>{selectedProvider}</span>
                  </div>
                  <span
                    className={
                      "booking-page__payment-time" + (isPaymentExpired ? " is-expired" : "")
                    }
                    aria-live="polite"
                  >
                    {paymentCountdownLabel}
                  </span>
                </div>

                <div className="booking-page__qr-switch">
                  <div>
                    <strong>Quét QR thanh toán</strong>
                    <span>Không cần liên kết tài khoản ngân hàng.</span>
                  </div>
                  <button
                    type="button"
                    className={useQrPayment ? "is-active" : ""}
                    onClick={() => {
                      setUseQrPayment((current) => !current);
                      setIsQrPaymentConfirmed(false);
                    }}
                    aria-pressed={useQrPayment}
                  >
                    {useQrPayment ? "Đang bật" : "Bật QR"}
                  </button>
                </div>

                {useQrPayment ? (
                  <div className="booking-page__qr-panel">
                    {paymentQrDataUrl ? (
                      <img src={paymentQrDataUrl} alt="QR thanh toán mô phỏng" />
                    ) : (
                      <div className="booking-page__qr-placeholder">Đang tạo QR...</div>
                    )}
                    <div>
                      <strong>{formatCurrency(finalTotal)} VND</strong>
                      <span>
                        {isQrPaymentConfirmed
                          ? `${selectedProvider} • Đã xác nhận thanh toán`
                          : `${selectedProvider} • Đang chờ thanh toán`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="booking-page__qr-confirm"
                      onClick={() => setIsQrPaymentConfirmed(true)}
                      disabled={isQrPaymentConfirmed || finalTotal <= 0}
                    >
                      {isQrPaymentConfirmed ? "Đã thanh toán" : "Tôi đã thanh toán"}
                    </button>
                  </div>
                ) : (
                <div className="booking-page__payment-form-grid">
                  <label className="booking-page__field booking-page__field--full">
                    <span>
                      {selectedPaymentMethod === "wallet"
                        ? "Số điện thoại / tài khoản"
                        : "Số thẻ / số tài khoản"}
                    </span>
                    <input
                      type="text"
                      value={paymentForm.reference}
                      onChange={handlePaymentFieldChange("reference")}
                      placeholder={
                        selectedPaymentMethod === "wallet"
                          ? "Nhập số điện thoại ví"
                          : "Nhập số thẻ hoặc tài khoản"
                      }
                    />
                  </label>

                  <label className="booking-page__field booking-page__field--full">
                    <span>Tên chủ thẻ / tài khoản</span>
                    <input
                      type="text"
                      value={paymentForm.ownerName}
                      onChange={handlePaymentFieldChange("ownerName")}
                      placeholder="Nhập tên chủ thẻ hoặc chủ tài khoản"
                    />
                  </label>

                  {selectedPaymentMethod !== "wallet" ? (
                    <>
                      <label className="booking-page__field">
                        <span>Ngày hiệu lực</span>
                        <input
                          type="text"
                          value={paymentForm.expiry}
                          onChange={handlePaymentFieldChange("expiry")}
                          placeholder="MM/YY"
                        />
                      </label>

                      <label className="booking-page__field">
                        <span>Mã bảo mật</span>
                        <input
                          type="text"
                          value={paymentForm.secureCode}
                          onChange={handlePaymentFieldChange("secureCode")}
                          placeholder="CVV / OTP"
                        />
                      </label>
                    </>
                  ) : null}

                  <label className="booking-page__field booking-page__field--full">
                    <span>Mã khuyến mãi</span>
                    <input
                      type="text"
                      value={paymentForm.promoCode}
                      onChange={handlePaymentFieldChange("promoCode")}
                      placeholder="Nhập mã giảm giá nếu có"
                    />
                  </label>
                </div>
                )}

                <div className="booking-page__payment-note">
                  Thông tin trên chỉ dùng để mô phỏng giao diện thanh toán, không gửi tới cổng
                  thanh toán thật.
                </div>
              </div>
            </div>
          </section>

          <section className="booking-page__panel booking-page__panel--history">
            <div className="booking-page__panel-header booking-page__panel-header--split">
              <div>
                <span className="booking-page__eyebrow">Bước 5</span>
                <h2>Vé đã đặt gần đây</h2>
              </div>
              <p>Xem lại những giao dịch gần nhất trên tài khoản hiện tại để kiểm tra lịch sử đặt vé.</p>
            </div>

            {sessionUser?.id || sessionUser?.email ? (
              isHistoryLoading ? (
                <p className="booking-page__hint">Đang tải lịch sử đặt vé...</p>
              ) : bookingHistory.length > 0 ? (
                <div className="booking-page__history-list">
                  {bookingHistory.map((booking) => (
                    <article key={booking.id} className="booking-page__history-card">
                      <div className="booking-page__history-head">
                        <div>
                          <strong>{booking.movieTitle || "Vé xem phim"}</strong>
                          <span>
                            {[booking.displayDate, booking.displayTime].filter(Boolean).join(" • ") + (formatBookingCreatedAt(booking.createdAt) ? ` • Đặt lúc ${formatBookingCreatedAt(booking.createdAt)}` : "")}
                          </span>
                        </div>
                        <span
                          className={
                            "booking-page__history-status " +
                            (booking.status === "cancelled"
                              ? "booking-page__history-status--cancelled"
                              : booking.status === "expired"
                              ? "booking-page__history-status--expired"
                              : booking.status === "used"
                              ? "booking-page__history-status--used"
                              : "booking-page__history-status--booked")
                          }
                        >
                          {booking.status === "cancelled"
                            ? "Đã hủy"
                            : booking.status === "expired"
                            ? "Quá hạn"
                            : booking.status === "used"
                            ? "Đã sử dụng"
                            : "Chưa sử dụng"}
                        </span>
                      </div>

                      <div className="booking-page__history-meta">
                        <span>{booking.cinemaName || "CineSky Nguyen Hue"}</span>
                        <span>{booking.roomName || "Chưa rõ phòng"}</span>
                        <span>{(booking.seatNumbers || []).join(", ") || "Chưa có ghế"}</span>
                        <span>{formatCurrency(booking.totalPrice)} VND</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="booking-page__hint">Bạn chưa có vé đã đặt nào trên tài khoản này.</p>
              )
            ) : (
              <p className="booking-page__hint">
                Đăng nhập để xem lại vé đã đặt và lịch sử giao dịch của bạn.
              </p>
            )}
          </section>
        </div>

        <div className="booking-page__summary-shell">
          {isDesktopViewport ? (
            <button
              type="button"
              className="booking-page__summary-toggle"
              onClick={() => setIsSummaryCollapsed((current) => !current)}
              aria-label={
                isSummaryCollapsed
                  ? "Hiện bảng xác nhận thanh toán"
                  : "Ẩn bảng xác nhận thanh toán"
              }
              aria-pressed={isSummaryCollapsed}
            >
              {isSummaryCollapsed ? "<" : ">"}
            </button>
          ) : null}

          <div className="booking-page__summary-stack">
            <aside className="booking-page__summary">
              <div className="booking-page__summary-header">
                <span className="booking-page__eyebrow">Tóm tắt đơn vé</span>
                <h2>Xác nhận trước khi thanh toán</h2>
              </div>

              <div className="booking-page__summary-grid">
                <div className="booking-page__summary-row booking-page__summary-row--wide">
                  <span>Phim</span>
                  <strong>{movie.title}</strong>
                </div>
                <div className="booking-page__summary-row">
                  <span>Rạp</span>
                  <strong>{selectedShowtime?.cinemaName || "Chưa chọn"}</strong>
                </div>
                <div className="booking-page__summary-row">
                  <span>Phòng</span>
                  <strong>{selectedShowtime?.roomName || "Chưa chọn"}</strong>
                </div>
                <div className="booking-page__summary-row booking-page__summary-row--wide">
                  <span>Lịch chiếu</span>
                  <strong>
                    {[selectedScreeningDateLabel || selectedShowtime?.displayDate, selectedShowtime?.displayTime]
                      .filter(Boolean)
                      .join(" • ") || "Chưa có lịch"}
                  </strong>
                </div>
                <div className="booking-page__summary-row booking-page__summary-row--wide">
                  <span>Ghế</span>
                  <strong>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</strong>
                </div>
                <div className="booking-page__summary-row booking-page__summary-row--wide">
                  <span>Thanh toán</span>
                  <strong>
                    {[
                      LOCALIZED_PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)?.label,
                      selectedProvider,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </strong>
                </div>
                <div className="booking-page__summary-row">
                  <span>Tiền vé</span>
                  <strong>{formatCurrency(ticketSubtotal)} VND</strong>
                </div>
                <div className="booking-page__summary-row">
                  <span>Phí dịch vụ</span>
                  <strong>{formatCurrency(serviceFee)} VND</strong>
                </div>
                <div className="booking-page__summary-row booking-page__summary-row--total booking-page__summary-row--wide">
                  <span>Tổng thanh toán</span>
                  <strong>{formatCurrency(finalTotal)} VND</strong>
                </div>
              </div>
            </aside>

            <div className="booking-page__summary-actions">
              <div className="booking-page__policy-note">
                <strong>Lưu ý thanh toán</strong>
                <p>
                  Vé đã được thanh toán sẽ không hỗ trợ hoàn tiền hoặc đổi trả. Vui lòng
                  kiểm tra kỹ rạp, suất chiếu và ghế trước khi xác nhận giao dịch.
                </p>
              </div>

              {isPaymentExpired && !submitMessage.message ? (
                <p className="booking-page__status booking-page__status--error">
                  Hết thời gian giữ chỗ. Vui lòng chọn lại suất chiếu để đặt vé tiếp.
                </p>
              ) : null}

              {submitMessage.message ? (
                <p className={"booking-page__status booking-page__status--" + submitMessage.type}>
                  {submitMessage.message}
                </p>
              ) : null}

              {!isAuthenticated ? (
                <p className="booking-page__status booking-page__status--error">
                  Vui lòng đăng nhập để hoàn tất đặt vé.
                </p>
              ) : null}

              <button
                disabled={
                  selectedSeats.length === 0 ||
                  isComingSoon ||
                  !selectedShowtime ||
                  isSubmitting ||
                  isPaymentExpired ||
                  !isPaymentFormReady
                }
                onClick={handleConfirmBooking}
                className="booking-page__confirm"
              >
                {isSubmitting ? "Đang xử lý thanh toán..." : "Xác nhận đặt vé"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
