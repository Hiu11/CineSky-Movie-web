import { dateRangeLabels, formatCurrency } from "../utils/adminPageUtils";

export default function AdminDashboardView({
  analyticsData,
  compactDashboardStats,
  dateRange,
  supportDashboardStats,
  switchModule,
}) {
  return (
          <div className="admin-dashboard">
            <div className="admin-stat-grid">
              {compactDashboardStats.map((item) => (
                <article key={item.label} className="admin-stat-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.helper}</small>
                </article>
              ))}
            </div>

            <div className="admin-overview-grid">
              <article className="admin-panel admin-overview-card">
                <span>Doanh thu</span>
                <h2>{formatCurrency(analyticsData.totalRevenue)}</h2>
                <p>{analyticsData.scopeLabel}: {analyticsData.paidBookings} đơn hợp lệ, trung bình {formatCurrency(analyticsData.averageOrder)} / đơn.</p>
                <button type="button" onClick={() => switchModule("revenueAnalytics")}>Xem thống kê doanh thu</button>
              </article>
              <article className="admin-panel admin-overview-card">
                <span>Phim nổi bật</span>
                <h2>{analyticsData.topMovie?.label || "Chưa có dữ liệu"}</h2>
                <p>{analyticsData.topMovie ? `${formatCurrency(analyticsData.topMovie.value)} doanh thu trong ${dateRangeLabels[dateRange]}.` : "Dữ liệu sẽ hiện khi có booking."}</p>
                <button type="button" onClick={() => switchModule("movieAnalytics")}>Xem theo phim</button>
              </article>
              <article className="admin-panel admin-overview-card">
                <span>Thể loại mạnh</span>
                <h2>{analyticsData.topGenre?.label || "Chưa phân loại"}</h2>
                <p>{analyticsData.topGenre ? `${formatCurrency(analyticsData.topGenre.value)} doanh thu gộp theo thể loại.` : "Cần mapping phim với thể loại để thống kê chính xác hơn."}</p>
                <button type="button" onClick={() => switchModule("genreAnalytics")}>Xem theo thể loại</button>
              </article>
            </div>

            <section className="admin-panel admin-overview-ops">
              <div>
                <span>Chỉ số phụ</span>
                <h2>Theo dõi nhanh</h2>
              </div>
              <div className="admin-overview-chip-grid">
                {supportDashboardStats.map((item) => (
                  <span key={item.label}>
                    <strong>{item.value}</strong>
                    {item.label}
                  </span>
                ))}
              </div>
            </section>
          </div>
  );
}
