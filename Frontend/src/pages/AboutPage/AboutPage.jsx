import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

const projectPoints = [
  {
    title: "Luồng xem phim và đặt vé đã liền mạch hơn",
    description:
      "Người dùng có thể đi từ trang chủ, lọc phim, xem chi tiết, chọn suất chiếu, đặt vé, xem trang thành công và kiểm tra lại lịch sử booking.",
  },
  {
    title: "Tài khoản người dùng có trạng thái thật",
    description:
      "Project đã có đăng ký, đăng nhập, quên mật khẩu, hồ sơ cá nhân, token đăng nhập và các route cần tài khoản như đặt vé/lịch sử.",
  },
  {
    title: "Admin Dashboard đã quản lý được dữ liệu chính",
    description:
      "Admin có thể xem overview, quản lý phim, người dùng, booking, thùng rác phim và các dữ liệu phục vụ vận hành mô phỏng.",
  },
];

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

const journeySteps = [
  {
    step: "01",
    title: "Khám phá và lọc phim",
    description:
      "Người dùng bắt đầu từ trang chủ, tab phim đang chiếu/sắp chiếu, ô tìm kiếm hoặc trang lọc phim để tìm nội dung phù hợp.",
  },
  {
    step: "02",
    title: "Xem chi tiết và tương tác",
    description:
      "Trang chi tiết hiển thị poster, trailer, mô tả, thể loại, thời lượng, độ tuổi; người dùng có thể review/favorite khi đăng nhập.",
  },
  {
    step: "03",
    title: "Đặt vé theo suất chiếu",
    description:
      "Luồng booking xử lý chọn rạp, phòng, suất chiếu, ghế và tạo booking; sau đó chuyển sang trang đặt vé thành công.",
  },
  {
    step: "04",
    title: "Theo dõi sau khi đặt",
    description:
      "Người dùng có thể xem lịch sử đặt vé, cập nhật hồ sơ cá nhân và gửi feedback để góp ý cho trải nghiệm CineSky.",
  },
];

const creatorFocus = [
  "Hoàn thiện trải nghiệm người dùng từ tìm phim đến lịch sử đặt vé",
  "Kết nối các API auth, movie, booking, feedback, review/favorite và admin",
  "Làm Admin Dashboard đủ dùng để quản lý phim, user, booking và thùng rác",
  "Giữ giao diện điện ảnh nhưng vẫn rõ trạng thái, thông báo và thao tác chính",
];

