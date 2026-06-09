import { formatDateInput, formatMonthInput, getCurrentYearInput } from "../utils/adminPageUtils";

export default function AdminPageHeader({
  activeTitle,
  analyticsDate,
  analyticsMonth,
  analyticsYear,
  dateRange,
  setAnalyticsDate,
  setAnalyticsMonth,
  setAnalyticsYear,
  setDateRange,
}) {
  return (
        <header className="admin-header">
          <div style={{ display: "none" }}>
            <h1>{activeTitle}</h1>
          </div>
          <div className="admin-date-controls">
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} aria-label="Chọn khoảng thống kê">
              <option value="day">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
            {dateRange === "day" ? (
              <input
                type="date"
                value={analyticsDate}
                onChange={(event) => setAnalyticsDate(event.target.value || formatDateInput())}
                aria-label="Chọn ngày thống kê"
              />
            ) : null}
            {dateRange === "month" ? (
              <input
                type="month"
                value={analyticsMonth}
                onChange={(event) => setAnalyticsMonth(event.target.value || formatMonthInput())}
                aria-label="Chọn tháng thống kê"
              />
            ) : null}
            {dateRange === "year" ? (
              <input
                type="number"
                min="2000"
                max="2100"
                value={analyticsYear}
                onChange={(event) => setAnalyticsYear(event.target.value || getCurrentYearInput())}
                aria-label="Chọn năm thống kê"
              />
            ) : null}
          </div>
        </header>
  );
}
