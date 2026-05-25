export default function ShowtimeSelector({
  availableDateOptions,
  filteredShowtimes,
  selectedScreeningDate,
  selectedShowtimeId,
  selectedScreeningDateLabel,
  onDateChange,
  onShowtimeChange,
}) {
  return (
    <section className="booking-page__panel">
      <div className="booking-page__panel-header">
        <div>
          <span className="booking-page__eyebrow">Bước 2</span>
          <h2>Chọn suất chiếu</h2>
        </div>
        <p>Chọn ngày xem và khung giờ phù hợp với lịch trình của bạn trong rạp đã chọn.</p>
      </div>
      <div className="booking-page__date-strip" aria-label="Chọn ngày chiếu">
        {availableDateOptions.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => onDateChange(d.iso)}
            className={"booking-page__date-option" + (selectedScreeningDate === d.iso ? " is-active" : "")}
          >
            <span>{d.weekdayLabel}</span>
            <strong>{d.dateLabel}</strong>
          </button>
        ))}
      </div>
      <div className="booking-page__row">
        {filteredShowtimes.length > 0 ? (
          filteredShowtimes.map((st) => (
            <button
              key={st.id}
              onClick={() => onShowtimeChange(st.id)}
              className={"booking-page__option booking-page__option--showtime" + (selectedShowtimeId === String(st.id) ? " is-active" : "")}
            >
              <span>{st.displayTime}</span>
              <small>{selectedScreeningDateLabel + " • " + st.roomName}</small>
            </button>
          ))
        ) : (
          <p className="booking-page__hint">Phim này hiện chưa có suất chiếu khả dụng.</p>
        )}
      </div>
    </section>
  );
}