const technologies = [
  "React 19",
  "React Router 6",
  "JavaScript",
  "React Scripts",
  "Express 4",
  "MongoDB",
  "Mongoose 8",
  "REST API",
  "bcrypt",
  "JWT Auth",
  "Google/Facebook OAuth",
  "Admin Dashboard",
  "Responsive UI",
  "Figma mindset",
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

const completedFeatures = [
  {
    title: "Authentication và hồ sơ người dùng",
    description:
      "CineSky hiện có đăng ký, đăng nhập, quên mật khẩu, JWT/session, route private và trang profile để người dùng xem/cập nhật thông tin cá nhân.",
  },
  {
    title: "Movie booking flow có lịch sử",
    description:
      "Người dùng có thể xem phim, tìm/lọc phim, vào chi tiết, chọn suất chiếu, tạo booking, xem trang thành công và tra lại lịch sử đặt vé.",
  },
  {
    title: "Admin Dashboard đã có nghiệp vụ chính",
    description:
      "Admin có overview, danh sách users, bookings, quản lý phim, cập nhật role, xóa/khôi phục phim trong thùng rác và theo dõi dữ liệu mô phỏng.",
  },
  {
    title: "Có lớp tương tác và phản hồi",
    description:
      "Project đã có feedback, review/favorite, toast thông báo, tìm kiếm gợi ý, lưu tìm kiếm gần đây và các trạng thái UI giúp trải nghiệm thật hơn.",
  },
];

const projectPros = [
  "Luồng người dùng khá đầy đủ: tìm phim, xem chi tiết, đăng nhập, đặt vé, xem lịch sử và gửi feedback.",
  "Có backend Express/MongoDB, JWT auth, dữ liệu movie/showtime/booking và các API riêng cho admin.",
  "Admin Dashboard có các phần quan trọng như movies, users, orders/bookings, trash và overview.",
];

const projectCons = [
  "Thanh toán vẫn là mô phỏng, chưa tích hợp cổng thanh toán thật hoặc quy trình hoàn/hủy vé đầy đủ.",
  "Một số module admin như showtimes, cinemas, payments, activity hiện thiên về hiển thị hơn là CRUD hoàn chỉnh.",
  "Dự án hiện chạy local, chưa deploy production; cần thêm kiểm thử, bảo mật nâng cao và tối ưu hiệu năng khi dữ liệu lớn hơn.",
];

const roadmapItems = [
  {
    phase: "Thanh toán & vé",
    description:
      "Nâng từ thanh toán mô phỏng sang trạng thái giao dịch rõ hơn, có mã vé/QR, hủy vé, hoàn tiền và kiểm tra vé tại rạp.",
  },
  {
    phase: "Admin CRUD sâu hơn",
    description:
      "Mở rộng quản lý showtimes, cinemas, payments và activity log để admin vận hành dữ liệu chủ động hơn thay vì chỉ xem overview.",
  },
  {
    phase: "Bảo mật & phân quyền",
    description:
      "Bổ sung refresh token flow chặt hơn, phân quyền chi tiết theo hành động admin, validate dữ liệu và bảo vệ các endpoint quan trọng.",
  },
  {
    phase: "Gợi ý phim thông minh",
    description:
      "Dựa trên lịch sử đặt vé, favorite, review và thể loại yêu thích để gợi ý phim phù hợp hơn cho từng người dùng.",
  },
  {
    phase: "Deploy & kiểm thử",
    description:
      "Chuẩn hóa biến môi trường khi deploy, thêm test cho auth/booking/admin và kiểm tra responsive để project sẵn sàng demo ổn định trên hosting.",
  },
];

const creatorTimeline = [
  {
    phase: "UI & Catalog",
    detail: "Dựng trang chủ, tab phim, movie card, filter/search và trang chi tiết để người dùng khám phá nội dung.",
  },
  {
    phase: "Auth & Profile",
    detail: "Bổ sung đăng ký, đăng nhập, quên mật khẩu, lưu session/token và trang hồ sơ cá nhân.",
  },
  {
    phase: "Booking",
    detail: "Kết nối showtime, chọn ghế, tạo booking, trang thành công và lịch sử đặt vé cho user.",
  },
  {
    phase: "Admin",
    detail: "Hoàn thiện dashboard quản lý phim, user, booking, trash và các số liệu overview.",
  },
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

const aboutNoteText =
  "Trang About được chia rõ 2 phần: Phần 1 giới thiệu CineSky như một rạp phim giả tưởng đang vận hành thật, tập trung vào trải nghiệm khách hàng, cụm rạp, dịch vụ và ưu đãi. Phần 2 mới nói về dự án cá nhân, công nghệ, người thực hiện và trạng thái triển khai.";

const AboutPage = () => {
  const pageRef = useRef(null);
  const noteRef = useRef(null);
  const noteCardRef = useRef(null);
  const [isNotePopupOpen, setIsNotePopupOpen] = useState(true);
  const [isNoteClosing, setIsNoteClosing] = useState(false);
  const [isNoteLanding, setIsNoteLanding] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const revealItems = page.querySelectorAll(
      ".about-page > section, .about-section-heading, .about-highlight-card, .about-stat-card, .about-creator-card, .about-story-card, .about-journey-card, .about-timeline-card, .about-roadmap-card, .about-pros-cons-card"
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
    return () => observer.disconnect();
  }, []);

  const closeNotePopup = () => {
    const noteRect = noteRef.current?.getBoundingClientRect();
    const cardRect = noteCardRef.current?.getBoundingClientRect();

    if (noteRect && cardRect) {
      noteCardRef.current.style.setProperty("--about-note-close-x", `${noteRect.left - cardRect.left}px`);
      noteCardRef.current.style.setProperty("--about-note-close-y", `${noteRect.top - cardRect.top}px`);
      noteCardRef.current.style.setProperty(
        "--about-note-close-scale",
        String(Math.min(noteRect.width / cardRect.width, 1))
      );
    }

    setIsNoteClosing(true);

    window.setTimeout(() => {
      setIsNotePopupOpen(false);
      setIsNoteClosing(false);
      setIsNoteLanding(true);
    }, 620);

    window.setTimeout(() => {
      setIsNoteLanding(false);
    }, 1700);
  };

  return (
    <main className="about-page" ref={pageRef}>
      {isNotePopupOpen ? (
        <div className={`about-note-modal${isNoteClosing ? " about-note-modal--closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="about-note-title">
          <div ref={noteCardRef} className="about-note-modal__card">
            <div className="about-note-modal__icon">!</div>
            <div>
              <span className="about-kicker" id="about-note-title">Ghi chú nhanh</span>
              <p>{aboutNoteText}</p>
            </div>
            <button type="button" onClick={closeNotePopup} aria-label="Đóng ghi chú">
              Đã hiểu
            </button>
          </div>
        </div>
      ) : null}

      <section className="about-hero">
        <div className="about-hero__content">
          <span className="about-kicker">Phần 1 • Về rạp CineSky</span>
          <h1>CineSky là rạp phim đô thị dành cho những buổi hẹn xem phim gọn, nhanh và có nhiều ưu đãi thành viên.</h1>

          <div ref={noteRef} className={`about-project-note${isNoteLanding ? " about-project-note--landing" : ""}`}>
            <strong>Ghi chú nhanh</strong>
            <p>{aboutNoteText}</p>
          </div>

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
          <h2>Phần 1 chỉ nói về CineSky như một rạp phim thật: khách đến xem phim, đặt vé, mua combo và nhận ưu đãi.</h2>
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

            <lottie-player
              className="about-location-animation"
              src="/assets/lottie/Space%20Tour.json"
              background="transparent"
              speed="1"
              loop
              autoplay
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

      <section className="about-project-divider">
        <span className="about-kicker">Phần 2</span>
        <h2>Giới thiệu dự án cá nhân</h2>
        <p>
          Từ đây trở xuống là phần nhìn CineSky như một project học tập/portfolio: đã có những chức năng nào, điểm mạnh/yếu ra sao
          và những phần nào còn có thể nâng cấp tiếp.
        </p>
      </section>

      <section className="about-creator">
        <div className="about-section-heading">
          <span className="about-kicker">Về dự án cá nhân</span>
          <h2>CineSky hiện là project full-stack chạy local, tập trung vào trải nghiệm đặt vé, tài khoản người dùng và quản trị dữ liệu.</h2>
          <p>
            Project được phát triển để rèn cả tư duy frontend lẫn backend: routing, UI state, form, API, auth, database,
            protected route, booking flow và dashboard admin. Phiên bản hiện tại chưa deploy production nên các OAuth key,
            database URI và secret cần được cấu hình riêng trong môi trường local.
          </p>
        </div>

        <div className="about-creator__grid">
          <article className="about-creator-card">
            <span className="about-highlight-card__label">Mình đang tập trung vào</span>
            <h3>Frontend rõ ràng, sản phẩm có cảm giác thật và luồng sử dụng dễ hiểu.</h3>
            <ul className="about-creator-list">
              {creatorFocus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="about-creator-card">
            <span className="about-highlight-card__label">Nền tảng cá nhân</span>
            <h3>Các công nghệ mình đang ưu tiên để phát triển CineSky.</h3>
            <div className="about-tech-tags">
              {technologies.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="about-creator__actions">
              <a
                href="https://github.com/Hiu11"
                target="_blank"
                rel="noreferrer"
                className="about-solid-link"
              >
                Xem GitHub
              </a>
              <a
                href="https://www.facebook.com/otronghieu.343642"
                target="_blank"
                rel="noreferrer"
                className="about-ghost-link"
              >
                Xem Facebook
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="about-story">
        <div className="about-section-heading">
          <span className="about-kicker">Điểm nổi bật của website</span>
          <h2>Ba điểm nổi bật đúng với trạng thái CineSky hiện tại.</h2>
        </div>

        <div className="about-story__grid">
          {projectPoints.map((point) => (
            <article key={point.title} className="about-story-card">
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-journey">
        <div className="about-section-heading">
          <span className="about-kicker">Hành trình người dùng</span>
          <h2>CineSky được sắp xếp theo đúng các bước người xem cần đi qua để tìm và đặt một bộ phim phù hợp.</h2>
        </div>

        <div className="about-journey__grid">
          {journeySteps.map((item) => (
            <article key={item.step} className="about-journey-card">
              <span className="about-journey-card__step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-timeline">
        <div className="about-section-heading">
          <span className="about-kicker">Timeline dự án</span>
          <h2>CineSky được hoàn thiện theo từng lớp từ catalog phim đến auth, booking và admin.</h2>
        </div>

        <div className="about-timeline__list">
          {creatorTimeline.map((item, index) => (
            <article key={item.phase} className="about-timeline-card">
              <span className="about-timeline-card__index">0{index + 1}</span>
              <div>
                <h3>{item.phase}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-completed">
        <div className="about-section-heading">
          <span className="about-kicker">Phiên bản hoàn thiện</span>
          <h2>CineSky hiện đã có nền full-stack đủ rõ để demo local như một movie booking app học tập.</h2>
        </div>

        <div className="about-roadmap__grid">
          {completedFeatures.map((item) => (
            <article key={item.title} className="about-roadmap-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-pros-cons">
        <div className="about-section-heading">
          <span className="about-kicker">Ưu & nhược điểm</span>
          <h2>Nhìn nhanh điểm mạnh và giới hạn hiện tại của project.</h2>
        </div>

        <div className="about-pros-cons__grid">
          <article className="about-pros-cons-card about-pros-cons-card--good">
            <h3>Ưu điểm</h3>
            <ul>
              {projectPros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="about-pros-cons-card about-pros-cons-card--limit">
            <h3>Nhược điểm</h3>
            <ul>
              {projectCons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="about-roadmap">
        <div className="about-section-heading">
          <span className="about-kicker">Lộ trình phát triển</span>
          <h2>Các bước tiếp theo nên tập trung vào vận hành thật, bảo mật và deploy ổn định.</h2>
          <p>
            Vì auth, booking, history, feedback và admin đã có nền tảng, giai đoạn tiếp theo nên làm sâu hơn phần thanh toán,
            quản trị showtime/cinema, kiểm thử và triển khai production với biến môi trường riêng cho hosting.
          </p>
        </div>

        <div className="about-roadmap__grid">
          {roadmapItems.map((item) => (
            <article key={item.phase} className="about-roadmap-card">
              <h3>{item.phase}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <div className="about-section-heading">
          <span className="about-kicker">Tiếp tục khám phá</span>
          <h2>Bạn có thể thử trực tiếp các luồng chính của CineSky.</h2>
          <p>
            Hãy thử lọc phim, vào chi tiết, đăng nhập để đặt vé, xem lịch sử hoặc gửi feedback để kiểm tra project theo đúng luồng hiện tại.
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
