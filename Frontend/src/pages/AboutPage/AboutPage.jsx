import React from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

const projectPoints = [
  {
    title: "Trải nghiệm đặt vé mạch lạc",
    description:
      "CineSky tập trung vào luồng thao tác rõ ràng: từ khám phá phim, xem trailer, chọn suất chiếu đến đặt vé trên cùng một trải nghiệm trực quan và dễ theo dõi.",
  },
  {
    title: "Giao diện hiện đại, dễ dùng",
    description:
      "Dự án ưu tiên cảm giác điện ảnh nhưng vẫn giữ nhịp đọc thoáng, card rõ ràng và các điểm nhấn đủ mạnh để người dùng mới vẫn thao tác nhanh mà không bị rối.",
  },
  {
    title: "Nền tảng fullstack để mở rộng",
    description:
      "Toàn bộ dữ liệu phim, thể loại, suất chiếu và booking được tổ chức theo hướng API-driven để dễ phát triển thêm xác thực, lịch sử đặt vé và quản trị nội dung.",
  },
];

const stats = [
  { value: "Cá nhân", label: "CineSky được xây dựng như một dự án cá nhân để rèn tư duy sản phẩm và fullstack." },
  { value: "Frontend", label: "Định hướng chính là tối ưu giao diện, trải nghiệm người dùng và khả năng thao tác nhanh." },
  { value: "React + Express", label: "Kết nối frontend và backend theo luồng dữ liệu thật thay vì chỉ dựng giao diện tĩnh." },
  { value: "Responsive", label: "Tối ưu hiển thị trên desktop, tablet và mobile để trải nghiệm đồng nhất hơn." },
];

const creatorHighlights = [
  { label: "Người thực hiện", value: "Đỗ Trọng Hiếu" },
  { label: "Định hướng", value: "Frontend Developer" },
  { label: "Loại dự án", value: "Dự án cá nhân" },
  { label: "Kênh liên hệ", value: "Facebook và GitHub cá nhân" },
];

const journeySteps = [
  {
    step: "01",
    title: "Khám phá phim",
    description:
      "Người dùng có thể bắt đầu từ trang chủ, phim đang chiếu, phim sắp chiếu hoặc khu lọc để tiếp cận đúng nội dung mình quan tâm ngay từ đầu.",
  },
  {
    step: "02",
    title: "Xem chi tiết rõ ràng",
    description:
      "Mỗi phim có trang riêng để xem mô tả, trailer, thời lượng, quốc gia, độ tuổi và cân nhắc trước khi đi tiếp đến bước đặt vé.",
  },
  {
    step: "03",
    title: "Đặt vé nhanh hơn",
    description:
      "Luồng booking gom các bước chọn rạp, suất chiếu, ghế và thanh toán về một flow mạch lạc để giảm thao tác thừa và tăng cảm giác kiểm soát.",
  },
  {
    step: "04",
    title: "Hoàn thiện dần theo sản phẩm thật",
    description:
      "Dự án tiếp tục được mở rộng theo hướng có đăng nhập, lịch sử đặt vé, dữ liệu động và các lớp quản trị gần hơn với một movie web app thực tế.",
  },
];

const creatorFocus = [
  "Thiết kế giao diện theo phong cách điện ảnh nhưng vẫn rõ ràng khi thao tác",
  "Xây dựng luồng đặt vé có chọn rạp, suất chiếu, ghế và thanh toán mô phỏng",
  "Kết nối frontend với backend qua API phim, thể loại, showtime và booking",
  "Tối ưu responsive để website giữ được trải nghiệm ổn định trên nhiều kích thước màn hình",
];

const technologies = [
  "ReactJS",
  "React Router",
  "JavaScript",
  "TypeScript-ready",
  "ExpressJS",
  "MongoDB",
  "Mongoose",
  "REST API",
  "Responsive UI",
  "Figma mindset",
];

const roadmapItems = [
  {
    phase: "Dữ liệu & nội dung",
    description:
      "Tiếp tục chuẩn hóa dữ liệu phim, thể loại, showtime và booking để các trang hiển thị hoàn toàn từ backend thay vì phụ thuộc vào dữ liệu tĩnh.",
  },
  {
    phase: "Tài khoản & xác thực",
    description:
      "Hoàn thiện đăng ký, đăng nhập, hồ sơ người dùng và các quyền truy cập cơ bản để những luồng cần trạng thái tài khoản hoạt động chặt chẽ hơn.",
  },
  {
    phase: "Booking & lịch sử",
    description:
      "Mở rộng từ bước chọn ghế sang lưu booking thật, đồng bộ lịch sử giao dịch và cho phép người dùng xem lại thông tin các vé đã đặt.",
  },
  {
    phase: "Quản trị nội dung",
    description:
      "Bổ sung lớp quản lý phim, thể loại, suất chiếu và nội dung động để CineSky tiến gần hơn đến một hệ thống hoàn chỉnh và dễ vận hành.",
  },
];

