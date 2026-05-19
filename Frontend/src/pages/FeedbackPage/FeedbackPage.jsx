import React, { useEffect, useMemo, useState } from "react";
import { normalizeAuthUser } from "../../services/authService";
import {
  createFeedbackEntry,
  getFeedbackEntries,
} from "../../services/feedbackService";
import "./FeedbackPage.css";

const feedbackFilmPosters = [
  "/assets/images/khe-uoc-ban-dau.jpg",
  "/assets/images/heo-nam-mong.jpg",
  "/assets/images/cai-ma-2025.jpg",
  "/assets/images/Beauty.jpg",
  "/assets/images/bay-tien.jpg",
  "/assets/images/phim-super-mario-thien-ha.jpg",
  "/assets/images/quy-nhap-trang-main.webp",
  "/assets/images/running-man.jpg",
];

const getSessionUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = sessionStorage.getItem("user");
    return rawUser ? normalizeAuthUser(JSON.parse(rawUser)) : null;
  } catch {
    return null;
  }
};

const buildInitialFormState = (sessionUser) => ({
  fullName: sessionUser?.fullName || sessionUser?.name || "",
  email: sessionUser?.email || "",
  message: "",
});

const formatCreatedAt = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const FeedbackPage = ({ showToast }) => {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [form, setForm] = useState(() => buildInitialFormState(sessionUser));
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  const [entriesErrorMessage, setEntriesErrorMessage] = useState("");

  const activeRating = hoveredRating || selectedRating;
  const messageLength = form.message.trim().length;

  useEffect(() => {
    if (document.querySelector("script[data-lottie-player]")) {
      return undefined;
    }

    const script = document.createElement("script");

    script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    script.async = true;
    script.dataset.lottiePlayer = "true";
    document.body.appendChild(script);

    return undefined;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFeedbackEntries = async () => {
      try {
        setIsEntriesLoading(true);
        setEntriesErrorMessage("");

        const entries = await getFeedbackEntries({ limit: 6 });

        if (isMounted) {
          setFeedbackEntries(Array.isArray(entries) ? entries : []);
        }
      } catch (error) {
        if (isMounted) {
          setFeedbackEntries([]);
          setEntriesErrorMessage(
            error.message || "Không thể tải phản hồi gần đây từ server."
          );
        }
      } finally {
        if (isMounted) {
          setIsEntriesLoading(false);
        }
      }
    };

    loadFeedbackEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = (field) => (event) => {
    if (status.message) {
      setStatus({ type: "", message: "" });
    }

    setForm((previousState) => ({
      ...previousState,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
      const message = "Vui lòng điền đầy đủ họ tên, email và nội dung góp ý.";
      setStatus({ type: "error", message });
      showToast?.({
        type: "error",
        title: "Thiếu thông tin",
        message,
      });
      return;
    }

    if (selectedRating === 0) {
      const message =
        "Hãy chọn số sao đánh giá để CineSky hiểu rõ mức độ hài lòng của bạn.";
      setStatus({ type: "error", message });
      showToast?.({
        type: "error",
        title: "Chưa chọn sao",
        message,
      });
      return;
    }

    if (messageLength < 12) {
      const message =
        "Nội dung góp ý nên dài ít nhất 12 ký tự để nhóm dễ tiếp nhận hơn.";
      setStatus({ type: "error", message });
      showToast?.({
        type: "error",
        title: "Nội dung quá ngắn",
        message,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const createdEntry = await createFeedbackEntry({
        fullName: form.fullName,
        email: form.email,
        rating: selectedRating,
        message: form.message,
      });

      setFeedbackEntries((currentEntries) =>
        [createdEntry, ...currentEntries].slice(0, 6)
      );

      const successMessage = `Cảm ơn ${form.fullName.trim()}! Đánh giá ${selectedRating}/5 sao của bạn đã được ghi nhận.`;

      setStatus({
        type: "success",
        message: successMessage,
      });
      showToast?.({
        type: "success",
        title: "Gửi góp ý thành công",
        message: successMessage,
      });
      setForm(buildInitialFormState(sessionUser));
      setSelectedRating(0);
      setHoveredRating(0);
    } catch (error) {
      const message =
        error.message || "Không thể gửi góp ý lúc này. Vui lòng thử lại sau.";

      setStatus({ type: "error", message });
      showToast?.({
        type: "error",
        title: "Gửi góp ý thất bại",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="feedback-page">
      <div className="cinematic-film-bg" aria-hidden="true">
        <div className="cinematic-film-bg__strip">
          <div className="cinematic-film-bg__track">
            {[...feedbackFilmPosters, ...feedbackFilmPosters, ...feedbackFilmPosters, ...feedbackFilmPosters].map((poster, index) => (
              <span className="cinematic-film-bg__frame" key={`${poster}-${index}`}>
                <img src={poster} alt="" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="feedback-shell">
        <section className="feedback-card">
          <div className="feedback-hero">
            <div className="feedback-header">
              <h2>Góp ý với CineSky</h2>
            </div>
            <div className="feedback-speech">Bạn thấy lỗi thì la lên, đừng để nó sống thọ.</div>
            <div className="feedback-mascot" aria-hidden="true">
              <lottie-player
                src="/assets/lottie/kicking-cats.json"
                background="transparent"
                speed="1"
                loop
                autoplay
              ></lottie-player>
            </div>
          </div>

          {status.message ? (
            <div className={`feedback-status feedback-status--${status.type}`}>
              {status.message}
            </div>
          ) : null}

          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="feedback-form__grid">
              <div className="feedback-field">
                <label className="feedback-label" htmlFor="fullName">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="feedback-input"
                  placeholder="Nhập tên của bạn"
                  value={form.fullName}
                  onChange={handleFieldChange("fullName")}
                />
              </div>

              <div className="feedback-field">
                <label className="feedback-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="feedback-input"
                  placeholder="Nhập email để nhận phản hồi nếu cần"
                  value={form.email}
                  onChange={handleFieldChange("email")}
                />
              </div>
            </div>

            <div className="feedback-field">
              <span className="feedback-label">Đánh giá nhanh</span>
              <div className="feedback-rating">
                <div
                  className="feedback-rating__buttons"
                  role="radiogroup"
                  aria-label="Chọn số sao đánh giá"
                >
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const isActive = rating <= activeRating;

                    return (
                      <button
                        key={rating}
                        type="button"
                        className={"feedback-star" + (isActive ? " is-active" : "")}
                        onClick={() => {
                          setSelectedRating(rating);
                          if (status.message) {
                            setStatus({ type: "", message: "" });
                          }
                        }}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(0)}
                        aria-label={`${rating} sao`}
                        aria-checked={selectedRating === rating}
                        role="radio"
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            <div className="feedback-field">
              <label className="feedback-label" htmlFor="message">
                Nội dung góp ý
              </label>
              <textarea
                id="message"
                className="feedback-textarea"
                placeholder="Bạn muốn CineSky cải thiện điều gì? Hãy mô tả càng cụ thể càng tốt."
                value={form.message}
                onChange={handleFieldChange("message")}
              />
              <strong className="feedback-char-count">{messageLength} ký tự</strong>
            </div>

            <button type="submit" className="feedback-submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi góp ý..." : "Gửi góp ý"}
            </button>
          </form>
        </section>

        <aside className="feedback-rail">
          <div className="feedback-rail__header">
            <span className="feedback-pill">Phản hồi gần đây</span>
            <h3>Một vài cảm nhận từ người xem</h3>
          </div>

          <div className="feedback-rail__scroll">
            {isEntriesLoading ? (
              <div className="feedback-rail__state">
                <p>Đang tải phản hồi gần đây...</p>
              </div>
            ) : entriesErrorMessage ? (
              <div className="feedback-rail__state">
                <p>{entriesErrorMessage}</p>
              </div>
            ) : feedbackEntries.length > 0 ? (
              feedbackEntries.map((review) => (
                <article key={review.id} className="feedback-review-card">
                  <div className="feedback-review-card__head">
                    <strong>{review.fullName}</strong>
                    <span>{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="feedback-review-card__meta">
                    {formatCreatedAt(review.createdAt) || "Mới ghi nhận"}
                  </p>
                  <h4>{review.headline}</h4>
                  <p className="feedback-review-card__message">{review.message}</p>
                  {review.response ? (
                    <div className="feedback-review-card__reply">
                      <strong>CineSky phản hồi</strong>
                      <p>{review.response}</p>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="feedback-rail__state">
                <p>Chưa có phản hồi nào được gửi. Bạn có thể là người đầu tiên.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default FeedbackPage;
