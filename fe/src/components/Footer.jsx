import React from 'react';

const Footer = () => {
  return (
    <footer className="complex-footer">
      <div className="footer-top-grid">
        <div className="footer-brand">
          <p className="brand-slogan">BE HAPPY. BE A STAR</p>
          <div className="social-icons">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-youtube"></i>
            <i className="fab fa-tiktok"></i>
            <i className="fab fa-instagram"></i>
          </div>
          <p className="lang-text">
            Ngôn ngữ: VN{" "}
            <img src="https://flagcdn.com/w20/vn.png" alt="VN" />
          </p>
        </div>

        <div className="footer-links">
          <h4>TÀI KHOẢN</h4>
          <ul>
            <li>Đăng nhập</li>
            <li>Đăng ký</li>
            <li>Membership</li>
          </ul>

          <h4 style={{ marginTop: "20px" }}>XEM PHIM</h4>
          <ul>
            <li>Phim đang chiếu</li>
            <li>Phim sắp chiếu</li>
            <li>Suất chiếu đặc biệt</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>THUÊ SỰ KIỆN</h4>
          <ul>
            <li>Thuê rạp</li>
            <li>Các loại hình cho thuê khác</li>
          </ul>

          <h4 style={{ marginTop: "20px" }}>CINEMASTAR</h4>
          <ul>
            <li>Giới thiệu</li>
            <li>Liên hệ</li>
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
            <li>Tất cả hệ thống rạp</li>
            <li>Quốc Thanh (TP.HCM)</li>
            <li>Hai Bà Trưng (TP.HCM)</li>
            <li>Sinh Viên (TP.HCM)</li>
            <li>Huế (TP. Huế)</li>
            <li>Đà Lạt (Lâm Đồng)</li>
            <li>Lâm Đồng (Đức Trọng)</li>
            <li>Mỹ Tho (Tiền Giang)</li>
            <li>Kiên Giang (An Giang)</li>
          </ul>
        </div>
      </div>

      <div className="footer-map">
        <p>
          Địa chỉ: Hàn Thuyên, khu phố 6 P, Thủ Đức, Thành phố Hồ Chí Minh
        </p>

        <div className="map-container">
          <iframe
            title="cinema-map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.535332540337!2d106.803048!3d10.879503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8b7bafad5df%3A0x3b6f2c3a0dfacfd9!2zSMOgbiBUaHXDqnksIFRow6AgxJDhu6ljLCBUaOG7pyDEkOG7qWM!5e0!3m2!1svi!2s!4v1710000000000"
            width="100%"
            height="260"
            style={{ border: 0, borderRadius: 12 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