const creatorTimeline = [
  {
    phase: "Research",
    detail: "Phác thảo luồng người dùng, các trang chính và cảm giác điện ảnh mà CineSky muốn truyền tải.",
  },
  {
    phase: "UI Design",
    detail: "Dựng layout card, hero, movie detail và booking theo hướng tối, rõ và dễ thao tác.",
  },
  {
    phase: "Frontend",
    detail: "Kết nối route, search, filter, movie detail, feedback và các trạng thái giao diện chính.",
  },
  {
    phase: "Backend",
    detail: "Tổ chức dữ liệu phim, showtime, booking và các API cần thiết để website chạy theo luồng thật.",
  },
];

const AboutPage = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero__content">
          <span className="about-kicker">Giới thiệu dự án</span>
          <h1>CineSky là dự án cá nhân được xây dựng để mô phỏng một trải nghiệm đặt vé xem phim hiện đại, gọn và dễ dùng.</h1>
          <p>
            Đây không chỉ là một website hiển thị danh sách phim. CineSky được mình phát triển theo hướng có luồng sản phẩm rõ
            ràng: khám phá phim, xem thông tin chi tiết, chọn rạp, chọn suất chiếu, chọn ghế và tiến đến bước thanh toán trên
            cùng một hệ giao diện có điểm nhấn và dễ thao tác.
          </p>

          <div className="about-hero__actions">
            <Link to="/?tab=now" className="about-solid-link">
              Xem phim đang chiếu
            </Link>
            <a
              href="https://github.com/Hiu11"
              target="_blank"
              rel="noreferrer"
              className="about-ghost-link"
            >
              GitHub cá nhân
            </a>
            <a
              href="https://www.facebook.com/otronghieu.343642"
              target="_blank"
              rel="noreferrer"
              className="about-ghost-link"
            >
              Facebook cá nhân
            </a>
          </div>
        </div>

        <div className="about-hero__panel">
          <div className="about-highlight-card">
            <span className="about-highlight-card__label">Chủ dự án</span>
            <h2>Đỗ Trọng Hiếu</h2>
            <p>
              Mình là sinh viên Kỹ thuật Phần mềm tại UEH, định hướng Frontend Developer. CineSky được phát triển như một dự
              án cá nhân để rèn khả năng thiết kế giao diện, tổ chức luồng trải nghiệm và kết nối frontend - backend theo mô
              hình fullstack.
            </p>

            <div className="about-creator-facts">
              {creatorHighlights.map((item) => (
                <div key={item.label} className="about-creator-fact">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
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

      <section className="about-creator">
        <div className="about-section-heading">
          <span className="about-kicker">Người thực hiện</span>
          <h2>Phần giới thiệu này phản ánh đúng tinh thần dự án cá nhân mà mình đang theo đuổi với CineSky.</h2>
          <p>
            Mục tiêu của mình không chỉ là hoàn thành một website xem phim đẹp mắt, mà còn là từng bước biến CineSky thành một
            bài tập fullstack nghiêm túc, có giao diện rõ, dữ liệu thật và đủ nền để mở rộng thêm nghiệp vụ sau này.
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
          <span className="about-kicker">Điểm nổi bật</span>
          <h2>Ba lớp giá trị mình đang ưu tiên khi phát triển CineSky.</h2>
          <p>
            Phiên bản hiện tại được định hình quanh ba mục tiêu: nội dung phim dễ theo dõi hơn, luồng thao tác gọn hơn và nền
            backend đủ sạch để tiếp tục mở rộng thành sản phẩm hoàn chỉnh hơn ở các bước sau.
          </p>
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
          <p>
            Thay vì dồn mọi thứ vào một màn hình duy nhất, dự án chia nhỏ nội dung theo từng quyết định của người dùng để việc
            xem nhanh, hiểu nhanh và hành động nhanh hơn trong một flow nhất quán.
          </p>
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
          <h2>CineSky được hoàn thiện theo từng lớp từ ý tưởng, giao diện đến dữ liệu và booking flow.</h2>
          <p>
            Phần này giúp người xem hiểu rõ dự án cá nhân không chỉ là một giao diện đơn lẻ, mà là
            chuỗi bước phát triển có mục tiêu rõ ràng.
          </p>
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

      <section className="about-roadmap">
        <div className="about-section-heading">
          <span className="about-kicker">Lộ trình phát triển</span>
          <h2>CineSky vẫn đang được hoàn thiện từng lớp để tiến gần hơn tới một movie web app đầy đủ.</h2>
          <p>
            Hiện tại dự án đã có nền dữ liệu phim, trang hiển thị nội dung và luồng booking cơ bản. Các bước tiếp theo sẽ tập
            trung mạnh hơn vào xác thực, booking thật, lịch sử giao dịch và quản trị nội dung.
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
          <h2>Nếu muốn xem trực tiếp trải nghiệm mình đang xây dựng, bạn có thể đi tiếp từ đây.</h2>
          <p>
            Mỗi góp ý từ người dùng sẽ giúp CineSky tiến gần hơn tới một sản phẩm mượt hơn, rõ hơn và có cảm giác điện ảnh đồng
            nhất hơn trong toàn bộ hành trình đặt vé.
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
