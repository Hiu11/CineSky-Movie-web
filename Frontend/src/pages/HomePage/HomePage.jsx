import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import "./HomePage.css";

const MOVIES_PER_PAGE = 12;

const normalizeText = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const countByValue = (items = []) => {
  const map = new Map();

  items.forEach((item) => {
    map.set(item, (map.get(item) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], "vi"))
    .map(([label, count]) => ({ label, count }));
};

const toBackgroundUrl = (value = "") => encodeURI(value);

const extractReleaseYear = (value = "") => {
  const matchedYear = String(value).match(/(19|20)\d{2}/);
  return matchedYear ? matchedYear[0] : value;
};

const shortenText = (value = "", maxLength = 220) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
};

const CountUpNumber = ({ value, duration = 3000 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const numberRef = useRef(null);

  useEffect(() => {
    const node = numberRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      return undefined;
    }

    const target = Number(value) || 0;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(target * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, hasStarted, value]);

  return <strong ref={numberRef}>{displayValue}</strong>;
};

const getYoutubeVideoId = (trailer = "") => {
  const matchedId = String(trailer).match(
    /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^?&/]+)/
  );

  return matchedId?.[1] || "";
};

const getYoutubeThumbnailCandidates = (trailer = "") => {
  const videoId = getYoutubeVideoId(trailer);

  if (!videoId) {
    return [];
  }

  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
};

const faqItems = [
  {
    question: "CineSky hiện hỗ trợ những bước đặt vé nào?",
    answer:
      "Người dùng có thể xem phim, xem trailer, chọn rạp, chọn suất chiếu, chọn ghế và đi tới bước thanh toán mô phỏng ngay trên website.",
  },
  {
    question: "Tôi có cần đăng nhập để đặt vé không?",
    answer:
      "Bạn vẫn có thể đi qua luồng chọn phim và chọn ghế. Tuy nhiên, các tính năng như xem lịch sử đặt vé sẽ hoạt động tốt hơn khi có tài khoản.",
  },
  {
    question: "Phần thanh toán trên CineSky là thanh toán thật hay mô phỏng?",
    answer:
      "Ở phiên bản hiện tại, bước thanh toán đang được xây dựng theo dạng mô phỏng giao diện để hoàn thiện trải nghiệm và kiểm thử luồng người dùng.",
  },
  {
    question: "Nếu hết thời gian giữ chỗ thì sao?",
    answer:
      "Khi đồng hồ đếm ngược kết thúc, hệ thống sẽ khóa nút xác nhận và yêu cầu bạn chọn lại suất chiếu để tiếp tục đặt vé.",
  },
  {
    question: "CineSky có hỗ trợ lọc phim không?",
    answer:
      "Có. Bạn có thể dùng trang lọc để duyệt theo thể loại, quốc gia, độ tuổi hoặc tìm nhanh phim phù hợp với nhu cầu xem hiện tại.",
  },
  {
    question: "Tôi có thể góp ý hoặc báo lỗi ở đâu?",
    answer:
      "Bạn có thể dùng ngay trang Góp ý trên website để gửi nhận xét về giao diện, trải nghiệm hoặc các vấn đề cần cải thiện trong dự án.",
  },
];

const partnerItems = [
  { name: "IMAX with Laser", type: "Dai canh do net cao - Canada" },
  { name: "Dolby Atmos", type: "Am thanh vom vat the - USA" },
  { name: "ScreenX 270", type: "Man hinh ba mat - South Korea" },
  { name: "4DX Motion", type: "Ghe chuyen dong va hieu ung - South Korea" },
];

const techShowcase = [
  "Laser projection HDR",
  "Premium recliner seating",
  "Online seat reservation",
  "QR ticket check-in",
  "Pre-order snack combo",
  "Couple seat zone",
  "Assistive listening support",
  "Mobile booking reminders",
];

const cinematicParticles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: `${1 + (index % 3)}px`,
  delay: `${(index % 9) * -0.7}s`,
  duration: `${8 + (index % 6)}s`,
}));

