export default function CinemaSelector({ cinemaOptions, selectedCinemaName, onCinemaChange }) {
  return (
    <section className="booking-page__panel">
      <div className="booking-page__panel-header">
        <div>
          <span className="booking-page__eyebrow">BÆ°á»›c 1</span>
          <h2>Chá»n ráº¡p</h2>
        </div>
        <p>Æ¯u tiĂªn cá»¥m ráº¡p thuáº­n tiá»‡n Ä‘á»ƒ tiáº¿p tá»¥c chá»n suáº¥t chiáº¿u nhanh hÆ¡n.</p>
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
          <p className="booking-page__hint">Phim nĂ y hiá»‡n chÆ°a cĂ³ ráº¡p vĂ  lá»‹ch chiáº¿u.</p>
        )}
      </div>
    </section>
  );
}
