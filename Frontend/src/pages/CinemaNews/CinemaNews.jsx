import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { cinemaNewsArticles, featuredCinemaNews } from "../../data/cinemaNewsArticles";
import "../HomePage/HomePage.css";
import "./CinemaNews.css";

const quickReads = [
  "Mưa Đỏ hợp với khán giả thích chính kịch lịch sử, nên ưu tiên suất tối hoặc phòng chiếu âm thanh tốt.",
  "Song Hỷ Lâm Nguy và Running Man Việt Nam mùa 3 là hai lựa chọn dễ đi theo nhóm bạn.",
  "Phí Phông, Heo Năm Móng và Thẩm Mỹ Viện Âm Phủ tạo một cụm kinh dị Việt khá dày trong danh sách CineSky.",
];

const insightBlocks = [
  {
    title: "Phim Việt",
    text: "Ưu tiên các bài bám vào phim Việt đang có trong danh sách để người đọc có thể đặt vé ngay.",
  },
  {
    title: "Đang chiếu",
    text: "Tin ngắn giúp khán giả chọn phim theo thể loại, độ tuổi, thời lượng và tâm trạng xem.",
  },
  {
    title: "Sắp chiếu",
    text: "Các phim chưa mở suất vẫn có trang tin để tạo tò mò và giữ lịch chờ trước ngày ra mắt.",
  },
  {
    title: "Liên kết phim",
    text: "Mỗi bài đều dẫn về trang phim tương ứng trong CineSky để đọc xong có thể xem lịch hoặc trailer.",
  },
];

const cinematicParticles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: `${1 + (index % 3)}px`,
  delay: `${(index % 9) * -0.7}s`,
  duration: `${8 + (index % 6)}s`,
}));

function useCinemaNewsReveal() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const revealItems = page.querySelectorAll(
      ".cinema-news-hero, .cinema-news-featured, .cinema-news-card, .cinema-news-brief, .cinema-news-brief__list p, .cinema-news-expanded, .cinema-news-expanded__grid article, .cinema-news-all, .cinema-news-detail, .cinema-news-detail > *, .cinema-news-related"
    );

    revealItems.forEach((item, index) => {
      item.classList.add("cinema-news-reveal");
      item.style.setProperty("--reveal-delay", `${Math.min(index * 50, 360)}ms`);
    });

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return pageRef;
}

function NewsBackdrop() {
  return (
    <div className="home-cinematic-backdrop" aria-hidden="true">
      <video className="cinema-news-backdrop__video" autoPlay muted loop playsInline>
        <source src="/assets/videos/galaxy%20video2.mp4" type="video/mp4" />
        <source src="/assets/videos/galaxy-video2.mp4" type="video/mp4" />
      </video>
      <div className="home-cinematic-backdrop__grain"></div>
      <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--gold"></div>
      <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--blue"></div>
      <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--left"></div>
      <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--right"></div>
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
  );
}

function NewsCard({ article, size = "regular" }) {
  return (
    <Link to={`/news/${article.slug}`} className={`cinema-news-card cinema-news-card--${size}`}>
      <img src={article.image} alt={article.title} />
      <div>
        <span>{article.category}</span>
        <h2>{article.title}</h2>
        <p>{article.dek}</p>
        <small>
          {article.publishedAt} · {article.readTime}
        </small>
      </div>
    </Link>
  );
}

