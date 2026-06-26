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
          <span className="booking-page__eyebrow">{"B\u01b0\u1edbc 2"}</span>
          <h2>{"Ch\u1ecdn su\u1ea5t chi\u1ebfu"}</h2>
        </div>
        <p>{"Ch\u1ecdn ng\u00e0y xem v\u00e0 khung gi\u1edd ph\u00f9 h\u1ee3p v\u1edbi l\u1ecbch tr\u00ecnh c\u1ee7a b\u1ea1n trong r\u1ea1p \u0111\u00e3 ch\u1ecdn."}</p>
      </div>
      <div className="booking-page__date-strip" aria-label={"Ch\u1ecdn ng\u00e0y chi\u1ebfu"}>
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
              type="button"
              onClick={() => onShowtimeChange(st.id)}
              className={"booking-page__option booking-page__option--showtime" + (selectedShowtimeId === String(st.id) ? " is-active" : "")}
            >
              <span>{st.displayTime}</span>
              <small>{selectedScreeningDateLabel + " \u2022 " + st.roomName}</small>
            </button>
          ))
        ) : (
          <p className="booking-page__hint">{"Phim n\u00e0y hi\u1ec7n ch\u01b0a c\u00f3 su\u1ea5t chi\u1ebfu kh\u1ea3 d\u1ee5ng."}</p>
        )}
      </div>
    </section>
  );
}
