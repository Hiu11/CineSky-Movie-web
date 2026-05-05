import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminPage.css";

const moduleConfig = [
  { key: "movies", label: "Phim", statusLabel: "Trạng thái" },
  { key: "showtimes", label: "Lịch chiếu", statusLabel: "Suất" },
  { key: "cinemas", label: "Rạp / phòng", statusLabel: "Trạng thái" },
  { key: "users", label: "Người dùng", statusLabel: "Vai trò" },
  { key: "orders", label: "Vé / đơn hàng", statusLabel: "Thanh toán" },
  { key: "payments", label: "Thanh toán", statusLabel: "Cổng" },
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
};

const dashboardStats = [
  { label: "Tổng doanh thu", value: "128.6M", helper: "+18% so với tuần trước" },
  { label: "Vé đã bán", value: "1,428", helper: "Tỷ lệ ghế đã bán 72%" },
  { label: "Đơn đặt vé", value: "684", helper: "91% hoàn tất thanh toán" },
  { label: "Người dùng mới", value: "126", helper: "Tăng 24 tài khoản" },
];

const revenueTrend = [34, 48, 42, 66, 73, 58, 86];
const movieRevenue = [
  { label: "Song Hỷ", value: 82 },
  { label: "Mưa Đỏ", value: 68 },
  { label: "Cải Mả", value: 54 },
  { label: "Bảy Tiền", value: 38 },
];
const paymentState = [
  { label: "Đã thanh toán", value: 68 },
  { label: "Chờ xử lý", value: 22 },
  { label: "Đã hủy", value: 10 },
];

const createEmptyForm = () => ({ id: "", name: "", status: "", time: "", value: "" });

export default function AdminPage() {
  const [activeModule, setActiveModule] = useState("movies");
  const [records, setRecords] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [formError, setFormError] = useState("");
  const [dateRange, setDateRange] = useState("month");

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

  const switchModule = (moduleKey) => {
    setActiveModule(moduleKey);
    setSearch("");
    setStatusFilter("all");
    setPage(1);
    setForm(createEmptyForm());
    setEditingId("");
    setSelectedDetail(null);
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.status.trim() || !form.time.trim()) {
      setFormError("Vui lòng nhập đủ tên, trạng thái và thời gian.");
      return;
    }

    const nextRecord = {
      ...form,
      id: editingId || form.id.trim() || `${activeModule.slice(0, 2).toUpperCase()}${Date.now().toString().slice(-4)}`,
      value: form.value.trim() || "Chưa cập nhật",
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

  const handleEdit = (record) => {
    setForm(record);
    setEditingId(record.id);
    setFormError("");
  };

  const handleDelete = (recordId) => {
    setRecords((current) => ({
      ...current,
      [activeModule]: current[activeModule].filter((item) => item.id !== recordId),
    }));
    setSelectedDetail((current) => (current?.id === recordId ? null : current));
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
            <h1>{activeModule === "dashboard" ? "Dashboard tổng quan" : `Quản lý ${activeConfig.label.toLowerCase()}`}</h1>
          </div>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
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
                <h2>Xu hướng doanh thu theo {dateRange}</h2>
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
                <div className="admin-donut" />
                <div className="admin-donut-legend">
                  {paymentState.map((item) => (
                    <span key={item.label}>{item.label}: {item.value}%</span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className="admin-workspace">
            <section className="admin-panel admin-table-panel">
              <div className="admin-toolbar">
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm kiếm theo tên hoặc mã" />
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="all">Tất cả trạng thái</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button onClick={() => setSortDir((current) => (current === "asc" ? "desc" : "asc"))}>
                  Sắp xếp {sortDir === "asc" ? "A-Z" : "Z-A"}
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
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
                        <td><span className="admin-status">{record.status}</span></td>
                        <td>{record.time}</td>
                        <td>{record.value}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button onClick={() => setSelectedDetail(record)}>Xem</button>
                            <button onClick={() => handleEdit(record)}>Sửa</button>
                            <button onClick={() => handleDelete(record.id)}>Xóa</button>
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

            <aside className="admin-side-panels">
              <form className="admin-panel admin-form" onSubmit={handleSubmit}>
                <h2>{editingId ? "Sửa dữ liệu" : "Thêm dữ liệu"}</h2>
                {formError ? <p className="admin-form-error">{formError}</p> : null}
                <input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} placeholder="Mã tự động nếu bỏ trống" />
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Tên" />
                <input value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} placeholder="Trạng thái" />
                <input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="Thời gian" />
                <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="Giá trị / ghi chú" />
                <button type="submit">{editingId ? "Lưu thay đổi" : "Thêm mới"}</button>
              </form>

              <article className="admin-panel admin-detail">
                <h2>Chi tiết</h2>
                {selectedDetail ? (
                  <dl>
                    {Object.entries(selectedDetail).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>Chọn một dòng trong bảng để xem chi tiết.</p>
                )}
              </article>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
