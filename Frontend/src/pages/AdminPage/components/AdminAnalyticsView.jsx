import { formatCurrency } from "../utils/adminPageUtils";

const renderHorizontalBars = (rows, formatter = formatCurrency, unitLabel = "Đơn vị: VND") => (
  <div className="admin-analytics-bars">
    <span className="admin-chart-unit">{unitLabel}</span>
    {rows.length > 0 ? (
      rows.map((item) => (
        <div key={item.label} className="admin-analytics-bar">
          <div>
            <span>{item.label}</span>
            <strong>{formatter(item.value)}</strong>
          </div>
          <i style={{ width: `${item.percent}%`, "--bar-color": item.color }} />
        </div>
      ))
    ) : (
      <p className="admin-chart-empty">Chưa có dữ liệu trong khoảng thời gian này.</p>
    )}
  </div>
);

const renderColumnChart = (rows, formatter = formatCurrency, unitLabel = "Đơn vị: VND") => {
  if (rows.length === 1) {
    const item = rows[0];

    return (
      <div className="admin-single-metric">
        <span>{unitLabel}</span>
        <strong>{formatter(item.value)}</strong>
        <small>{item.label}</small>
      </div>
    );
  }

  return (
    <div className="admin-column-chart-wrap">
      <div className="admin-chart-unit-row">
        <span className="admin-chart-unit">{unitLabel}</span>
        <span className="admin-chart-unit">Trục ngang: thời gian / nhóm</span>
      </div>
      <div className="admin-column-chart">
        {rows.length > 0 ? (
          rows.map((item) => (
            <div key={item.label} className="admin-column-chart__item">
              <strong style={{ height: `${item.percent}%`, "--bar-color": item.color }} title={formatter(item.value)}>
                <em>{formatter(item.value)}</em>
              </strong>
              <span>{item.label}</span>
            </div>
          ))
        ) : (
          <p className="admin-chart-empty">Chưa có dữ liệu để vẽ biểu đồ.</p>
        )}
      </div>
    </div>
  );
};

const renderDonut = (rows, formatter = formatCurrency, unitLabel = "Đơn vị: VND") => {
  const total = rows.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let offset = 25;

  return (
    <div className="admin-analytics-donut-wrap">
      <span className="admin-chart-unit admin-chart-unit--donut">{unitLabel}</span>
      <svg className="admin-analytics-donut" viewBox="0 0 42 42" role="img" aria-label="Biểu đồ tỷ trọng">
        <circle className="admin-analytics-donut__track" cx="21" cy="21" r="15.915" />
        {rows.map((item) => {
          const dash = total ? (Number(item.value || 0) / total) * 100 : 0;
          const slice = (
            <circle
              key={item.label}
              className="admin-analytics-donut__slice"
              cx="21"
              cy="21"
              r="15.915"
              stroke={item.color}
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={offset}
            />
          );
          offset -= dash;
          return slice;
        })}
        <text x="21" y="20" textAnchor="middle">{total ? "100%" : "0%"}</text>
        <text x="21" y="25" textAnchor="middle">tỷ trọng</text>
      </svg>
      <div className="admin-analytics-legend">
        {rows.length > 0 ? rows.map((item) => (
          <span key={item.label} style={{ "--legend-color": item.color }}>
            {item.label}: {formatter(item.value)}
          </span>
        )) : <span>Chưa có dữ liệu</span>}
      </div>
    </div>
  );
};