const requestedMovies = [
  {
    id: 204,
    slug: "mua-do-2025",
    title: "MƯA ĐỎ",
    poster: "/assets/images/mua-do-2025.jpg",
    genres: ["Chiến tranh", "Lịch sử", "Tâm lý"],
    genre: "Chiến tranh, Lịch sử, Tâm lý",
    country: "Việt Nam",
    director: "Đặng Thái Huyền",
    duration: 124,
    rating: "T16",
    ratingClass: "t16",
    status: "now-showing",
    statusOrder: 0,
    catalogOrder: 1,
    release: "22/08/2025",
    times: ["09:15", "12:05", "15:10", "18:20", "21:05"],
    description: "Mưa Đỏ tái hiện một giai đoạn khốc liệt bằng góc nhìn giàu cảm xúc, nơi những con người trẻ tuổi phải đối diện với mất mát, niềm tin và lựa chọn sinh tử.",
  },
  {
    id: 205,
    slug: "khe-uoc-ban-dau",
    title: "KHẾ ƯỚC BÁN DÂU",
    poster: "/assets/images/khe-uoc-ban-dau.jpg",
    genres: ["Kinh dị", "Tâm lý", "Gia đình"],
    genre: "Kinh dị, Tâm lý, Gia đình",
    country: "Việt Nam",
    director: "Lê Hoàng Nam",
    duration: 108,
    rating: "T18",
    ratingClass: "t18",
    status: "now-showing",
    statusOrder: 0,
    catalogOrder: 2,
    release: "12/09/2025",
    times: ["10:20", "13:30", "16:40", "19:50", "22:15"],
    description: "Khế Ước Bán Dâu xoay quanh một lời hứa cũ trong gia tộc, kéo nhân vật chính vào chuỗi bí mật u ám giữa hôn nhân, nghi lễ và những món nợ không thể gọi tên.",
  },
  {
    id: 206,
    slug: "cai-ma-2025",
    title: "CẢI MẢ",
    poster: "/assets/images/cai-ma-2025.jpg",
    genres: ["Kinh dị", "Dân gian", "Bí ẩn"],
    genre: "Kinh dị, Dân gian, Bí ẩn",
    country: "Việt Nam",
    director: "Trần Hữu Tấn",
    duration: 112,
    rating: "T18",
    ratingClass: "t18",
    status: "now-showing",
    statusOrder: 0,
    catalogOrder: 3,
    release: "31/10/2025",
    times: ["09:50", "12:45", "15:35", "18:35", "21:30"],
    description: "Cải Mả đưa người xem trở lại một vùng quê nơi nghi thức tâm linh và những bí mật bị chôn vùi dần trỗi dậy sau một biến cố gia đình.",
  },
  {
    id: 207,
    slug: "bay-tien",
    title: "BẢY TIỀN",
    poster: "/assets/images/bay-tien.jpg",
    genres: ["Hài", "Tâm lý", "Đời sống"],
    genre: "Hài, Tâm lý, Đời sống",
    country: "Việt Nam",
    director: "Vũ Ngọc Đãng",
    duration: 105,
    rating: "T16",
    ratingClass: "t16",
    status: "now-showing",
    statusOrder: 0,
    catalogOrder: 4,
    release: "21/11/2025",
    times: ["08:45", "11:20", "14:05", "17:15", "20:25"],
    description: "Bảy Tiền kể câu chuyện đời thường bằng nhịp phim dí dỏm, xoay quanh những lựa chọn tưởng nhỏ nhưng làm thay đổi cách các nhân vật nhìn về gia đình và giá trị của đồng tiền.",
  },
];

const getMovieDuplicateKeys = (movie = {}) =>
  [movie.slug, movie.title, movie.poster]
    .map((value) => normalizeText(value || "").trim())
    .filter(Boolean);

const mergeRequestedMovies = (movies = []) => {
  const movieKeys = new Set(movies.flatMap(getMovieDuplicateKeys));
  const missingMovies = requestedMovies.filter((movie) => {
    const duplicateKeys = getMovieDuplicateKeys(movie);
    return !duplicateKeys.some((key) => movieKeys.has(key));
  });

  const mergedMovies = [...missingMovies, ...movies].reduce((uniqueMovies, movie) => {
    const duplicateKeys = getMovieDuplicateKeys(movie);
    const duplicateMovie = uniqueMovies.some(
      (currentMovie) => duplicateKeys.some((key) => getMovieDuplicateKeys(currentMovie).includes(key))
    );

    if (!duplicateMovie) {
      uniqueMovies.push(movie);
    }

    return uniqueMovies;
  }, []);

  return mergedMovies.sort(
    (firstMovie, secondMovie) =>
      (firstMovie.statusOrder ?? 0) - (secondMovie.statusOrder ?? 0) ||
      (firstMovie.catalogOrder ?? 999) - (secondMovie.catalogOrder ?? 999) ||
      firstMovie.id - secondMovie.id
  );
};

const preloadImage = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve("");
      return;
    }

    const image = new Image();

    image.onload = () => {
      const isUsableImage = image.naturalWidth >= 320 && image.naturalHeight >= 180;
      resolve(isUsableImage ? src : "");
    };

    image.onerror = () => resolve("");
    image.src = src;
  });

const resolveHeroArtwork = async (movie) => {
  if (String(movie?.poster || "").startsWith("/assets/")) {
    return movie.poster;
  }

  const thumbnailCandidates = getYoutubeThumbnailCandidates(movie?.trailer);

  for (const candidate of thumbnailCandidates) {
    // Use the sharpest available YouTube artwork before falling back to the poster.
    const resolvedThumbnail = await preloadImage(candidate);

    if (resolvedThumbnail) {
      return resolvedThumbnail;
    }
  }

  return movie?.poster || "";
};

