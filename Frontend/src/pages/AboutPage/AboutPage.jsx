import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../HomePage/HomePage.css";
import "./AboutPage.css";
import DynamicLottie from "../../components/DynamicLottie/DynamicLottie";

const stats = [
  { value: "3", label: "cụm rạp CineSky tại TP.HCM, thuận tiện cho các lịch hẹn xem phim sau giờ học, sau giờ làm." },
  { value: "6", label: "phòng chiếu với nhiều khung giờ trong ngày, ưu tiên suất tối và cuối tuần cho phim hot." },
  { value: "1.432", label: "ghế ngồi được bố trí theo từng phòng, có khu vực ghế đôi và hàng giữa dễ quan sát." },
  { value: "Online", label: "đặt vé, chọn ghế, xem lịch chiếu và nhận thông báo trước khi ra rạp." },
];

const cinemaHighlights = [
  { label: "Không gian", value: "Rạp phim đô thị" },
  { label: "Trải nghiệm", value: "Đặt vé online" },
  { label: "Dịch vụ", value: "Bắp nước & combo" },
  { label: "Thành viên", value: "Silver / Gold / Diamond" },
];

const filmPosters = [
  "/assets/images/1990.webp",
  "/assets/images/anh-hung-2026.jpg",
  "/assets/images/khe-uoc-ban-dau.jpg",
  "/assets/images/heo-nam-mong.jpg",
  "/assets/images/cai-ma-2025.jpg",
  "/assets/images/Beauty.jpg",
  "/assets/images/bay-tien.jpg",
  "/assets/images/bau-vat-troi-cho.jpg",
  "/assets/images/mot-thoi-ta-da-yeu.jpg",
  "/assets/images/mua-do-2025.jpg",
  "/assets/images/mui-pho.webp",
  "/assets/images/Mắt biếc.jpg",
  "/assets/images/phi-phong-quy-mau-rung-thieng.jpg",
  "/assets/images/phim-super-mario-thien-ha.jpg",
  "/assets/images/quy-nhap-trang-main.webp",
  "/assets/images/running-man.jpg",
  "/assets/images/song-hy-lam-nguy.jpg",
  "/assets/images/supergirl-2026.jpg",
  "/assets/images/tai-2026.jpg",
  "/assets/images/te-le-quy-linh-nhi.webp",
  "/assets/images/tham-my-vien-am-phu.jpg",
  "/assets/images/Thor.jpg",
  "/assets/images/thỏ ơi.jpg",
  "/assets/images/tiểu yêu quái núi lãng lãng.jpg",
  "/assets/images/Tử chiến.jpg",
  "/assets/images/Đào.jpg",
  "/assets/images/Đảo.jpg",
];

const cinemaMission = [
  {
    number: "01",
    title: "Không gian xem phim dễ chịu",
    description: "CineSky được hình dung như một cụm rạp đô thị có sảnh chờ gọn, phòng chiếu tối ưu tầm nhìn và âm thanh ổn định.",
  },
  {
    number: "02",
    title: "Đặt vé trước khi đến rạp",
    description: "Khách có thể xem lịch chiếu, chọn ghế, giữ vé và chuẩn bị combo trước để giảm thời gian chờ tại quầy.",
  },
  {
    number: "03",
    title: "Ưu đãi theo hạng thành viên",
    description: "Silver, Gold và Diamond có voucher riêng, ưu đãi sinh nhật và combo tiết kiệm cho các buổi xem phim thường xuyên.",
  },
];

const cinemaTech = [
  {
    name: "IMAX Laser",
    desc: "Độ phân giải 4K sắc nét gấp đôi máy chiếu thường, kết hợp độ tương phản sâu thẳm.",
    icon: "✨",
  },
  {
    name: "Dolby Atmos",
    desc: "Hệ thống âm thanh vòm 360 độ siêu thực, cảm nhận tiếng động đa chiều quanh bạn.",
    icon: "🔊",
  },
  {
    name: "Ghế Bọc Da Cao Cấp",
    desc: "Êm ái, ôm sát cơ thể với không gian rộng rãi để bạn thoải mái suốt 3 giờ đồng hồ.",
    icon: "💺",
  },
];