export default function AdminAnalyticsView({
  activeModule,
  analyticsData,
  setShowAllMovieAnalytics,
  showAllMovieAnalytics,
  visibleMovieAnalyticsRows,
}) {
  return (
          <div className="admin-analytics">
            <div className="admin-analytics-summary">
              <article className="admin-stat-card">
                <span>Phạm vi</span>
                <strong>{analyticsData.scopeLabel}</strong>
                <small>Dữ liệu lọc theo ngày tạo booking</small>
              </article>
              <article className="admin-stat-card">
                <span>Doanh thu</span>
                <strong>{formatCurrency(analyticsData.totalRevenue)}</strong>
                <small>Không tính vé đã hủy</small>
              </article>
              <article className="admin-stat-card">
                <span>Vé / đơn</span>
                <strong>{analyticsData.totalSeats}/{analyticsData.totalBookings}</strong>
                <small>Ghế đã bán / đơn phát sinh</small>
              </article>
              <article className="admin-stat-card">
                <span>Check-in</span>
                <strong>{analyticsData.checkedIn}</strong>
                <small>{analyticsData.cancelled} đơn đã hủy</small>
              </article>
            </div>

            {activeModule === "revenueAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ cột</span>
                      <h2>Doanh thu theo ngày</h2>
                    </div>
                    <small>Chú thích: mỗi cột là tổng doanh thu booking hợp lệ theo ngày.</small>
                  </div>
                  {renderColumnChart(analyticsData.dailyRows, formatCurrency, "Trục dọc: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Theo phương thức thanh toán</h2>
                    </div>
                    <small>Chú thích: so sánh giá trị thanh toán theo provider / method.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.paymentRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Trạng thái đơn</h2>
                    </div>
                    <small>Chú thích: tỷ trọng đơn đã thanh toán, check-in và hủy.</small>
                  </div>
                  {renderDonut(analyticsData.statusRows, (value) => `${value} đơn`, "Đơn vị: số đơn")}
                </article>
                {analyticsData.monthlyRows.length > 1 ? (
                  <article className="admin-panel admin-panel--wide">
                    <div className="admin-chart-head">
                      <div>
                        <span>Biểu đồ cột</span>
                        <h2>Doanh thu theo tháng</h2>
                      </div>
                      <small>Chú thích: hữu ích khi có nhiều tháng để so sánh.</small>
                    </div>
                    {renderColumnChart(analyticsData.monthlyRows, formatCurrency, "Trục dọc: doanh thu (VND)")}
                  </article>
                ) : null}
              </div>
            ) : null}

            {activeModule === "movieAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh ngang</span>
                      <h2>Top doanh thu theo phim</h2>
                    </div>
                    <small>Chú thích: phim có thanh dài hơn đang đóng góp doanh thu cao hơn.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.movieRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ cột</span>
                      <h2>Doanh thu theo suất trong ngày</h2>
                    </div>
                    <small>Chú thích: nhóm Sáng / Chiều / Tối theo giờ chiếu.</small>
                  </div>
                  {renderColumnChart(analyticsData.hourRows, formatCurrency, "Trục dọc: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Doanh thu theo cụm rạp</h2>
                    </div>
                    <small>Chú thích: dùng để xem rạp nào đang bán tốt.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.cinemaRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel admin-panel--wide admin-movie-analytics-list">
                  <div className="admin-chart-head">
                    <div>
                      <span>Danh sách DB</span>
                      <h2>Tất cả phim trong database</h2>
                    </div>
                    <small>Chú thích: mặc định hiện 8 phim, bấm Xem thêm để bung đầy đủ.</small>
                  </div>
                  <div className="admin-movie-analytics-table">
                    {visibleMovieAnalyticsRows.map((movie) => (
                      <div key={movie.id || movie.label} className="admin-movie-analytics-row">
                        <div>
                          <strong>{movie.label}</strong>
                          <span>{movie.genres}</span>
                        </div>
                        <span>{movie.status}</span>
                        <span>{movie.releaseDate}</span>
                        <strong>{formatCurrency(movie.value)}</strong>
                      </div>
                    ))}
                  </div>
                  {analyticsData.allMovieRows.length > 8 ? (
                    <button
                      type="button"
                      className="admin-show-more-btn"
                      onClick={() => setShowAllMovieAnalytics((current) => !current)}
                    >
                      {showAllMovieAnalytics ? "Thu gọn" : `Xem thêm ${analyticsData.allMovieRows.length - 8} phim`}
                    </button>
                  ) : null}
                </article>
              </div>
            ) : null}

            {activeModule === "genreAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh ngang</span>
                      <h2>Doanh thu theo thể loại</h2>
                    </div>
                    <small>Chú thích: phim nhiều thể loại sẽ được cộng doanh thu vào từng thể loại.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.genreRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Tỷ trọng thể loại</h2>
                    </div>
                    <small>Chú thích: phần màu lớn hơn là nhóm thể loại hút doanh thu hơn.</small>
                  </div>
                  {renderDonut(analyticsData.genreRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
              </div>
            ) : null}

            {activeModule === "cinemaAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Doanh thu theo 3 cụm rạp</h2>
                    </div>
                    <small>Chú thích: chỉ gom về 3 rạp đang có trong DB seed.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.cinemaRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Doanh thu theo phòng chiếu</h2>
                    </div>
                    <small>Chú thích: giúp biết phòng nào đang tạo doanh thu tốt hơn.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.roomRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Tỷ trọng ghế bán theo rạp</h2>
                    </div>
                    <small>Chú thích: tính theo số ghế trong các booking hợp lệ.</small>
                  </div>
                  {renderDonut(analyticsData.seatVolumeRows, (value) => `${value} ghế`, "Đơn vị: số ghế")}
                </article>
              </div>
            ) : null}

            {activeModule === "timeAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ cột</span>
                      <h2>Doanh thu theo khung giờ</h2>
                    </div>
                    <small>Chú thích: Sáng / Chiều / Tối lấy theo giờ chiếu.</small>
                  </div>
                  {renderColumnChart(analyticsData.hourRows, formatCurrency, "Trục dọc: doanh thu (VND)")}
                </article>
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ cột</span>
                      <h2>Doanh thu theo thứ trong tuần</h2>
                    </div>
                    <small>Chú thích: tính theo ngày tạo booking trong phạm vi đang chọn.</small>
                  </div>
                  {renderColumnChart(analyticsData.weekdayRows, formatCurrency, "Trục dọc: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Quy mô đơn vé</h2>
                    </div>
                    <small>Chú thích: mỗi phần là số đơn 1 vé, 2 vé, 3-4 vé hoặc 5+ vé.</small>
                  </div>
                  {renderDonut(analyticsData.ticketSizeRows, (value) => `${value} đơn`, "Đơn vị: số đơn")}
                </article>
              </div>
            ) : null}

            {activeModule === "paymentAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Doanh thu theo kênh thanh toán</h2>
                    </div>
                    <small>Chú thích: so sánh tổng tiền theo provider hoặc method.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.paymentRows, formatCurrency, "Đơn vị: doanh thu (VND)")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Số đơn theo kênh thanh toán</h2>
                    </div>
                    <small>Chú thích: cùng kênh nhưng đo bằng số lượng đơn.</small>
                  </div>
                  {renderDonut(analyticsData.paymentCountRows, (value) => `${value} đơn`, "Đơn vị: số đơn")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Trạng thái đơn</h2>
                    </div>
                    <small>Chú thích: booked / used / cancelled được đổi nhãn tiếng Việt.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.statusRows, (value) => `${value} đơn`, "Đơn vị: số đơn")}
                </article>
              </div>
            ) : null}

            {activeModule === "customerAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Cơ cấu hạng thành viên</h2>
                    </div>
                    <small>Chú thích: mỗi phần là số user theo hạng membership.</small>
                  </div>
                  {renderDonut(analyticsData.tierRows, (value) => `${value} user`, "Đơn vị: số user")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Mức ưu tiên góp ý</h2>
                    </div>
                    <small>Chú thích: giúp admin biết lượng góp ý cần xử lý gấp.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.feedbackRows, (value) => `${value} góp ý`, "Đơn vị: số góp ý")}
                </article>
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Doanh thu theo trạng thái đơn</h2>
                    </div>
                    <small>Chú thích: đối chiếu vận hành khách hàng với tình trạng vé.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.statusRows, (value) => `${value} đơn`, "Đơn vị: số đơn")}
                </article>
              </div>
            ) : null}

            {activeModule === "feedbackAnalytics" ? (
              <div className="admin-analytics-grid">
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Góp ý theo mức ưu tiên</h2>
                    </div>
                    <small>Chú thích: xem khối lượng góp ý cần xử lý nhanh.</small>
                  </div>
                  {renderHorizontalBars(analyticsData.feedbackRows, (value) => `${value} góp ý`, "Đơn vị: số góp ý")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ donut</span>
                      <h2>Góp ý theo trạng thái</h2>
                    </div>
                    <small>Chú thích: new / in_progress / responded / closed.</small>
                  </div>
                  {renderDonut(analyticsData.feedbackStatusRows, (value) => `${value} góp ý`, "Đơn vị: số góp ý")}
                </article>
                <article className="admin-panel admin-panel--wide">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ thanh</span>
                      <h2>Góp ý theo nhóm vấn đề</h2>
                    </div>
                    <small>Chú thích: phân loại theo booking, payment, giao diện, phim/suất chiếu...</small>
                  </div>
                  {renderHorizontalBars(analyticsData.feedbackCategoryRows, (value) => `${value} góp ý`, "Đơn vị: số góp ý")}
                </article>
                <article className="admin-panel">
                  <div className="admin-chart-head">
                    <div>
                      <span>Biểu đồ cột</span>
                      <h2>Rating góp ý</h2>
                    </div>
                    <small>Chú thích: số góp ý theo mức sao.</small>
                  </div>
                  {renderColumnChart(analyticsData.feedbackRatingRows, (value) => `${value} góp ý`, "Trục dọc: số góp ý")}
                </article>
              </div>
            ) : null}
          </div>
  );
}