const HomeMoviePreviewCard = ({ movie, tab }) => (
  <Link to={`/movie/${movie.id}?tab=${tab}`} className="home-preview-card">
    <div
      className="home-preview-card__poster"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10, 10, 18, 0.1), rgba(10, 10, 18, 0.82)), url("${toBackgroundUrl(
          movie.poster
        )}")`,
      }}
    >
      <span className="home-preview-card__status">{tab === "soon" ? "Sắp chiếu" : "Đang chiếu"}</span>
      <span className={`home-preview-card__rating ${movie.ratingClass}`}>{movie.rating}</span>
    </div>

    <div className="home-preview-card__body">
      <h3>{movie.title}</h3>
      <p>{movie.genre}</p>
      <div className="home-preview-card__meta">
        <span>{movie.duration} phút</span>
        <span>{movie.release}</span>
      </div>
    </div>
  </Link>
);

const HomeNowShowcaseCard = ({ movie }) => (
  <article className="home-now-card">
    <img src={toBackgroundUrl(movie.poster)} alt={movie.title} className="home-now-card__poster" />
    <div className="home-now-card__overlay">
      <span className={`home-preview-card__rating ${movie.ratingClass}`}>{movie.rating}</span>
      <h3>{movie.title}</h3>
      <p>{shortenText(movie.description || movie.genre, 112)}</p>
      <div className="home-now-card__actions">
        <Link to={`/booking?movieId=${movie.id}`} className="home-solid-link">
          Đặt vé
        </Link>
        <Link to={`/movie/${movie.id}?tab=now`} className="home-ghost-link">
          Xem thêm
        </Link>
      </div>
    </div>
  </article>
);

const HomeSoonShowcaseCard = ({ movie, index }) => (
  <Link to={`/movie/${movie.id}?tab=soon`} className="home-soon-card" style={{ "--delay": `${index * 110}ms` }}>
    <div
      className="home-soon-card__poster"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(7, 8, 14, 0.1), rgba(7, 8, 14, 0.78)), url("${toBackgroundUrl(
          movie.poster
        )}")`,
      }}
    />
    <div className="home-soon-card__body">
      <span className="home-soon-card__date">{movie.release}</span>
      <h3>{movie.title}</h3>
      <p>{movie.genre}</p>
      <div className="home-soon-card__meta">
        <span>{movie.rating}</span>
        <span>{movie.duration} phút</span>
      </div>
    </div>
  </Link>
);

const HomePageSkeleton = () => (
  <main className="homepage-wrapper homepage-shell homepage-shell--state">
    <section className="home-hero home-hero--skeleton" aria-hidden="true">
      <div className="home-skeleton-line home-skeleton-line--eyebrow"></div>
      <div className="home-skeleton-line home-skeleton-line--title"></div>
      <div className="home-skeleton-line home-skeleton-line--title home-skeleton-line--short"></div>
      <div className="home-skeleton-line home-skeleton-line--body"></div>
      <div className="home-skeleton-line home-skeleton-line--body home-skeleton-line--short"></div>
    </section>

    <section className="home-hero-stats" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="home-stat-card home-stat-card--skeleton">
          <div className="home-skeleton-line home-skeleton-line--stat"></div>
          <div className="home-skeleton-line home-skeleton-line--meta"></div>
        </div>
      ))}
    </section>

    <section className="home-preview-grid" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="home-preview-card home-preview-card--skeleton">
          <div className="home-preview-card__poster home-preview-card__poster--skeleton"></div>
          <div className="home-preview-card__body">
            <div className="home-skeleton-line home-skeleton-line--card-title"></div>
            <div className="home-skeleton-line home-skeleton-line--meta"></div>
            <div className="home-skeleton-line home-skeleton-line--meta home-skeleton-line--short"></div>
          </div>
        </div>
      ))}
    </section>
  </main>
);