const cinemaLocations = [
  {
    name: "CineSky Nguyen Hue",
    rooms: "2 phòng chiếu",
    seats: "392 ghế",
    address: "12 Nguyen Hue, Quan 1, TP.HCM",
    halls: "Sky Hall 1, Sky Hall 2",
  },
  {
    name: "CineSky Hai Ba Trung",
    rooms: "2 phòng chiếu",
    seats: "432 ghế",
    address: "98 Hai Ba Trung, Quan 3, TP.HCM",
    halls: "Moon Hall, Galaxy Hall",
  },
  {
    name: "CineSky Dien Bien Phu",
    rooms: "2 phòng chiếu",
    seats: "608 ghế",
    address: "215 Dien Bien Phu, Binh Thanh, TP.HCM",
    halls: "Nova Hall, Aurora Hall",
  },
];

const cinemaServices = [
  "Lịch chiếu theo từng cụm rạp, từng phòng chiếu và từng khung giờ trong ngày",
  "Đặt vé online, chọn ghế trước và kiểm tra lại thông tin vé trước khi ra rạp",
  "Combo bắp nước, ưu đãi hội viên và voucher theo từng chiến dịch phim",
  "Tin tức điện ảnh, review nhanh, hậu trường và gợi ý phim sắp ra mắt",
  "Kênh góp ý để khách phản hồi chất lượng dịch vụ, phòng chiếu và trải nghiệm đặt vé",
];

const cinematicParticles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: `${1 + (index % 3)}px`,
  delay: `${(index % 9) * -0.7}s`,
  duration: `${8 + (index % 6)}s`,
}));

