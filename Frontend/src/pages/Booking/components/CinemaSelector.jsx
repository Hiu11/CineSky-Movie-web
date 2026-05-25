export default function CinemaSelector({ cinemaOptions, selectedCinemaName, onCinemaChange }) {
  return (
    <section className="booking-page__panel">
      <div className="booking-page__panel-header">
        <div>
          <span className="booking-page__eyebrow">Bước 1</span>
          <h2>Chọn rạp</h2>
        </div>
        <p>Ưu tiên cụm rạp thuận tiện để tiếp tục chọn suất chiếu nhanh hơn.</p>
      </div>
      <div className="booking-page__row">
        {cinemaOptions.length > 0 ? (
          cinemaOptions.map((cinema) => (
            <button
              key={cinema.cinemaName}
              onClick={() => onCinemaChange(cinema.cinemaName)}
              className={"booking-page__option" + (selectedCinemaName === cinema.cinemaName ? " is-active" : "")}
            >
              <span>{cinema.cinemaName}</span>
              <small>{cinema.cinemaAddress}</small>
            </button>
          ))
        ) : (
          <p className="booking-page__hint">Phim này hiện chưa có rạp và lịch chiếu.</p>
        )}
      </div>
    </section>
  );
}