function CinemaNewsList() {
  const pageRef = useCinemaNewsReveal();
  const latestArticles = cinemaNewsArticles.slice(3);

  return (
    <main className="cinema-news-page" ref={pageRef}>
      <NewsBackdrop />

      <section className="cinema-news-hero">
        <span>Tin tức điện ảnh</span>
        <h1>Tin phim Việt trong danh sách CineSky, có trang con để đọc kỹ hơn.</h1>
        <p>
          CineSky gom các bài viết bám trực tiếp vào phim đang chiếu và sắp chiếu trong hệ thống.
          Mỗi bài có tóm tắt nhanh, điểm chính và đường dẫn sang trang chi tiết phim để đặt vé thuận hơn.
        </p>
      </section>

      <section className="cinema-news-featured" aria-label="Tin nổi bật">
        <NewsCard article={featuredCinemaNews[0]} size="lead" />
        <div className="cinema-news-featured__side">
          {featuredCinemaNews.slice(1).map((article) => (
            <NewsCard key={article.slug} article={article} size="compact" />
          ))}
        </div>
      </section>

      <section className="cinema-news-brief">
        <div>
          <span>Đọc nhanh</span>
          <h2>Những điểm đáng chú ý trước khi ra rạp.</h2>
          <Link to="/?tab=soon">Xem phim sắp chiếu</Link>
        </div>
        <div className="cinema-news-brief__list">
          {quickReads.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="cinema-news-expanded">
        <div className="cinema-news-expanded__header">
          <span>Chuyên mục</span>
          <h2>Đọc theo bối cảnh, không chỉ đọc tiêu đề.</h2>
        </div>
        <div className="cinema-news-expanded__grid">
          {insightBlocks.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cinema-news-all">
        <div className="cinema-news-expanded__header">
          <span>Mọi bài viết</span>
          <h2>Thêm tin có trang chi tiết riêng.</h2>
        </div>
        <div className="cinema-news-grid">
          {latestArticles.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CinemaNewsDetail({ article }) {
  const pageRef = useCinemaNewsReveal();
  const relatedArticles = cinemaNewsArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const sources = article.sources?.length
    ? article.sources
    : [{ name: article.sourceName, url: article.sourceUrl }].filter((source) => source.name && source.url);

  return (
    <main className="cinema-news-page cinema-news-detail-page" ref={pageRef}>
      <NewsBackdrop />

      <article className="cinema-news-detail">
        <Link to="/news" className="cinema-news-back-link">
          Quay lại tin tức
        </Link>

        <header className="cinema-news-detail__header">
          <span>{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.dek}</p>
          <div className="cinema-news-detail__meta">
            <strong>{article.publishedAt}</strong>
            <strong>{article.readTime}</strong>
            <a href={article.sourceUrl} target="_blank" rel="noreferrer">
              Nguồn: {article.sourceName}
            </a>
            <Link to={`/movie/${article.movieId}`} className="cinema-news-movie-link">
              Xem phim trong CineSky
            </Link>
          </div>
        </header>

        <img className="cinema-news-detail__image" src={article.image} alt={article.title} />

        <section className="cinema-news-facts">
          <h2>Thông tin chính</h2>
          {article.facts.map((fact) => (
            <p key={fact}>{fact}</p>
          ))}
        </section>

        {article.stats?.length ? (
          <section className="cinema-news-stats">
            {article.stats.map((item) => (
              <article key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </section>
        ) : null}

        <section className="cinema-news-body">
          {article.sections?.map((section) => (
            <article key={section.heading} className="cinema-news-body__section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </section>

        <section className="cinema-news-source">
          <h2>Nguồn tham khảo</h2>
          <p>Nội dung được biên tập từ các nguồn dưới đây và dữ liệu phim đang có trong CineSky.</p>
          <div className="cinema-news-source__links">
            {sources.map((source) => (
              <a key={source.url} href={source.url} target={source.url.startsWith("/") ? undefined : "_blank"} rel="noreferrer">
                {source.name}
              </a>
            ))}
          </div>
        </section>
      </article>

      <section className="cinema-news-related">
        <div className="cinema-news-expanded__header">
          <span>Đọc tiếp</span>
          <h2>Tin liên quan</h2>
        </div>
        <div className="cinema-news-grid">
          {relatedArticles.map((item) => (
            <NewsCard key={item.slug} article={item} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function CinemaNews() {
  const { slug } = useParams();

  if (!slug) {
    return <CinemaNewsList />;
  }

  const article = cinemaNewsArticles.find((item) => item.slug === slug);

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  return <CinemaNewsDetail article={article} />;
}
