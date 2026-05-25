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
          <span className="booking-page__eyebrow">BÆ°á»›c 2</span>
          <h2>Chá»n suáº¥t chiáº¿u</h2>
        </div>
        <p>Chá»n ngĂ y xem vĂ  khung giá» phĂ¹ há»£p vá»›i lá»‹ch trĂ¬nh cá»§a báº¡n trong ráº¡p Ä‘Ă£ chá»n.</p>
      </div>
      <div className="booking-page__date-strip" aria-label="Chá»n ngĂ y chiáº¿u">
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
              <small>{selectedScreeningDateLabel + " â€¢ " + st.roomName}</small>
            </button>
          ))
        ) : (
          <p className="booking-page__hint">Phim nĂ y hiá»‡n chÆ°a cĂ³ suáº¥t chiáº¿u kháº£ dá»¥ng.</p>
        )}
      </div>
    </section>
  );
}
