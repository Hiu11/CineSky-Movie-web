import { getAdminStatusTone, readOnlyModules } from "../utils/adminPageUtils";

export default function AdminRecordsTable({
  activeConfig,
  activeModule,
  feedbackDateFilter,
  feedbackRatingFilter,
  handleDelete,
  handleEdit,
  handleMarkFeedbackSpam,
  handleRestoreMovie,
  handleToggleUserRole,
  handleUndoActivity,
  isCrudMode,
  openCreateForm,
  page,
  search,
  setFeedbackDateFilter,
  setFeedbackRatingFilter,
  setPage,
  setSearch,
  setSelectedDetail,
  setSortDir,
  setStatusFilter,
  sortDir,
  statusFilter,
  statuses,
  totalPages,
  visibleRecords,
}) {
  if (isCrudMode) {
    return null;
  }

  return (
            <section className="admin-panel admin-table-panel">
              <div className="admin-toolbar">
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm theo tên hoặc ID" />
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
                  <option value="all">Tất cả trạng thái</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {activeModule === "feedback" ? (
                  <>
                    <select value={feedbackRatingFilter} onChange={(event) => { setFeedbackRatingFilter(event.target.value); setPage(1); }}>
                      <option value="all">Tất cả rating</option>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>{rating} sao</option>
                      ))}
                    </select>
                    <select value={feedbackDateFilter} onChange={(event) => { setFeedbackDateFilter(event.target.value); setPage(1); }}>
                      <option value="all">Mọi ngày gửi</option>
                      <option value="today">Hôm nay</option>
                      <option value="week">7 ngày</option>
                      <option value="month">30 ngày</option>
                    </select>
                  </>
                ) : null}
                <button onClick={() => setSortDir((current) => (current === "asc" ? "desc" : "asc"))}>
                  Sắp xếp {sortDir === "asc" ? "A-Z" : "Z-A"}
                </button>
                {!readOnlyModules.has(activeModule) ? (
                  <button type="button" onClick={openCreateForm}>
                    Thêm mới
                  </button>
                ) : null}
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
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
                        <td>
                          <span className={`admin-status admin-status--${record.statusTone || getAdminStatusTone(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.time}</td>
                        <td>{record.value}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button onClick={() => setSelectedDetail(record)}>Xem</button>
                            {activeModule === "trash" ? (
                              <button onClick={() => handleRestoreMovie(record)}>Khôi phục</button>
                            ) : null}
                            {activeModule === "activity" ? (
                              <button disabled={!record.undo} onClick={() => handleUndoActivity(record)}>Hoàn tác</button>
                            ) : null}
                            {activeModule === "users" ? (
                              <button onClick={() => handleToggleUserRole(record)}>
                                {record.role === "admin" ? "Chuyển thành user" : "Cấp admin"}
                              </button>
                            ) : null}
                            {activeModule === "feedback" ? (
                              <>
                                <button onClick={() => handleMarkFeedbackSpam(record)}>Spam</button>
                              </>
                            ) : null}
                            {activeModule !== "trash" && activeModule !== "activity" && activeModule !== "feedback" ? (
                              <>
                                {activeModule !== "users" ? <button onClick={() => handleEdit(record)}>Sửa</button> : null}
                                {activeModule !== "users" ? <button onClick={() => handleDelete(record.id)}>Xóa</button> : null}
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
                <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</button>
                <span>Trang {page}/{totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Sau</button>
              </div>
            </section>
  );
}