const HomePage = ({ searchQuery = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [heroArtworkMap, setHeroArtworkMap] = useState({});
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async (silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
        }
        setErrorMessage("");

        const data = await getMovies();

        if (isMounted) {
          setMovies(mergeRequestedMovies(data));
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Không thể tải danh sách phim từ server.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovies();
    const movieRefreshId = window.setInterval(() => fetchMovies(true), 30000);

    return () => {
      isMounted = false;
      window.clearInterval(movieRefreshId);
    };
  }, []);

  const normalizedQuery = normalizeText(searchQuery.trim());

  const nowShowingMovies = useMemo(
    () => movies.filter((movie) => movie.status === "now-showing"),
    [movies]
  );
  const comingSoonMovies = useMemo(
    () => movies.filter((movie) => movie.status === "coming-soon"),
    [movies]
  );

  const heroMovies = useMemo(() => {
    const source = nowShowingMovies.length > 0 ? nowShowingMovies : comingSoonMovies;
    const prioritizedHeroMovies = source
      .filter((movie) => Number.isFinite(movie.heroOrder))
      .sort((firstMovie, secondMovie) => firstMovie.heroOrder - secondMovie.heroOrder);

    if (prioritizedHeroMovies.length === 0) {
      return source.slice(0, 5);
    }

    const remainingMovies = source.filter(
      (movie) => !prioritizedHeroMovies.some((heroMovie) => heroMovie.id === movie.id)
    );

    return [...prioritizedHeroMovies, ...remainingMovies].slice(0, 5);
  }, [nowShowingMovies, comingSoonMovies]);

  useEffect(() => {
    let isMounted = true;

    const preloadHeroArtworks = async () => {
      const artworkEntries = await Promise.all(
        heroMovies.map(async (movie) => [movie.id, await resolveHeroArtwork(movie)])
      );

      if (!isMounted) {
        return;
      }

      setHeroArtworkMap((currentMap) => {
        const nextMap = { ...currentMap };

        artworkEntries.forEach(([movieId, artworkUrl]) => {
          nextMap[movieId] = artworkUrl;
        });

        return nextMap;
      });
    };

    if (heroMovies.length > 0) {
      preloadHeroArtworks();
    }

    return () => {
      isMounted = false;
    };
  }, [heroMovies]);

  useEffect(() => {
    setActiveHeroIndex((currentIndex) => {
      if (heroMovies.length === 0) {
        return 0;
      }

      return Math.min(currentIndex, heroMovies.length - 1);
    });
  }, [heroMovies.length]);

  useEffect(() => {
    if (heroMovies.length <= 1) {
      return undefined;
    }

    const slideTimer = window.setTimeout(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroMovies.length);
    }, 6000);

    return () => {
      window.clearTimeout(slideTimer);
    };
  }, [activeHeroIndex, heroMovies.length]);

  useEffect(() => {
    if (isLoading) {
      return undefined;
    }

    const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

    let scrollTimer = null;

    const checkRevealOnScrollEnd = () => {
      revealItems.forEach((item) => {
        if (item.classList.contains("is-visible")) return;

        const rect = item.getBoundingClientRect();
        const revealOffset = window.innerHeight * 0.85;
        const fullyVisible = rect.top <= revealOffset && rect.bottom >= 0;

        if (fullyVisible) {
          item.classList.add("is-visible");
        }
      });
    };

    const onScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        checkRevealOnScrollEnd();
      }, 45);
    };

    // initial check in case some items are already fully visible
    window.setTimeout(checkRevealOnScrollEnd, 20);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isLoading, tabParam]);

  const matchedMovies = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return [];
    }

    return movies.filter((movie) => normalizeText(movie.title).includes(normalizedQuery));
  }, [movies, normalizedQuery]);

  const topGenres = useMemo(() => {
    const genres = movies.flatMap((movie) => movie.genres || []);
    return countByValue(genres).slice(0, 6);
  }, [movies]);

  const topCountries = useMemo(() => {
    const countries = movies.map((movie) => movie.country).filter(Boolean);
    return countByValue(countries).slice(0, 4);
  }, [movies]);

  const featuredMovie = heroMovies[activeHeroIndex] || nowShowingMovies[0] || comingSoonMovies[0] || null;
  const heroSlides =
    heroMovies.length > 0
      ? heroMovies
      : featuredMovie
        ? [featuredMovie]
        : [];
  const previewNowMovies = nowShowingMovies.slice(0, 6);
  const posterShowcaseMovies = previewNowMovies.slice(0, 3);
  const previewSoonMovies = [...comingSoonMovies].reverse();
  const catalogMovies = tabParam === "soon" ? comingSoonMovies : nowShowingMovies;
  const catalogFilmMovies =
    catalogMovies.length > 0 ? [...catalogMovies].reverse().filter((movie) => movie.poster) : requestedMovies;
  const catalogFilmLoopMovies = Array.from({ length: 4 }).flatMap(() => catalogFilmMovies);
  const filteredCatalogMovies =
    normalizedQuery.length === 0
      ? catalogMovies
      : catalogMovies.filter((movie) =>
          normalizeText(movie.title).includes(normalizedQuery)
        );
  const catalogPageCount = Math.max(1, Math.ceil(filteredCatalogMovies.length / MOVIES_PER_PAGE));
  const safeCatalogPage = Math.min(catalogPage, catalogPageCount);
  const paginatedCatalogMovies = filteredCatalogMovies.slice(
    (safeCatalogPage - 1) * MOVIES_PER_PAGE,
    safeCatalogPage * MOVIES_PER_PAGE
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [tabParam, normalizedQuery]);

  const handleCatalogPageChange = (nextPage) => {
    setCatalogPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const overviewCards = [
    {
      label: "PHIM ĐANG CHIẾU",
      title: `${nowShowingMovies.length} phim đang mở bán`,
      description: "Xem nhanh các suất chiếu nổi bật và truy cập danh sách phim đang hoạt động trong ngày.",
      meta: "Lấy trực tiếp từ tab lịch chiếu hiện tại",
      to: "/?tab=now",
      cta: "Xem lịch chiếu",
    },
    {
      label: "PHIM SẮP CHIẾU",
      title: `${comingSoonMovies.length} phim chuẩn bị ra mắt`,
      description: "Theo dõi các tựa phim sẽ lên rạp để chuẩn bị kế hoạch đặt vé sớm.",
      meta: "Phù hợp để preview chiến dịch truyền thông",
      to: "/?tab=soon",
      cta: "Xem phim sắp chiếu",
    },
    {
      label: "LỌC PHIM",
      title: `${topGenres.length} nhóm thể loại nổi bật`,
      description: "Đi tới bộ lọc để phân loại theo thể loại, quốc gia và độ tuổi phù hợp.",
      meta: "Tóm tắt từ trang lọc phim",
      to: "/filter",
      cta: "Mở bộ lọc",
    },
    {
      label: "GIỚI THIỆU",
      title: "Định hướng của CineSky",
      description: "Nêu nhanh mục tiêu xây dựng trải nghiệm xem phim hiện đại, trực quan và dễ dùng.",
      meta: "Rút gọn từ trang giới thiệu",
      to: "/about",
      cta: "Tìm hiểu thêm",
    },
    {
      label: "GÓP Ý",
      title: "Kênh tiếp nhận phản hồi",
      description: "Mời người dùng để lại đánh giá trải nghiệm để nhóm cải thiện giao diện và dịch vụ.",
      meta: "Liên kết tới biểu mẫu góp ý",
      to: "/feedback",
      cta: "Gửi góp ý",
    },
  ];

  const featuredMovieTab = featuredMovie?.status === "coming-soon" ? "soon" : "now";
  const heroReleaseYear = extractReleaseYear(featuredMovie?.release || "");
  const heroIsComingSoon = featuredMovie?.status === "coming-soon";
  const faqMascotRef = useRef(null);

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
    let replayTimer = 0;
    let playAttempts = 0;

    const playMascot = () => {
      const player = faqMascotRef.current;

      if (player?.play) {
        player.loop = true;
        player.autoplay = true;
        player.play();
      }
    };

    if (window.customElements?.whenDefined) {
      window.customElements.whenDefined("lottie-player").then(playMascot);
    }

    replayTimer = window.setInterval(() => {
      playAttempts += 1;
      playMascot();

      if (playAttempts >= 10) {
        window.clearInterval(replayTimer);
      }
    }, 500);

    return () => window.clearInterval(replayTimer);
  }, []);

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  if (errorMessage) {
    return (
      <main className="homepage-wrapper homepage-shell homepage-shell--state">
        <div className="home-empty-state">{errorMessage}</div>
      </main>
    );
  }

  if (tabParam === "now" || tabParam === "soon") {
    const isComingSoonTab = tabParam === "soon";

    return (
      <main className="homepage-wrapper homepage-shell homepage-shell--catalog">
        <div className="cinematic-film-bg" aria-hidden="true">
          <div className="cinematic-film-bg__strip">
            <div className="cinematic-film-bg__track">
              {[...catalogFilmLoopMovies, ...catalogFilmLoopMovies].map((movie, index) => (
                <span className="cinematic-film-bg__frame" key={`${movie.id}-${index}`}>
                  <img src={toBackgroundUrl(movie.poster)} alt="" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="home-catalog-hero">
          <div className="home-catalog-hero__content">
            <span className="home-kicker">
              {isComingSoonTab ? "Bộ sưu tập phim sắp ra mắt" : "Danh sách phim đang mở bán"}
            </span>
            <h1>{isComingSoonTab ? "Phim sắp chiếu" : "Phim đang chiếu"}</h1>
            <p>
              {isComingSoonTab
                ? "Theo dõi các tựa phim chuẩn bị lên rạp, xem trước thời điểm phát hành và trailer nổi bật."
                : "Khám phá nhanh các phim đang hoạt động trên hệ thống, lịch chiếu hiện có và nút đặt vé trực tiếp."}
            </p>

            <div className="home-catalog-hero__stats">
              <div>
                <strong>{catalogMovies.length}</strong>
                <span>phim</span>
              </div>
              <div>
                <strong>{topGenres.length}</strong>
                <span>thể loại nổi bật</span>
              </div>
              <div>
                <strong>{topCountries.length}</strong>
                <span>quốc gia</span>
              </div>
            </div>
          </div>

          <div className="home-catalog-hero__links">
            <Link to="/" className="home-ghost-link">
              Về trang chủ tổng quan
            </Link>
            <Link to={isComingSoonTab ? "/?tab=now" : "/?tab=soon"} className="home-solid-link">
              {isComingSoonTab ? "Xem phim đang chiếu" : "Xem phim sắp chiếu"}
            </Link>
          </div>
        </section>

        {normalizedQuery.length > 0 ? (
          <div className="home-search-banner">
            Kết quả trong tab này cho từ khóa: <strong>{searchQuery.trim()}</strong>
          </div>
        ) : null}

        <div className={`movie-grid-container movie-grid-container--${isComingSoonTab ? "soon" : "now"}`}>
          {filteredCatalogMovies.length > 0 ? (
            paginatedCatalogMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
          ) : (
            <div className="home-empty-state">Không tìm thấy phim phù hợp.</div>
          )}
        </div>

        {filteredCatalogMovies.length > MOVIES_PER_PAGE ? (
          <nav className="movie-pagination" aria-label="Movie pages">
            <button
              type="button"
              onClick={() => handleCatalogPageChange(Math.max(1, safeCatalogPage - 1))}
              disabled={safeCatalogPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: catalogPageCount }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={page === safeCatalogPage ? "is-active" : ""}
                onClick={() => handleCatalogPageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleCatalogPageChange(Math.min(catalogPageCount, safeCatalogPage + 1))}
              disabled={safeCatalogPage === catalogPageCount}
            >
              &gt;
            </button>
          </nav>
        ) : null}
      </main>
    );
  }

  return (
    <main className="homepage-wrapper homepage-shell homepage-shell--hero">
      <div className="home-cinematic-backdrop" aria-hidden="true">
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

      {featuredMovie ? (
        <section className="home-hero">
          <div className="home-hero__slides" aria-hidden="true">
            {heroSlides.map((movie, index) => {
              const slideArtwork = heroArtworkMap[movie.id] || movie.poster;
              const isActiveSlide = index === activeHeroIndex;

              return (
                <div
                  key={movie.id}
                  className={isActiveSlide ? "home-hero__slide active" : "home-hero__slide"}
                >
                  <img
                    src={toBackgroundUrl(slideArtwork)}
                    alt=""
                    className="home-hero__image"
                    loading={isActiveSlide ? "eager" : "lazy"}
                    fetchPriority={isActiveSlide ? "high" : "auto"}
                  />
                </div>
              );
            })}
          </div>

          <div className="home-hero__content">
            <div key={featuredMovie.id} className="home-hero__content-panel">
            <span className="home-kicker">Trang chủ CineSky</span>
            <span className="home-hero__year">{heroReleaseYear}</span>
            <h1 className="home-hero__title">{featuredMovie.title}</h1>

            <div className="home-hero__meta">
              <span>{featuredMovie.duration} phút</span>
              <span>{featuredMovie.genre}</span>
              <span>{featuredMovie.country}</span>
            </div>

            <p className="home-hero__description">
              {shortenText(
                featuredMovie.description ||
                  "Khám phá phim nổi bật, xem lịch chiếu nhanh và truy cập toàn bộ hệ thống nội dung của CineSky."
              )}
            </p>

            <div className="home-hero__actions">
              {!heroIsComingSoon ? (
                <button
                  type="button"
                  className="home-solid-link home-button-link"
                  onClick={() => navigate(`/booking?movieId=${featuredMovie.id}`)}
                >
                  Đặt vé ngay
                </button>
              ) : (
                <Link to="/?tab=soon" className="home-solid-link">
                  Xem phim sắp chiếu
                </Link>
              )}

              <Link to={`/movie/${featuredMovie.id}?tab=${featuredMovieTab}#trailer`} className="home-ghost-link">
                Xem trailer
              </Link>
              <Link to={`/movie/${featuredMovie.id}?tab=${featuredMovieTab}`} className="home-ghost-link home-ghost-link--accent">
                Xem chi tiết
              </Link>
            </div>
          </div>
          </div>

          <div className="home-hero__footer">
            {heroMovies.length > 1 ? (
              <div className="home-hero__dots" aria-label="Featured movies">
                {heroMovies.map((movie, index) => (
                  <button
                    key={movie.id}
                    type="button"
                    className={index === activeHeroIndex ? "home-hero__dot active" : "home-hero__dot"}
                    onClick={() => setActiveHeroIndex(index)}
                    aria-label={`Chọn phim ${movie.title}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="home-hero-stats" aria-label="Movie statistics">
        <div className="home-stat-card">
          <CountUpNumber value={movies.length} />
          <span>Tổng số phim trong dữ liệu</span>
        </div>
        <div className="home-stat-card">
          <CountUpNumber value={nowShowingMovies.length} />
          <span>Tựa phim đang có lịch chiếu</span>
        </div>
        <div className="home-stat-card">
          <CountUpNumber value={comingSoonMovies.length} />
          <span>Tựa phim sắp ra mắt</span>
        </div>
      </section>

      {normalizedQuery.length > 0 ? (
        <section className="home-section">
          <div className="home-section__header">
            <div>
              <span className="home-kicker">Kết quả tìm kiếm</span>
              <h2>Tìm thấy {matchedMovies.length} phim phù hợp với từ khóa của bạn</h2>
            </div>
          </div>

          {matchedMovies.length > 0 ? (
            <div className="home-preview-grid">
              {matchedMovies.slice(0, 6).map((movie) => (
                <HomeMoviePreviewCard
                  key={movie.id}
                  movie={movie}
                  tab={movie.status === "coming-soon" ? "soon" : "now"}
                />
              ))}
            </div>
          ) : (
            <div className="home-empty-state">
              <span className="home-kicker">Chưa có kết quả phù hợp</span>
              <h3>Không tìm thấy phim nào khớp với từ khóa bạn đang nhập.</h3>
              <p>Thử đổi tên phim, thể loại hoặc quay lại danh sách đang chiếu để khám phá thêm nhé.</p>
              <div className="home-empty-state__actions">
                <Link to="/?tab=now" className="home-solid-link">
                  Xem phim đang chiếu
                </Link>
                <Link to="/filter" className="home-ghost-link">
                  Đi tới bộ lọc
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <section className="home-section" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Tổng quan</h2>
          </div>
        </div>

        <div className="home-overview-grid">
          {overviewCards.map((card) => (
            <Link key={card.label} to={card.to} className="home-overview-card">
              <span className="home-overview-card__label">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <small>{card.meta}</small>
              <span className="home-overview-card__cta">{card.cta}</span>
            </Link>
          ))}
        </div>
      </section>

      {posterShowcaseMovies.length > 0 ? (
        <section className="home-poster-feature" data-reveal>
          <div className="home-poster-feature__art" aria-label="Poster phim nổi bật">
            {posterShowcaseMovies.map((movie, index) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}?tab=now`}
                className="home-poster-feature__slice"
                style={{ "--slice-index": index }}
              >
                <img src={toBackgroundUrl(movie.poster)} alt={movie.title} />
              </Link>
            ))}
          </div>

          <div className="home-poster-feature__content">
            <span className="home-kicker">Phim nổi bật</span>
            <h2>Những bộ phim đáng chú ý đang chờ bạn chọn suất.</h2>
            <p>
              Khám phá nhanh các tựa phim nổi bật tại CineSky, từ poster, trailer đến thông tin cơ bản. Khi đã tìm được bộ phim hợp mood hôm nay, bạn có thể chuyển tiếp đến chi tiết phim hoặc đặt vé trong vài thao tác.
            </p>

            <div className="home-poster-feature__actions">
              <Link to="/?tab=now" className="home-solid-link">
                Xem phim đang chiếu
              </Link>
              <Link to="/filter" className="home-ghost-link">
                Khám phá tất cả phim
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-section" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Phim đang chiếu</h2>
          </div>
          <Link to="/?tab=now" className="home-inline-link">
            Mở toàn bộ danh sách
          </Link>
        </div>

        <div className="home-now-showcase" aria-label="Phim đang chiếu nổi bật">
          {previewNowMovies.map((movie) => (
            <HomeNowShowcaseCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="home-section" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Phim sắp chiếu</h2>
          </div>
          <Link to="/?tab=soon" className="home-inline-link">
            Xem lịch sắp chiếu
          </Link>
        </div>

        <div className="home-soon-stack" aria-label="Phim sắp chiếu nổi bật">
          {[...previewSoonMovies, ...previewSoonMovies].map((movie, index) => (
            <HomeSoonShowcaseCard key={`${movie.id}-${index}`} movie={movie} index={index} />
          ))}
        </div>
      </section>
      <section className="home-section home-membership-section" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Các hạng thành viên</h2>
          </div>
          <Link to="/history" className="home-inline-link">
            Xem hạng của tôi
          </Link>
        </div>

        <div className="home-membership-promo">
          <div className="home-membership-promo__copy">
            <span className="home-kicker">CineSky Rewards</span>
            <div className="home-membership-copy-stack">
              <div className="home-membership-copy-panel home-membership-copy-panel--default">
                <h3>Tích điểm sau mỗi vé, mở khóa ưu đãi theo hạng.</h3>
                <p>100 điểm cho mỗi vé thành công. Điểm tự cập nhật trong lịch sử đặt vé.</p>
              </div>
              <div className="home-membership-copy-panel home-membership-copy-panel--member">
                <h3>Member</h3>
                <p>Bắt đầu từ 0 điểm. Mỗi vé thành công cộng 100 điểm vào tài khoản.</p>
              </div>
              <div className="home-membership-copy-panel home-membership-copy-panel--silver">
                <h3>Silver</h3>
                <p>Đạt 500 điểm để lên Silver và mở khóa các ưu đãi cơ bản.</p>
              </div>
              <div className="home-membership-copy-panel home-membership-copy-panel--gold">
                <h3>Gold</h3>
                <p>Đạt 1.500 điểm để lên Gold, dành cho khách đặt vé thường xuyên.</p>
              </div>
              <div className="home-membership-copy-panel home-membership-copy-panel--diamond">
                <h3>Diamond</h3>
                <p>Đạt 3.000 điểm để lên Diamond, hạng cao nhất của CineSky Rewards.</p>
              </div>
            </div>
          </div>

          <div className="home-membership-promo__tiers" aria-label="Các hạng thành viên">
            {["Member", "Silver", "Gold", "Diamond"].map((tier, index) => (
              <article key={tier} className={`home-membership-tier home-membership-tier--${tier.toLowerCase()}`}>
                <div className="home-membership-tier__shine"></div>
                <div className="home-membership-tier__top">
                  <span>CineSky</span>
                  <small>{tier}</small>
                </div>
                <div className="home-membership-tier__chip" aria-hidden="true"></div>
                <div className="home-membership-tier__body">
                  <strong>{[0, 500, 1500, 3000][index].toLocaleString("vi-VN")}+</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--insights">
        <div className="home-section__header">
          <div>
            <h2>Khám phá CineSky</h2>
          </div>
        </div>

        <div className="home-insight-grid" data-reveal>
        <article className="home-insight-card">
          <span className="home-kicker">Giới thiệu</span>
          <h2>CineSky hướng tới trải nghiệm xem phim hiện đại và dễ tiếp cận</h2>
          <p>
            Phần này rút gọn tinh thần từ trang Giới thiệu: tập trung vào trải nghiệm điện ảnh chân thực, giao diện rõ ràng
            và hành trình đặt vé đơn giản cho người dùng trẻ.
          </p>
          <Link to="/about" className="home-inline-link">
            Xem trang giới thiệu
          </Link>
        </article>

        <article className="home-insight-card">
          <span className="home-kicker">Lọc phim</span>
          <h2>Thể loại và quốc gia đang xuất hiện nhiều trong dữ liệu</h2>
          <div className="home-chip-group">
            {topGenres.map((genre) => (
              <span key={genre.label} className="home-chip">
                {genre.label} · {genre.count}
              </span>
            ))}
          </div>
          <div className="home-chip-group">
            {topCountries.map((country) => (
              <span key={country.label} className="home-chip home-chip--muted">
                {country.label} · {country.count}
              </span>
            ))}
          </div>
          <Link to="/filter" className="home-inline-link">
            Đi tới trang lọc phim
          </Link>
        </article>

        <article className="home-insight-card home-insight-card--accent">
          <span className="home-kicker">Góp ý</span>
          <h2>Phản hồi của người dùng là phần không thể thiếu trong bài</h2>
          <p>
            Trang Góp ý được tóm tắt tại đây như một điểm chạm cuối của luồng trải nghiệm: sau khi xem thông tin, người dùng
            có thể gửi nhận xét để nhóm cải thiện giao diện và dịch vụ.
          </p>
          <Link to="/feedback" className="home-solid-link">
            Mở biểu mẫu góp ý
          </Link>
        </article>
        </div>
      </section>

      <section className="home-section home-section--partners" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Công nghệ & Đối tác</h2>
          </div>
        </div>

        <div className="home-partner-grid">
          {partnerItems.map((item) => (
            <article key={item.name} className="home-partner-card">
              <strong>{item.name}</strong>
              <span>{item.type}</span>
            </article>
          ))}
        </div>

        <div className="home-tech-panel">
          {techShowcase.map((item) => (
            <span key={item} className="home-tech-badge">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="home-section home-section--faq" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Câu hỏi thường gặp</h2>
          </div>
          <p>
            Phần FAQ được đặt gần cuối trang để người xem có thể xem nhanh các câu trả lời quan trọng mà không làm đứt luồng
            khám phá phim ở phía trên.
          </p>
        </div>

        <div className="home-faq-mascot" aria-hidden="true">
          <lottie-player
            ref={faqMascotRef}
            src="/assets/lottie/loader-cat.json"
            background="transparent"
            speed="1"
            loop
            autoplay
          ></lottie-player>
        </div>

        <div className="home-faq-grid">
          {[0, 1].map((columnIndex) => (
            <div key={columnIndex} className="home-faq-column">
              {faqItems
                .map((item, index) => ({ item, index }))
                .filter(({ index }) => index % 2 === columnIndex)
                .map(({ item, index }) => {
                  const isActive = activeFaqIndex === index;

                  return (
                    <article
                      key={item.question}
                      className={"home-faq-card" + (isActive ? " is-active" : "")}
                    >
                      <button
                        type="button"
                        className="home-faq-card__button"
                        onClick={() =>
                          setActiveFaqIndex((currentIndex) => (currentIndex === index ? -1 : index))
                        }
                        aria-expanded={isActive}
                      >
                        <span>{item.question}</span>
                        <span className="home-faq-card__icon" aria-hidden="true">
                          {isActive ? "−" : "+"}
                        </span>
                      </button>

                      <p className="home-faq-card__answer">{item.answer}</p>
                    </article>
                  );
                })}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
