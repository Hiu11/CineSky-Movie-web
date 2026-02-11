import React from "react";

const FeedbackPage = () => {
  return (
    <main className="feedback-page">
      <div className="feedback-card">
        <div className="feedback-header">
          <span className="feedback-pill">Chúng tôi lắng nghe</span>
          <h2>Góp ý với chúng tôi</h2>
          <p>
            Hãy cho CineSky biết trải nghiệm của bạn để chúng tôi phục vụ tốt
            hơn.
          </p>
        </div>

        <form className="feedback-form">
          <label className="feedback-label" htmlFor="fullName">
            Họ và tên
          </label>
          <input
            id="fullName"
            type="text"
            className="feedback-input"
            placeholder="Nhập tên của bạn"
          />

          <label className="feedback-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="feedback-input"
            placeholder="Nhập email"
          />

          <label className="feedback-label" htmlFor="message">
            Nội dung góp ý
          </label>
          <textarea
            id="message"
            className="feedback-textarea"
            placeholder="Bạn muốn nhắn nhủ gì..."
          />

          <button type="button" className="feedback-submit">
            GỬI GÓP Ý
          </button>
        </form>
      </div>
    </main>
  );
};

export default FeedbackPage;
