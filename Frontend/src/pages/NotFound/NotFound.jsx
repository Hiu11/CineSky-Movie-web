import { Link } from "react-router-dom";
import DynamicLottie from "../../components/DynamicLottie/DynamicLottie";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-animation" aria-hidden="true">
        <DynamicLottie
          src="/assets/lottie/error-404.json"
          loop
          autoplay
        />
      </div>
      <section className="not-found-card">
        <span className="not-found-kicker">404</span>
        <h1>This screen slipped out of the projector.</h1>
        <p>
          The page you are looking for does not exist or has been moved. Jump back to the movie
          catalog and keep exploring CineSky.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-primary">
            Back to home
          </Link>
          <Link to="/?tab=now" className="not-found-secondary">
            Now showing
          </Link>
        </div>
      </section>
    </main>
  );
}
