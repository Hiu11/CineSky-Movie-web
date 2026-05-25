import "./EmptyState.css";

/**
 * EmptyState — Component chung cho các trạng thái không có dữ liệu.
 *
 * @param {string} icon — Emoji hoặc icon hiển thị phía trên tiêu đề (mặc định 🎬)
 * @param {string} title — Tiêu đề chính của thông báo rỗng
 * @param {string} description — Mô tả chi tiết hơn
 * @param {React.ReactNode} action — Nút CTA (ví dụ: <button> hoặc <Link>)
 */
export default function EmptyState({ icon = "🎬", title = "Không có dữ liệu", description = "", action = null, className = "" }) {
  return (
    <div className={`empty-state ${className}`} role="status" aria-label={title}>
      {icon ? <span className="empty-state__icon" aria-hidden="true">{icon}</span> : null}
      <h3 className="empty-state__title">{title}</h3>
      {description ? <p className="empty-state__description">{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
