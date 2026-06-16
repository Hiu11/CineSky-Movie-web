import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMovieShowtimes, getMovies } from "../../services/movieService";
import {
  applyCinemaTimeOffsets,
  applyShowtimePricing,
  getScreeningPriceMeta,
  isPeakScreeningDate,
} from "../../utils/showtimeSchedule";
import "./ShowtimesPage.css";

const DATE_RANGE_DAYS = 5;
const preferredShowtimeHours = [19, 20, 21, 18, 15, 13, 10, 9, 12, 16, 22, 14, 11];

const timeSlots = [
  { id: "all", label: "Tất cả giờ", from: 0, to: 24 },
  { id: "morning", label: "Buổi sáng", from: 6, to: 12 },
  { id: "afternoon", label: "Buổi chiều", from: 12, to: 18 },
  { id: "evening", label: "Buổi tối", from: 18, to: 24 },
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getVietnamDateParts = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce((map, part) => ({ ...map, [part.type]: part.value }), {});

const addDaysToIso = (iso = "", days = 0) => {
  const [year, month, day] = String(iso).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) {
    return iso;
  }

  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  const parts = getVietnamDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const getCurrentVietnamDateTime = () => {
  const parts = getVietnamDateParts(new Date());
  const hour = Number(parts.hour || 0) % 24;

  return {
    iso: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: hour * 60 + Number(parts.minute || 0),
  };
};

const buildDateOptions = () => {
  const todayIso = getCurrentVietnamDateTime().iso;

  return Array.from({ length: DATE_RANGE_DAYS }, (_, index) => {
    const iso = addDaysToIso(todayIso, index);
    const date = new Date(`${iso}T12:00:00+07:00`);

    return {
      iso,
      day: new Intl.DateTimeFormat("vi-VN", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(date),
      label: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(date),
      title: index === 0 ? "Hôm nay" : index === 1 ? "Ngày mai" : "Chọn ngày",
    };
  });
};

const getHour = (timeLabel = "") => {
  const [hour] = String(timeLabel).split(":").map(Number);
  return Number.isFinite(hour) ? hour : -1;
};

const getTimeMinutes = (timeLabel = "") => {
  if (!/^\d{2}:\d{2}$/.test(String(timeLabel))) {
    return -1;
  }

  const [hour, minute] = String(timeLabel).split(":").map(Number);
  return hour * 60 + minute;
};

const isUpcomingShowtime = (dateIso = "", timeLabel = "", currentDateTime = getCurrentVietnamDateTime()) => {
  if (dateIso !== currentDateTime.iso) {
    return dateIso > currentDateTime.iso;
  }

  return getTimeMinutes(timeLabel) > currentDateTime.minutes;
};

const getSeatStatus = (showtime) => {
  const totalSeats = showtime?.seats?.length || 0;
  const availableSeats = Number(showtime?.availableSeatCount ?? totalSeats);
  const ratio = totalSeats > 0 ? availableSeats / totalSeats : 0;

  if (availableSeats <= 0) {
    return { label: "Hết vé", tone: "soldout" };
  }

  if (ratio <= 0.18) {
    return { label: `Sắp hết, còn ${availableSeats} ghế`, tone: "low" };
  }

  return { label: `Còn ${availableSeats} ghế`, tone: "good" };
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const getMoviePriorityScore = (movie = {}, index = 0) => {
  if (Number.isFinite(movie.heroOrder)) {
    return movie.heroOrder;
  }

  return 100 + Number(movie.catalogOrder ?? index);
};

const getMovieHeatScore = (movie = {}, index = 0) => {
  const heroBoost = Number.isFinite(movie.heroOrder) ? 1000 - movie.heroOrder * 60 : 0;
  const catalogBoost = Math.max(260 - Number(movie.catalogOrder ?? index) * 18, 0);
  const popularityBoost = Number(movie.popularityScore || 0);
  const reviewBoost = Number(movie.reviewCount || 0) * 4 + Number(movie.averageRating || 0) * 12;

  return heroBoost + catalogBoost + popularityBoost + reviewBoost;
};

const sortMoviesByHomePriority = (movies = []) =>
  [...movies].sort((firstMovie, secondMovie) => {
    const firstScore = getMoviePriorityScore(firstMovie);
    const secondScore = getMoviePriorityScore(secondMovie);
    const firstHeat = getMovieHeatScore(firstMovie);
    const secondHeat = getMovieHeatScore(secondMovie);

    return (
      secondHeat - firstHeat ||
      firstScore - secondScore ||
      Number(secondMovie.popularityScore || 0) - Number(firstMovie.popularityScore || 0) ||
      String(firstMovie.title || "").localeCompare(String(secondMovie.title || ""), "vi")
    );
  });

const getShowtimeDisplayLimit = (movie = {}, index = 0, isPeakDate = false) => {
  const heatScore = getMovieHeatScore(movie, index);

  if (Number.isFinite(movie.heroOrder) || heatScore >= 420 || index === 0) {
    return isPeakDate ? 27 : 24;
  }

  if (heatScore >= 300 || index < 3) {
    return isPeakDate ? 21 : 18;
  }

  if (heatScore >= 190 || index < 6) {
    return isPeakDate ? 15 : 12;
  }

  if (heatScore >= 95 || index < 10) {
    return isPeakDate ? 9 : 7;
  }

  return isPeakDate ? 5 : 3;
};

const getShowtimePriority = (showtime = {}, index = 0) => {
  const hour = getHour(showtime.displayTime);
  const preferredDistance = Math.min(
    ...preferredShowtimeHours.map((preferredHour) => Math.abs(preferredHour - hour))
  );

  return preferredDistance * 100 + index;
};

const getCinemaQuotaPattern = (totalLimit = 0, cinemaCount = 1, movieIndex = 0) => {
  if (cinemaCount <= 1) {
    return [totalLimit];
  }

  if (cinemaCount === 2) {
    const largerQuota = Math.ceil(totalLimit * 0.58);
    return movieIndex % 2 === 0
      ? [largerQuota, totalLimit - largerQuota]
      : [totalLimit - largerQuota, largerQuota];
  }

  const quotaPatterns = {
    27: [12, 9, 6],
    24: [10, 8, 6],
    21: [9, 7, 5],
    18: [8, 6, 4],
    15: [7, 5, 3],
    14: [6, 5, 3],
    13: [6, 4, 3],
    12: [5, 4, 3],
    11: [5, 4, 2],
    10: [5, 3, 2],
    9: [4, 3, 2],
    8: [4, 3, 1],
    7: [4, 2, 1],
    6: [3, 2, 1],
    5: [3, 1, 1],
  };
  const basePattern = quotaPatterns[totalLimit] || [
    Math.max(Math.ceil(totalLimit * 0.42), 1),
    Math.max(Math.floor(totalLimit * 0.33), 1),
    Math.max(totalLimit - Math.ceil(totalLimit * 0.42) - Math.floor(totalLimit * 0.33), 1),
  ];
  const rotatedPattern = basePattern.map((_, index) => basePattern[(index + movieIndex) % basePattern.length]);
  const remainingCinemaCount = Math.max(cinemaCount - rotatedPattern.length, 0);

  if (remainingCinemaCount === 0) {
    return rotatedPattern;
  }

  return [
    ...rotatedPattern,
    ...Array.from({ length: remainingCinemaCount }, (_, index) => Math.max(1, Math.floor(totalLimit / (cinemaCount + index + 1)))),
  ];
};

const resolveDistinctCinemaLimit = (cinemaMap, cinemaNames = [], limit = 0, movieIndex = 0) => {
  const cinemaCount = cinemaNames.length;
  const totalAvailable = Array.from(cinemaMap.values()).reduce((sum, items) => sum + items.length, 0);
  const cappedLimit = Math.min(totalAvailable, limit);

  if (cinemaCount < 3) {
    return cappedLimit;
  }

  for (let candidateLimit = cappedLimit; candidateLimit >= cinemaCount; candidateLimit -= 1) {
    const quotas = getCinemaQuotaPattern(candidateLimit, cinemaCount, movieIndex);
    const counts = cinemaNames.map((cinemaName, index) => {
      const items = cinemaMap.get(cinemaName) || [];
      return Math.min(items.length, quotas[index] || 0);
    });

    if (counts.every((count) => count > 0) && new Set(counts).size === counts.length) {
      return candidateLimit;
    }
  }

  return Math.min(cappedLimit, cinemaCount + 2);
};

const pickBalancedShowtimes = (showtimes = [], limit = showtimes.length, movieIndex = 0) => {
  const cinemaMap = showtimes.reduce((map, showtime) => {
    const cinemaName = showtime.cinemaName || "CineSky";
    map.set(cinemaName, [...(map.get(cinemaName) || []), showtime]);
    return map;
  }, new Map());
  const cinemaNames = Array.from(cinemaMap.keys()).sort((first, second) => first.localeCompare(second, "vi"));
  const effectiveLimit = resolveDistinctCinemaLimit(cinemaMap, cinemaNames, limit, movieIndex);
  const quotaPattern = getCinemaQuotaPattern(effectiveLimit, cinemaNames.length, movieIndex);
  const selectedMap = new Map();

  cinemaNames.forEach((cinemaName, cinemaIndex) => {
    const cinemaShowtimes = cinemaMap.get(cinemaName) || [];
    const cinemaQuota = quotaPattern[cinemaIndex] || 1;

    cinemaShowtimes
      .map((showtime, index) => ({ showtime, score: getShowtimePriority(showtime, index) }))
      .sort((first, second) => first.score - second.score)
      .slice(0, cinemaQuota)
      .forEach(({ showtime }) => selectedMap.set(String(showtime.id), showtime));
  });

  if (selectedMap.size < effectiveLimit) {
    showtimes
      .filter((showtime) => !selectedMap.has(String(showtime.id)))
      .map((showtime, index) => ({ showtime, score: getShowtimePriority(showtime, index) }))
      .sort((first, second) => first.score - second.score)
      .slice(0, effectiveLimit - selectedMap.size)
      .forEach(({ showtime }) => selectedMap.set(String(showtime.id), showtime));
  }

  return Array.from(selectedMap.values())
    .slice(0, effectiveLimit)
    .sort((first, second) =>
      first.cinemaName.localeCompare(second.cinemaName, "vi") ||
      first.displayTime.localeCompare(second.displayTime)
    );
};

const groupByCinema = (showtimes = []) => {
  const map = new Map();

  showtimes.forEach((showtime) => {
    const key = showtime.cinemaName || "CineSky";

    if (!map.has(key)) {
      map.set(key, {
        cinemaName: key,
        cinemaAddress: showtime.cinemaAddress || "",
        showtimes: [],
      });
    }

    map.get(key).showtimes.push(showtime);
  });

  return Array.from(map.values()).map((cinema) => ({
    ...cinema,
    showtimes: cinema.showtimes.sort((a, b) => a.displayTime.localeCompare(b.displayTime)),
  }));
};

const ShowtimeSkeleton = () => (
  <div className="showtimes-skeleton" aria-hidden="true">
    <span></span>
    <strong></strong>
    <small></small>
  </div>
);

const FilterSelect = ({ id, label, value, options, isOpen, onToggle, onSelect }) => {
  const selectedOption = options.find((option) => option.value === value) || options[0];

  return (
    <div className={"showtimes-filter-select" + (isOpen ? " is-open" : "")}>
      <span className="showtimes-filter-select__label">{label}</span>
      <button
        type="button"
        className="showtimes-filter-select__button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{selectedOption?.label || ""}</span>
      </button>

      {isOpen ? (
        <div className="showtimes-filter-select__menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? "is-selected" : ""}
              onClick={() => onSelect(id, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default function ShowtimesPage({ searchQuery = "" }) {
  const navigate = useNavigate();
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.iso || "");
  const [selectedCinema, setSelectedCinema] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState("all");
  const [openFilter, setOpenFilter] = useState("");
  const [availableOnly, setAvailableOnly] = useState(true);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(() => getCurrentVietnamDateTime());
  const hasLoadedShowtimesRef = useRef(false);
  const filtersRef = useRef(null);
  const isPeakDate = isPeakScreeningDate(selectedDate);
  const priceMeta = getScreeningPriceMeta(selectedDate);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(getCurrentVietnamDateTime());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenFilter("");
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenFilter("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadShowtimes = async () => {
      try {
        if (!hasLoadedShowtimesRef.current) {
          setIsLoading(true);
        }
        setErrorMessage("");

        const movies = await getMovies({ status: "now-showing" });
        const visibleMovies = sortMoviesByHomePriority(Array.isArray(movies) ? movies : []);
        const payloads = await Promise.allSettled(
          visibleMovies.map((movie) => getMovieShowtimes(movie.id))
        );

        if (!mounted) {
          return;
        }

        const nextItems = payloads
          .map((result, index) => {
            if (result.status !== "fulfilled") {
              return null;
            }

            const showtimeLimit = getShowtimeDisplayLimit(visibleMovies[index], index, isPeakDate);
            const normalizedShowtimes = applyShowtimePricing(
              applyCinemaTimeOffsets(Array.isArray(result.value?.showtimes) ? result.value.showtimes : []),
              selectedDate
            );

            return {
              movie: visibleMovies[index],
              showtimes: pickBalancedShowtimes(normalizedShowtimes, showtimeLimit, index),
            };
          })
          .filter((item) => item && item.showtimes.length > 0);

        setItems(nextItems);
      } catch (error) {
        if (mounted) {
          setErrorMessage(error.message || "Không thể tải lịch chiếu hôm nay.");
          setItems([]);
        }
      } finally {
        if (mounted) {
          hasLoadedShowtimesRef.current = true;
          setIsLoading(false);
        }
      }
    };

    loadShowtimes();

    return () => {
      mounted = false;
    };
  }, [isPeakDate, selectedDate]);

  const cinemaOptions = useMemo(() => {
    const set = new Set();
    items.forEach((item) => item.showtimes.forEach((showtime) => set.add(showtime.cinemaName)));
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, "vi"));
  }, [items]);

  const genreOptions = useMemo(() => {
    const set = new Set();
    items.forEach(({ movie }) => {
      (movie.genres || []).forEach((genre) => set.add(genre));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [items]);

  const normalizedQuery = normalizeText(searchQuery.trim());
  const activeSlot = timeSlots.find((slot) => slot.id === selectedSlot) || timeSlots[0];
  const cinemaFilterOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả rạp" },
      ...cinemaOptions.map((cinema) => ({ value: cinema, label: cinema })),
    ],
    [cinemaOptions]
  );
  const genreFilterOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả thể loại" },
      ...genreOptions.map((genre) => ({ value: genre, label: genre })),
    ],
    [genreOptions]
  );
  const slotFilterOptions = useMemo(
    () => timeSlots.map((slot) => ({ value: slot.id, label: slot.label })),
    []
  );

  const filteredItems = useMemo(() => {
    return items
      .map(({ movie, showtimes }) => {
        const matchesQuery =
          !normalizedQuery ||
          normalizeText([movie.title, movie.genre, movie.country, movie.director].filter(Boolean).join(" ")).includes(normalizedQuery);
        const matchesGenre = selectedGenre === "all" || (movie.genres || []).includes(selectedGenre);

        if (!matchesQuery || !matchesGenre) {
          return null;
        }

        const filteredShowtimes = showtimes.filter((showtime) => {
          const hour = getHour(showtime.displayTime);
          const matchesCinema = selectedCinema === "all" || showtime.cinemaName === selectedCinema;
          const matchesSlot = selectedSlot === "all" || (hour >= activeSlot.from && hour < activeSlot.to);
          const hasSeats = Number(showtime.availableSeatCount ?? 0) > 0;
          const isUpcoming = isUpcomingShowtime(selectedDate, showtime.displayTime, currentDateTime);

          return matchesCinema && matchesSlot && isUpcoming && (!availableOnly || hasSeats);
        });

        if (filteredShowtimes.length === 0) {
          return null;
        }

        return {
          movie,
          cinemaGroups: groupByCinema(filteredShowtimes),
          showtimeCount: filteredShowtimes.length,
          priorityScore: getMoviePriorityScore(movie),
          heatScore: getMovieHeatScore(movie),
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        b.heatScore - a.heatScore ||
        a.priorityScore - b.priorityScore ||
        b.showtimeCount - a.showtimeCount ||
        String(a.movie.title || "").localeCompare(String(b.movie.title || ""), "vi")
      );
  }, [activeSlot.from, activeSlot.to, availableOnly, currentDateTime, items, normalizedQuery, selectedCinema, selectedDate, selectedGenre, selectedSlot]);

  const totalShowtimes = filteredItems.reduce((sum, item) => sum + item.showtimeCount, 0);
  const hotMovie = filteredItems[0]?.movie;
  const nearestShowtime = filteredItems
    .flatMap((item) =>
      item.cinemaGroups.flatMap((cinema) =>
        cinema.showtimes.map((showtime) => ({ movie: item.movie, showtime }))
      )
    )
    .filter((item) => isUpcomingShowtime(selectedDate, item.showtime.displayTime, currentDateTime))
    .sort((a, b) => a.showtime.displayTime.localeCompare(b.showtime.displayTime))[0];

  const handleBook = (movieId, showtime) => {
    const params = new URLSearchParams({
      movieId,
      showtimeId: String(showtime.id),
      date: selectedDate,
    });

    navigate(`/booking?${params.toString()}`);
  };

  const handleFilterSelect = (id, value) => {
    if (id === "cinema") {
      setSelectedCinema(value);
    } else if (id === "genre") {
      setSelectedGenre(value);
    } else if (id === "slot") {
      setSelectedSlot(value);
    }

    setOpenFilter("");
  };

  return (
    <main className="showtimes-page">
      <section className="showtimes-hero">
        <div className="showtimes-hero__copy">
          <span className="showtimes-kicker">Lịch chiếu CineSky</span>
          <h1>Suất chiếu hôm nay</h1>
          <p>Chọn nhanh ngày, rạp và khung giờ phù hợp rồi đi thẳng đến bước đặt ghế.</p>
        </div>

        <div className="showtimes-hero__stats" aria-label="Tổng quan lịch chiếu">
          <div>
            <strong>{isLoading ? "--" : totalShowtimes}</strong>
            <span>{priceMeta.label || "suất phù hợp"}</span>
          </div>
          <div>
            <strong>{isLoading ? "--" : filteredItems.length}</strong>
            <span>phim có lịch</span>
          </div>
          <div>
            <strong>{cinemaOptions.length || "--"}</strong>
            <span>cụm rạp</span>
          </div>
        </div>
      </section>

      <section className="showtimes-toolbar" aria-label="Bộ lọc lịch chiếu">
        <div className="showtimes-date-tabs">
          {dateOptions.map((option) => (
            <button
              key={option.iso}
              type="button"
              className={selectedDate === option.iso ? "is-active" : ""}
              onClick={() => setSelectedDate(option.iso)}
            >
              <span>{option.title}</span>
              <strong>{option.day} {option.label}</strong>
            </button>
          ))}
        </div>

        <div className="showtimes-filters" ref={filtersRef}>
          <FilterSelect
            id="cinema"
            label="Rạp"
            value={selectedCinema}
            options={cinemaFilterOptions}
            isOpen={openFilter === "cinema"}
            onToggle={() => setOpenFilter((current) => current === "cinema" ? "" : "cinema")}
            onSelect={handleFilterSelect}
          />

          <FilterSelect
            id="genre"
            label="Thể loại"
            value={selectedGenre}
            options={genreFilterOptions}
            isOpen={openFilter === "genre"}
            onToggle={() => setOpenFilter((current) => current === "genre" ? "" : "genre")}
            onSelect={handleFilterSelect}
          />

          <FilterSelect
            id="slot"
            label="Khung giờ"
            value={selectedSlot}
            options={slotFilterOptions}
            isOpen={openFilter === "slot"}
            onToggle={() => setOpenFilter((current) => current === "slot" ? "" : "slot")}
            onSelect={handleFilterSelect}
          />

          <label className="showtimes-toggle">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            <span>Chỉ hiện suất còn ghế</span>
          </label>
        </div>
      </section>

      {!isLoading && !errorMessage ? (
        <section className="showtimes-smart-row" aria-label="Gợi ý nhanh">
          <div>
            <span>Suất gần nhất</span>
            <strong>{nearestShowtime ? `${nearestShowtime.showtime.displayTime} • ${nearestShowtime.movie.title}` : "Đang cập nhật"}</strong>
          </div>
          <div>
            <span>Phim nhiều suất</span>
            <strong>{hotMovie?.title || "Đang cập nhật"}</strong>
          </div>
          <div>
            <span>Gợi ý sau 19:00</span>
            <strong>{selectedSlot === "evening" ? "Đang lọc buổi tối" : "Chọn Buổi tối để xem nhanh"}</strong>
          </div>
        </section>
      ) : null}

      <section className="showtimes-list">
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => <ShowtimeSkeleton key={index} />)
        ) : errorMessage ? (
          <div className="showtimes-empty">
            <strong>Không thể tải lịch chiếu.</strong>
            <p>{errorMessage}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="showtimes-empty">
            <strong>Không có suất chiếu phù hợp.</strong>
            <p>Thử đổi rạp, khung giờ hoặc tắt bộ lọc còn ghế để mở rộng kết quả.</p>
            <button type="button" onClick={() => {
              setSelectedCinema("all");
              setSelectedGenre("all");
              setSelectedSlot("all");
              setAvailableOnly(false);
            }}>
              Xem tất cả lịch chiếu
            </button>
          </div>
        ) : (
          filteredItems.map(({ movie, cinemaGroups, showtimeCount }) => (
            <article className="showtime-movie" key={movie.id}>
              <div
                className="showtime-movie__backdrop"
                style={{ backgroundImage: `url("${movie.poster}")` }}
                aria-hidden="true"
              />

              <div className="showtime-movie__content">
                <div className="showtime-movie__header">
                  <Link to={`/movie/${movie.id}`} className="showtime-movie__poster-card">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="showtime-movie__poster-info">
                      <span>{movie.rating || "P"} • {movie.duration || "--"} phút</span>
                      <h2>{movie.title}</h2>
                      <p>{[movie.genre, movie.country].filter(Boolean).join(" • ")}</p>
                      <div className="showtime-movie__actions">
                        <strong>{showtimeCount} suất</strong>
                        <em>Chi tiết phim</em>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="showtime-cinema-list">
                  {cinemaGroups.map((cinema) => (
                    <div className="showtime-cinema" key={cinema.cinemaName}>
                      <div className="showtime-cinema__meta">
                        <strong>{cinema.cinemaName}</strong>
                        <span>{cinema.cinemaAddress}</span>
                      </div>

                      <div className="showtime-buttons">
                        {cinema.showtimes.map((showtime) => {
                          const seatStatus = getSeatStatus(showtime);
                          const isSoldOut = seatStatus.tone === "soldout";

                          return (
                            <button
                              key={showtime.id}
                              type="button"
                              className={`showtime-button showtime-button--${seatStatus.tone}`}
                              onClick={() => handleBook(movie.id, showtime)}
                              disabled={isSoldOut}
                              title={isSoldOut ? "Suất chiếu đã hết vé" : "Đặt vé suất này"}
                            >
                              <strong>{showtime.displayTime}</strong>
                              <span>{showtime.roomName}</span>
                              <small>{seatStatus.label}</small>
                              <em>
                                {formatCurrency(showtime.price)}
                                {showtime.priceLabel ? ` • ${showtime.priceLabel}` : ""}
                              </em>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

