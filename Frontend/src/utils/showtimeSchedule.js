const cinemaOffsetRules = [
  { keyword: "nguyen hue", offsetMinutes: 0 },
  { keyword: "hai ba trung", offsetMinutes: 10 },
  { keyword: "dien bien phu", offsetMinutes: 20 },
];

const fixedHolidayDates = new Set([
  "01-01",
  "04-30",
  "05-01",
  "09-02",
  "12-24",
  "12-25",
]);

const seasonalHolidayDates = new Set([
  "2026-02-16",
  "2026-02-17",
  "2026-02-18",
  "2026-02-19",
  "2026-02-20",
  "2026-02-21",
  "2026-02-22",
]);

const WEEKEND_SURCHARGE_RATE = 0.18;
const HOLIDAY_SURCHARGE_RATE = 0.28;

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hashText = (value = "") =>
  normalizeText(value)
    .split("")
    .reduce((hash, char) => hash + char.charCodeAt(0), 0);

const addDaysToIso = (dateIso = "", days = 0) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso))) {
    return dateIso;
  }

  const [year, month, day] = String(dateIso).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
};

const getCinemaOffsetMinutes = (cinemaName = "") => {
  const normalizedCinema = normalizeText(cinemaName);
  const rule = cinemaOffsetRules.find((item) => normalizedCinema.includes(item.keyword));

  if (rule) {
    return rule.offsetMinutes;
  }

  return [5, 10, 15, 20][hashText(cinemaName) % 4];
};

const shiftTimeMeta = (timeLabel = "", offsetMinutes = 0) => {
  if (!/^\d{2}:\d{2}$/.test(String(timeLabel))) {
    return { timeLabel, dayOffset: 0 };
  }

  const [hour, minute] = String(timeLabel).split(":").map(Number);
  const rawMinutes = hour * 60 + minute + offsetMinutes;
  const totalMinutes = (rawMinutes + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinute = totalMinutes % 60;

  return {
    timeLabel: `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`,
    dayOffset: Math.floor(rawMinutes / (24 * 60)),
  };
};

export const applyCinemaTimeOffsets = (showtimes = []) =>
  showtimes.map((showtime) => {
    const offsetMinutes = getCinemaOffsetMinutes(showtime.cinemaName);
    const shifted = shiftTimeMeta(showtime.displayTime, offsetMinutes);

    return {
      ...showtime,
      originalDisplayTime: showtime.originalDisplayTime || showtime.displayTime,
      displayTime: shifted.timeLabel,
      displayDate: shifted.dayOffset ? addDaysToIso(showtime.displayDate, shifted.dayOffset) : showtime.displayDate,
      scheduleOffsetMinutes: offsetMinutes,
    };
  });

export const isPeakScreeningDate = (dateIso = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso))) {
    return false;
  }

  const date = new Date(`${dateIso}T12:00:00+07:00`);
  const day = date.getDay();
  const monthDay = dateIso.slice(5);

  return day === 0 || day === 6 || fixedHolidayDates.has(monthDay) || seasonalHolidayDates.has(dateIso);
};

export const getScreeningPriceMeta = (dateIso = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso))) {
    return { multiplier: 1, label: "" };
  }

  const date = new Date(`${dateIso}T12:00:00+07:00`);
  const isWeekend = [0, 6].includes(date.getDay());
  const isHoliday = fixedHolidayDates.has(dateIso.slice(5)) || seasonalHolidayDates.has(dateIso);

  if (isHoliday) {
    return { multiplier: 1 + HOLIDAY_SURCHARGE_RATE, label: "Gi\u00e1 ng\u00e0y l\u1ec5" };
  }

  if (isWeekend) {
    return { multiplier: 1 + WEEKEND_SURCHARGE_RATE, label: "Gi\u00e1 cu\u1ed1i tu\u1ea7n" };
  }

  return { multiplier: 1, label: "" };
};

export const getScreeningPrice = (basePrice = 0, dateIso = "") => {
  const price = Number(basePrice || 0);
  const { multiplier } = getScreeningPriceMeta(dateIso);

  return Math.round((price * multiplier) / 1000) * 1000;
};

export const applyShowtimePricing = (showtimes = [], dateIso = "") =>
  showtimes.map((showtime) => ({
    ...showtime,
    basePrice: Number(showtime.basePrice ?? showtime.price ?? 0),
    price: getScreeningPrice(showtime.basePrice ?? showtime.price, dateIso),
    priceLabel: getScreeningPriceMeta(dateIso).label,
  }));