const AboutPage = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const revealItems = page.querySelectorAll(
      ".about-page > section, .about-section-heading, .about-highlight-card, .about-stat-card"
    );

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("about-is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 0.01 }
    );

    revealItems.forEach((item) => observer.observe(item));

    const handleScroll = () => {
      if (page) {
        page.style.setProperty("--scroll", window.scrollY);
        page.style.setProperty("--scroll-vh", window.scrollY / window.innerHeight);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  return (
    <main className="about-page" ref={pageRef}>
      <div className="home-cinematic-backdrop about-parallax-bg" aria-hidden="true">
        <video className="about-backdrop__video" autoPlay muted loop playsInline>
          <source src="/assets/videos/galaxy%20video1.mp4" type="video/mp4" />
          <source src="/assets/videos/galaxy-video1.mp4" type="video/mp4" />
        </video>
        <div className="home-cinematic-backdrop__grain"></div>
        <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--gold"></div>
        <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--blue"></div>
        <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--left"></div>
        <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--right"></div>
        <div className="home-cinematic-backdrop__orb home-cinematic-backdrop__orb--one"></div>
        <div className="home-cinematic-backdrop__orb home-cinematic-backdrop__orb--two"></div>
        <div className="home-cinematic-backdrop__film home-cinematic-backdrop__film--left"></div>
        <div className="home-cinematic-backdrop__film home-cinematic-backdrop__film--right"></div>
        <div className="home-cinematic-backdrop__particles">
          {cinematicParticles.map((particle) => (
            <span
              key={particle.id}
              style={{
                "--particle-left": particle.left,
                "--particle-top": particle.top,
                "--particle-size": particle.size,
                "--particle-delay": particle.delay,
                "--particle-duration": particle.duration,
              }}
            />
          ))}
        </div>
      </div>


      <section className="about-hero">
        <div className="about-hero__content">
          <span className="about-kicker">Về rạp CineSky</span>
          <h1>CineSky là rạp phim đô thị dành cho những buổi hẹn xem phim gọn, nhanh và có nhiều ưu đãi thành viên.</h1>


          <div className="about-film-reel" aria-label="Poster phim CineSky chuyển động">
          </div>

          <div className="about-hero__actions">
            <Link to="/?tab=now" className="about-solid-link">
              Xem phim đang chiếu
            </Link>
            <Link to="/promotions" className="about-ghost-link">
              Xem ưu đãi
            </Link>
            <Link to="/news" className="about-ghost-link">
              Tin tức điện ảnh
            </Link>
          </div>
        </div>

        <div className="about-hero__panel">
          <div className="about-highlight-card">
            <span className="about-highlight-card__label">Trải nghiệm tại CineSky</span>
            <p>
              Hãy tưởng tượng CineSky như một rạp phim thật: khách xem lịch chiếu online, chọn ghế trước, mua combo,
              nhận ưu đãi theo hạng thành viên và đến rạp chỉ để tận hưởng bộ phim.
            </p>

            <div className="about-creator-facts">
              {cinemaHighlights.map((item) => (
                <div key={item.label} className="about-creator-fact">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-film-reel" aria-label="Poster phim CineSky chuyển động">
        <div className="about-film-reel__track">
          {[...filmPosters, ...filmPosters].map((poster, index) => (
            <div className="about-film-frame" key={`${poster}-${index}`}>
              <img src={poster} alt="" />
            </div>
          ))}
        </div>
      </section>

      <section className="about-cinema-block">
        <div className="about-section-heading about-section-heading--center">
          <span className="about-kicker">Hệ thống rạp</span>
          <h2>CineSky được hình dung như một rạp phim thật: khách đến xem phim, đặt vé, mua combo và nhận ưu đãi.</h2>
        </div>

        <div className="about-mission-grid">
          {cinemaMission.map((item) => (
            <article key={item.number} className="about-mission-card">
              <strong>{item.number}</strong>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cinema-block about-cinema-block--tech" style={{ marginTop: '24px' }}>
        <div className="about-section-heading about-section-heading--center">
          <span className="about-kicker">Công nghệ rạp chiếu</span>
          <h2>Trải nghiệm âm thanh và hình ảnh đạt chuẩn quốc tế tại mọi phòng chiếu CineSky.</h2>
        </div>

        <div className="about-tech-grid">
          {cinemaTech.map((item) => (
            <article key={item.name} className="about-tech-card">
              <div className="about-tech-card__glow"></div>
              <span className="about-tech-icon">{item.icon}</span>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-location-system">
        <div className="about-section-heading">
          <span className="about-kicker">Cụm rạp CineSky</span>
        </div>

        <div className="about-location-layout">
          <div className="about-cinema-summary" aria-label="Tổng quan cụm rạp CineSky">
            <span className="about-highlight-card__label">Hệ thống rạp</span>
            <strong>3</strong>
            <p>cụm rạp CineSky tại TP.HCM</p>
            <div>
              <span>6 phòng chiếu</span>
              <span>1.432 ghế</span>
              <span>TP.HCM</span>
            </div>
          </div>

          <div className="about-location-showcase">
            <div className="about-location-list">
            {cinemaLocations.map((item) => (
              <article key={item.name} className="about-location-card">
                <h3>{item.name}</h3>
                <p>{item.rooms} • {item.seats}</p>
                <span>{item.address}</span>
                <small>{item.halls}</small>
              </article>
            ))}
            </div>

            <DynamicLottie
              src="/assets/lottie/Space%20Tour.json"
              className="about-location-animation"
              loop={true}
              autoplay={true}
              aria-label="Minh họa phi hành gia CineSky"
            />
          </div>
        </div>
      </section>

      <section className="about-service-system">
        <div className="about-section-heading about-section-heading--center">
          <span className="about-kicker">Dịch vụ & tiện ích</span>
          <h2>CineSky tập trung vào những việc người xem cần nhất khi chuẩn bị đi xem phim.</h2>
        </div>

        <div className="about-service-list">
          {cinemaServices.map((item) => (
            <div key={item} className="about-service-item">
              <span></span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-stats">
        {stats.map((item) => (
          <article key={item.value} className="about-stat-card">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="about-cta">
        <div className="about-section-heading">
          <span className="about-kicker">Tiếp tục khám phá</span>
          <h2>Bạn có thể thử trực tiếp các trải nghiệm chính của CineSky.</h2>
          <p>
            Hãy thử lọc phim, vào chi tiết, đăng nhập để đặt vé, xem lịch sử hoặc gửi feedback để trải nghiệm CineSky trọn vẹn hơn.
          </p>
        </div>

        <div className="about-cta__actions">
          <Link to="/filter" className="about-ghost-link">
            Đi tới trang lọc phim
          </Link>
          <Link to="/feedback" className="about-solid-link">
            Mở biểu mẫu góp ý
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;

