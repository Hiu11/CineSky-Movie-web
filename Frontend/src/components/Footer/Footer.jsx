import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = ({ flushTop = false }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={"complex-footer" + (flushTop ? " complex-footer--flush" : "")}>
      <div className="footer-top-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src="/assets/images/cinesky-wordmark-ai.png" alt="CineSky" className="footer-logo-image" />
          </Link>
          <p className="brand-slogan">BE HAPPY. BE A STAR</p>
          <div className="social-icons">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-youtube"></i>
            <i className="fab fa-tiktok"></i>
            <i className="fab fa-instagram"></i>
          </div>
          <p className="lang-text">
            Ngôn ngữ: VN <img src="https://flagcdn.com/w20/vn.png" alt="VN" />
          </p>
        </div>

        <div className="footer-links">
          <h4>TÀI KHOẢN</h4>
          <ul>
            <li><Link to="/login">Đăng nhập</Link></li>
            <li><Link to="/register">Đăng ký</Link></li>
            <li><Link to="/profile">Membership</Link></li>
          </ul>

          <h4 className="footer-subheading">XEM PHIM</h4>
          <ul>
            <li><Link to="/?tab=now">Phim đang chiếu</Link></li>
            <li><Link to="/?tab=soon">Phim sắp chiếu</Link></li>
            <li>Suất chiếu đặc biệt</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>THUÊ SỰ KIỆN</h4>
          <ul>
            <li>Thuê rạp</li>
            <li>Các loại hình cho thuê khác</li>
          </ul>

          <h4 className="footer-subheading">CINEMASTAR</h4>
          <ul>
            <li><Link to="/about">Giới thiệu</Link></li>
            <li><Link to="/feedback">Liên hệ</Link></li>
            <li>Tuyển dụng</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>DỊCH VỤ KHÁC</h4>
          <ul>
            <li>Nhà hàng</li>
            <li>Kidzone</li>
            <li>Bowling</li>
            <li>Billiards</li>
            <li>Gym</li>
            <li>Nhà hát Opera</li>
            <li>Coffee</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>HỆ THỐNG RẠP</h4>
          <ul>
            <li>CineSky Nguyen Hue (TP.HCM)</li>
            <li>CineSky Hai Ba Trung (TP.HCM)</li>
            <li>CineSky Dien Bien Phu (TP.HCM)</li>
          </ul>
        </div>

        <div className="footer-map">
        <p>Địa chỉ: Hàn Thuyên, khu phố 6, Thủ Đức, Thành phố Hồ Chí Minh</p>

        <div className="map-container">
          <iframe
            className="footer-map-frame"
            title="cinema-map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.535332540337!2d106.803048!3d10.879503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8b7bafad5df%3A0x3b6f2c3a0dfacfd9!2zSMOgbiBUaHXDqnksIFRow6AgxJDhu6ljLCBUaOG7pyDEkOG7qWM!5e0!3m2!1svi!2s!4v1710000000000"
            width="100%"
            height="260"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        </div>
      </div>
      <button type="button" className="footer-scroll-top" onClick={scrollToTop} aria-label="Cuộn lên đầu trang">
        ↑
      </button>
      <div className="footer-copyright">
        © 2026 CineSky. Designed and developed by Đỗ Trọng Hiếu.
      </div>
    </footer>
  );
};

export default Footer;
