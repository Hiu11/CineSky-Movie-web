export default function BookingProgress({ steps }) {
  return (
    <section className="booking-page__progress" aria-label="Tiến trình đặt vé">
      {steps.map((step, index) => (
        <article key={step.id} className={`booking-page__progress-card booking-page__progress-card--${step.status}`}>
          <span className="booking-page__progress-index">0{index + 1}</span>
          <div className="booking-page__progress-copy">
            <strong>{step.label}</strong>
            <small>{step.helper}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
