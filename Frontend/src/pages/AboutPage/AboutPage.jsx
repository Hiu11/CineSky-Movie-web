import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <main className="about-page">
      <h1 className="about-page__title">VỀ CHÚNG TÔI</h1>
      <p className="about-page__text">
        Chào mừng bạn đến với hệ thống rạp chiếu phim hiện đại. Chúng tôi cam kết mang lại trải nghiệm điện ảnh chân thực
        với âm thanh sống động và không gian xem phim chất lượng.
      </p>
      <h3 className="about-page__subtitle">Tầm nhìn</h3>
      <p className="about-page__text">Trở thành cụm rạp được yêu thích nhất của giới trẻ.</p>
    </main>
  );
};

export default AboutPage;
