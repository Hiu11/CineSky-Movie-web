import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { normalizeAuthUser } from "../../services/authService";
import {
  createFeedbackEntry,
  getAdminFeedbackEntries,
  getFeedbackEntriesPage,
  updateAdminFeedbackEntry,
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
  const location = useLocation();
  const sessionUser = useMemo(() => getSessionUser(), []);
  const feedbackSource = useMemo(
    () => new URLSearchParams(location.search).get("source") || "feedback-page",
    [location.search]
  );
  const [form, setForm] = useState(() => buildInitialFormState(sessionUser));
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  const [entriesErrorMessage, setEntriesErrorMessage] = useState("");
  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesTotalPages, setEntriesTotalPages] = useState(1);
  const [isLoadingMoreEntries, setIsLoadingMoreEntries] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  const isAdmin = sessionUser?.role === "admin";
  const activeRating = hoveredRating || selectedRating;
  const messageLength = form.message.trim().length;
  const selectedReply = feedbackEntries.find((entry) => entry.id === selectedReplyId) || feedbackEntries[0] || null;

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

        const payload = isAdmin
          ? { data: await getAdminFeedbackEntries({ limit: 50 }), pagination: { page: 1, totalPages: 1 } }
          : await getFeedbackEntriesPage({ limit: 6, page: 1 });
        const entries = payload.data;

        if (isMounted) {
          const nextEntries = Array.isArray(entries) ? entries : [];
          setFeedbackEntries(nextEntries);
          setEntriesPage(payload.pagination?.page || 1);
          setEntriesTotalPages(payload.pagination?.totalPages || 1);
          if (isAdmin && nextEntries.length > 0) {
            setSelectedReplyId(nextEntries[0].id);
            setReplyMessage(nextEntries[0].response || "");
          }
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
  }, [isAdmin]);

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
        source: feedbackSource,
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

  const handleLoadMoreEntries = async () => {
    const nextPage = entriesPage + 1;

    try {
      setIsLoadingMoreEntries(true);
      const payload = await getFeedbackEntriesPage({ limit: 6, page: nextPage });
      setFeedbackEntries((currentEntries) => [
        ...currentEntries,
        ...(Array.isArray(payload.data) ? payload.data : []),
      ]);
      setEntriesPage(payload.pagination?.page || nextPage);
      setEntriesTotalPages(payload.pagination?.totalPages || entriesTotalPages);
    } catch (error) {
      const message = error.message || "Không thể tải thêm phản hồi.";
      setEntriesErrorMessage(message);
      showToast?.({ type: "error", title: "Tải phản hồi thất bại", message });
    } finally {
      setIsLoadingMoreEntries(false);
    }
  };

  const handleSelectReply = (entry) => {
    setSelectedReplyId(entry.id);
    setReplyMessage(entry.response || "");
    setStatus({ type: "", message: "" });
  };

  const handleSubmitAdminReply = async (event) => {
    event.preventDefault();

    if (!selectedReply?.id) {
      return;
    }

    const nextReply = replyMessage.trim();
    if (nextReply.length < 8) {
      const message = "Phản hồi cho khách cần ít nhất 8 ký tự.";
      setStatus({ type: "error", message });
      showToast?.({ type: "error", title: "Phản hồi quá ngắn", message });
      return;
    }

    try {
      setIsReplySubmitting(true);
      const updatedEntry = await updateAdminFeedbackEntry(selectedReply.id, {
        response: nextReply,
        status: "responded",
      });

      setFeedbackEntries((currentEntries) =>
        currentEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      );
      setStatus({ type: "success", message: "Đã gửi phản hồi cho khách." });
      showToast?.({
        type: "success",
        title: "Đã phản hồi",
        message: updatedEntry.fullName || "Phản hồi đã được lưu.",
      });
    } catch (error) {
      const message = error.message || "Không thể gửi phản hồi lúc này.";
      setStatus({ type: "error", message });
      showToast?.({ type: "error", title: "Gửi phản hồi thất bại", message });
    } finally {
      setIsReplySubmitting(false);
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
        <section className={"feedback-card" + (isAdmin ? " feedback-card--admin" : "")}>
          <div className="feedback-shimmer" aria-hidden="true" />
          <div className="feedback-hero">
            <div className="feedback-header">
              <h2>{isAdmin ? "Phản hồi góp ý" : "Góp ý với CineSky"}</h2>
            </div>
            <div className="feedback-speech">
              {isAdmin ? "Chọn góp ý bên phải rồi trả lời khách." : "Bạn thấy lỗi thì la lên, đừng để nó sống thọ."}
            </div>
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

          {isAdmin ? (
            <form className="feedback-form feedback-admin-reply" onSubmit={handleSubmitAdminReply}>
              <div className="feedback-admin-reply__target">
                <span>Đang trả lời</span>
                <strong>{selectedReply?.fullName || "Chưa có góp ý"}</strong>
                <p>{selectedReply?.headline || "Chọn một góp ý ở cột bên phải để phản hồi."}</p>
              </div>

              <div className="feedback-field">
                <label className="feedback-label" htmlFor="adminReply">
                  Nội dung phản hồi
                </label>
                <textarea
                  id="adminReply"
                  className="feedback-textarea"
                  placeholder="Nhập phản hồi chính thức cho khách..."
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  disabled={!selectedReply}
                />
                <strong className="feedback-char-count">{replyMessage.trim().length} ký tự</strong>
              </div>

              <button
                type="submit"
                className="feedback-submit"
                disabled={!selectedReply || isReplySubmitting}
              >
                {isReplySubmitting ? "Đang gửi phản hồi..." : selectedReply?.response ? "Cập nhật phản hồi" : "Gửi phản hồi"}
              </button>
            </form>
          ) : (
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
          )}
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
              <>
              {feedbackEntries.map((review) => (
                <article
                  key={review.id}
                  className={
                    "feedback-review-card" +
                    (isAdmin && selectedReply?.id === review.id ? " is-selected" : "")
                  }
                >
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
                  {isAdmin ? (
                    <button
                      type="button"
                      className="feedback-review-card__reply-button"
                      onClick={() => handleSelectReply(review)}
                    >
                      {review.response ? "Xem phản hồi" : "Trả lời"}
                    </button>
                  ) : null}
                </article>
              ))}
              {!isAdmin && entriesPage < entriesTotalPages ? (
                <button
                  type="button"
                  className="feedback-load-more"
                  onClick={handleLoadMoreEntries}
                  disabled={isLoadingMoreEntries}
                >
                  {isLoadingMoreEntries ? "Đang tải thêm..." : "Xem thêm phản hồi"}
                </button>
              ) : null}
              </>
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
