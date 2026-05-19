import { Link } from "react-router-dom";
import "./CinemaNews.css";

const featuredNews = [
  {
    category: "Sắp ra mắt",
    title: "Loạt phim hè 2026 bắt đầu nóng lên với nhiều suất chiếu sớm.",
    image: "/assets/images/supergirl-2026.jpg",
    summary: "CineSky gợi ý những tựa phim đáng chú ý cho nhóm bạn, gia đình và fan siêu anh hùng.",
  },
  {
    category: "Review nhanh",
    title: "3 lý do nên xem phim Việt trên màn hình lớn tuần này.",
    image: "/assets/images/running-man.jpg",
    summary: "Không khí rạp, âm thanh và khung hình rộng giúp nhiều cảnh cảm xúc rõ hơn so với xem tại nhà.",
  },
  {
    category: "Hậu trường",
    title: "Khi poster, trailer và lịch chiếu cùng tạo nên một chiến dịch phim.",
    image: "/assets/images/anh-hung-2026.jpg",
    summary: "Một chiến dịch tốt giúp khán giả hiểu phim nhanh và dễ quyết định đặt vé hơn.",
  },
];

const quickReads = [
  "Lịch chiếu nổi bật cuối tuần: ưu tiên suất tối cho phim gia đình và phim hành động.",
  "Mẹo chọn ghế: hàng giữa thường cân bằng nhất giữa âm thanh, khoảng cách và tầm nhìn.",
  "Review nhanh nên đọc trước khi đặt vé: thể loại, nhịp phim, độ tuổi và thời lượng.",
];

export default function CinemaNews() {
  return (
    <main className="cinema-news-page">
      <section className="cinema-news-hero">
        <span>Tin tức điện ảnh</span>
        <h1>Bài viết phim sắp ra mắt, hậu trường, review nhanh và lịch chiếu nổi bật.</h1>
        <p>
          Khu nội dung giúp CineSky có cảm giác như một website rạp phim thương mại, đồng thời kéo dài trải nghiệm sau trang chủ.
        </p>
      </section>

      <section className="cinema-news-grid">
        {featuredNews.map((item) => (
          <article key={item.title} className="cinema-news-card">
            <img src={item.image} alt={item.title} />
            <div>
              <span>{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="cinema-news-brief">
        <div>
          <span>Đọc nhanh</span>
          <h2>Góc cập nhật trước khi ra rạp.</h2>
          <Link to="/?tab=soon">Xem phim sắp chiếu</Link>
        </div>
        <div className="cinema-news-brief__list">
          {quickReads.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
