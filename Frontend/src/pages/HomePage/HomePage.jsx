import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import "./HomePage.css";

import DynamicLottie from '../../components/DynamicLottie/DynamicLottie.jsx';
import SPOTLIGHT_MOVIES from '../../data/spotlightMovies.js';

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

const getRatingClass = (movie = {}) => {
  const rating = String(movie.rating || "").toLowerCase();

  return movie.ratingClass || (rating === "p" ? "p-rating" : rating ? `${rating}-rating` : "");
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

const homeEditorialItems = [
  {
    type: "Tin tức",
    title: "Phim mới đáng chú ý trong tuần",
    text: "Cập nhật nhanh trailer, lịch mở bán và những tựa phim đang được quan tâm.",
    image: "/assets/images/dai-tiec-trang-mau.jpg",
    to: "/news",
  },
  {
    type: "Review nhanh",
    title: "Gợi ý chọn phim trước khi đặt vé",
    text: "Xem thể loại, độ tuổi, thời lượng và không khí rạp phù hợp với buổi đi xem.",
    image: "/assets/images/running-man.jpg",
    to: "/news",
  },
  {
    type: "Ưu đãi",
    title: "Voucher đặt vé online",
    text: "Săn ưu đãi theo hạng thành viên và giảm giá cho hóa đơn vé kèm combo.",
    image: "/assets/images/song-hy-lam-nguy.jpg",
    to: "/promotions",
  },
  {
    type: "Combo",
    title: "Bắp nước cho nhóm bạn",
    text: "Các gói combo tiết kiệm cho cặp đôi, gia đình và suất chiếu cuối tuần.",
    image: "/assets/images/mui-pho.webp",
    to: "/promotions",
  },
];

const cinematicParticles = [
  [3, 8, 1], [7, 31, 1.4], [11, 63, 1], [14, 17, 2], [19, 82, 1.2],
  [23, 44, 1], [28, 12, 1.6], [31, 71, 1], [36, 29, 1.3], [41, 91, 1.8],
  [45, 53, 1], [49, 22, 1.5], [53, 77, 1], [58, 36, 2], [63, 14, 1],
  [67, 67, 1.4], [72, 48, 1], [76, 9, 1.7], [81, 86, 1.2], [86, 27, 1],
  [91, 58, 1.6], [96, 74, 1], [5, 91, 1.3], [16, 48, 1], [26, 57, 1.7],
  [39, 6, 1], [52, 9, 1.2], [61, 88, 1.5], [74, 73, 1], [88, 12, 2],
].map(([left, top, size], index) => ({
  id: index,
  left: `${left}%`,
  top: `${top}%`,
  size: `${size}px`,
  delay: `${(index % 10) * -0.63}s`,
  duration: `${9 + (index % 7)}s`,
}));

const requestedMovies = SPOTLIGHT_MOVIES.map(movie => ({
  id: movie.id,
  slug: movie.slug,
  title: movie.title,
  poster: `/assets/images/${movie.slug}.jpg`,
  genres: ["Tâm lý", "Kịch tính"],
  genre: "Tâm lý, Kịch tính",
  country: "Việt Nam",
  director: "CineSky Director",
  duration: 120,
  rating: "T16",
  ratingClass: "t16",
  status: "now-showing",
  statusOrder: 0,
  catalogOrder: 99,
  release: "2026",
  times: ["09:00", "12:00", "15:00", "18:00", "21:00"],
  description: `Bộ phim truyền cảm hứng ${movie.title} hứa hẹn mang lại những cung bậc cảm xúc điện ảnh tuyệt vời nhất tại CineSky.`
}));

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
  if (movie?.poster) {
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
      <span className={`home-preview-card__rating ${getRatingClass(movie)}`}>{movie.rating}</span>
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
      <span className={`home-preview-card__rating ${getRatingClass(movie)}`}>{movie.rating}</span>
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
        <span className={`home-soon-card__rating ${getRatingClass(movie)}`}>{movie.rating}</span>
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
  const [activeOverviewIdx, setActiveOverviewIdx] = useState(0);

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
      to: "/?tab=now",
      cta: "Xem lịch chiếu",
      image: "/assets/images/Golden_Dragon_Sovereign.png",
      imagePos: "48% 28%",
    },
    {
      label: "PHIM SẮP CHIẾU",
      title: `${comingSoonMovies.length} phim chuẩn bị ra mắt`,
      description: "Theo dõi các tựa phim sẽ lên rạp để chuẩn bị kế hoạch đặt vé sớm.",
      to: "/?tab=soon",
      cta: "Xem phim sắp chiếu",
      image: "/assets/images/Emerald_Lotus_Goddess.png",
      imagePos: "46% 26%",
    },
    {
      label: "LỌC PHIM",
      title: `${topGenres.length} nhóm thể loại nổi bật`,
      description: "Đi tới bộ lọc để phân loại theo thể loại, quốc gia và độ tuổi phù hợp.",
      to: "/filter",
      cta: "Mở bộ lọc",
      image: "/assets/images/Violet_Moon_Empress.png",
      imagePos: "48% 24%",
    },
    {
      label: "GIỚI THIỆU",
      title: "Định hướng của CineSky",
      description: "Nêu nhanh mục tiêu xây dựng trải nghiệm xem phim hiện đại, trực quan và dễ dùng.",
      to: "/about",
      cta: "Tìm hiểu thêm",
      image: "/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png",
      imagePos: "48% 28%",
    },
    {
      label: "GÓP Ý",
      title: "Kênh tiếp nhận phản hồi",
      description: "Mời người dùng để lại đánh giá trải nghiệm để nhóm cải thiện giao diện và dịch vụ.",
      to: "/feedback",
      cta: "Gửi góp ý",
      image: "/assets/images/Azure_Dragon_Sword_Saint.png",
      imagePos: "48% 22%",
    },
    {
      label: "ƯU ĐÃI",
      title: "Khuyến mãi đang chờ bạn",
      description: "Xem các ưu đãi độc quyền, mã giảm giá và chương trình khuyến mãi theo mùa.",
      to: "/promotions",
      cta: "Xem ưu đãi",
      image: "/assets/images/Moonlit_Celestial_Dancer_PinkBlue_4K_Wallpaper.png",
      imagePos: "50% 24%",
    },
  ];
  const visibleOverviewCards = overviewCards.slice(0, 5);
  const activeOverviewCard = visibleOverviewCards[activeOverviewIdx] || visibleOverviewCards[0];
  const overviewGridCards = overviewCards.slice(0, 6);

  const featuredMovieTab = featuredMovie?.status === "coming-soon" ? "soon" : "now";
  const heroReleaseYear = extractReleaseYear(featuredMovie?.release || "");
  const heroIsComingSoon = featuredMovie?.status === "coming-soon";

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
    const catalogHeroCards = catalogFilmMovies.slice(0, 6);

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

        <section
          className="home-catalog-hero home-catalog-hero--overview"
          style={{ "--catalog-hero-bg": `url("${toBackgroundUrl(catalogHeroCards[0]?.poster || "/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png")}")` }}
        >
          <div className="home-catalog-hero__content home-catalog-hero__content--overview">
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

          <div className="home-catalog-overview-panels" aria-label="Catalog highlights">
            {catalogHeroCards.map((movie, index) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}?tab=${isComingSoonTab ? "soon" : "now"}`}
                className="home-catalog-overview-panel"
                style={{
                  "--panel-y": `${[-24, 20, -18, 24, -14, 18][index] || 0}px`,
                  "--catalog-card-image": `url("${toBackgroundUrl(movie.poster)}")`,
                }}
              >
                <span>{isComingSoonTab ? "Sắp chiếu" : "Đang chiếu"}</span>
                <strong>{movie.title}</strong>
                <small>{movie.genre}</small>
              </Link>
            ))}
          </div>

          <div className="home-catalog-hero__links home-catalog-hero__links--overview">
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
      <div className="home-cinematic-backdrop home-backdrop--video" aria-hidden="true">
        <video className="home-backdrop__video" autoPlay muted loop playsInline>
          <source src="/assets/videos/galaxy%20video2.mp4" type="video/mp4" />
          <source src="/assets/videos/galaxy-video2.mp4" type="video/mp4" />
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

      <section className="home-overview-section" data-reveal>
        <div className="home-overview-section__header">
          <span className="home-kicker">Tổng quan</span>
          <h2>Tổng quan CineSky</h2>
          <p>Trải nghiệm điện ảnh hiện đại — từ lịch chiếu, bộ lọc đến ưu đãi độc quyền</p>
        </div>

        <div className="home-overview-compare-stage">
          <img
            src="/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png"
            alt=""
            className="home-overview-compare-stage__bg"
          />
          <div className="home-overview-compare-stage__wash" aria-hidden="true" />

          <div className="home-overview-compare-copy">
            <span>Tổng quan</span>
            <img
              src="/assets/images/cinesky-wordmark-ai.png"
              alt="CineSky"
              className="home-ai-wordmark"
            />
            <p>
              Một góc nhìn tổng hợp về phim đang chiếu, phim sắp ra mắt,
              bộ lọc nội dung và các trải nghiệm chính của CineSky.
            </p>
            <Link to="/filter" className="home-solid-link">
              Khám phá phim
            </Link>
          </div>

          <div className="home-overview-compare-panels">
            {overviewGridCards.map((card, index) => (
              <Link
                key={card.label}
                to={card.to}
                className="home-overview-compare-panel"
                style={{
                  "--panel-y": `${[-28, 20, -22, 26, -18, 18][index] || 0}px`,
                  "--compare-card-image": `url("${card.image}")`,
                  "--compare-card-pos": card.imagePos || "center",
                }}
              >
                <span>{card.label}</span>
                <strong>{card.title}</strong>
                <small>{card.description}</small>
              </Link>
            ))}
          </div>
        </div>

        <div
          className="home-overview-wrap"
          style={{
            "--overview-panel-count": visibleOverviewCards.length,
            "--overview-panel-image": "url('/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png')",
          }}
        >

          {/* Left: content pane — updates on hover */}
          <div className="home-overview-content-pane">
            <span className="home-overview-content-pane__label">
              {activeOverviewCard.label}
            </span>
            <h3 className="home-overview-content-pane__title">
              {activeOverviewCard.title}
            </h3>
            <p className="home-overview-content-pane__desc">
              {activeOverviewCard.description}
            </p>
            <Link
              to={activeOverviewCard.to}
              className="home-solid-link"
            >
              {activeOverviewCard.cta}
            </Link>
          </div>

          {/* Right: 5 panels sharing one sliced image */}
          <div className="home-overview-panels">
            {visibleOverviewCards.map((card, index) => (
              <button
                key={card.label}
                type="button"
                className={`home-overview-panel${index === activeOverviewIdx ? " is-active" : ""}`}
                style={{
                  "--panel-index": index,
                  "--panel-bg-position": `${(index / Math.max(visibleOverviewCards.length - 1, 1)) * 100}% center`,
                }}
                onMouseEnter={() => setActiveOverviewIdx(index)}
                aria-label={card.label}
              >
                <div className="home-overview-panel__shine" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {posterShowcaseMovies.length > 0 ? (
        <section className="home-section" data-reveal>
          <div className="home-section__header">
            <div>
              <h2>Phim nổi bật</h2>
            </div>
          </div>
          <div className="home-poster-feature">
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

      <section className="home-section home-section--news-brief" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Tin tức mới</h2>
          </div>
          <Link to="/news" className="home-editorial-more">Xem tất cả</Link>
        </div>

        <div className="home-editorial-news-grid">
          {homeEditorialItems.filter((item) => item.to === "/news").map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="home-news-brief-card"
              style={{ "--editorial-image": `url("${toBackgroundUrl(item.image)}")` }}
            >
              <span>{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <strong>Đọc tin</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-section--deals-brief" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Ưu đãi CineSky</h2>
          </div>
          <Link to="/promotions" className="home-editorial-more">Xem tất cả</Link>
        </div>

        <div className="home-deals-brief__panel">
          <div className="home-deals-brief__head">
            <span>Giữ ví nhẹ hơn trước khi vào rạp</span>
          </div>

          <div className="home-deals-brief__rail">
            {homeEditorialItems.filter((item) => item.to === "/promotions").map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="home-deal-ticket"
                style={{ "--editorial-image": `url("${toBackgroundUrl(item.image)}")` }}
              >
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <strong>Xem ưu đãi</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--insights" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Khám phá CineSky</h2>
          </div>
        </div>

        <div className="home-insight-stage">
          <img
            src="/assets/images/Azure_Dragon_Sword_Saint.png"
            alt=""
            className="home-insight-stage__bg"
          />
          <div className="home-insight-stage__bg-overlay" aria-hidden="true" />

          <div className="home-insight-panels">
            <Link
              to="/about"
              className="home-insight-panel"
              style={{ "--panel-index": 0, "--insight-card-image": "url('/assets/images/Golden_Dragon_Sovereign.png')", "--insight-card-pos": "48% 28%" }}
            >
              <span className="home-insight-panel__label">GIỚI THIỆU</span>
              <div className="home-insight-panel__content">
                <h3 className="home-insight-panel__title">Nền tảng điện ảnh hiện đại cho thế hệ trẻ</h3>
                <p className="home-insight-panel__desc">Giao diện trực quan, tốc độ nhanh và hành trình đặt vé mượt mà từ đầu đến cuối.</p>
                <div className="home-insight-panel__tags">
                  <span className="home-insight-tag">UI/UX</span>
                  <span className="home-insight-tag">Điện ảnh</span>
                  <span className="home-insight-tag">Đặt vé</span>
                </div>
                <span className="home-insight-panel__cta">Khám phá ngay →</span>
              </div>
              <div className="home-insight-panel__shine" aria-hidden="true" />
            </Link>

            <Link
              to="/filter"
              className="home-insight-panel"
              style={{ "--panel-index": 1, "--insight-card-image": "url('/assets/images/Emerald_Lotus_Goddess.png')", "--insight-card-pos": "46% 26%" }}
            >
              <span className="home-insight-panel__label">LỌC PHIM</span>
              <div className="home-insight-panel__content">
                <h3 className="home-insight-panel__title">Tìm đúng phim bạn muốn xem</h3>
                <div className="home-insight-panel__stats">
                  <div className="home-insight-stat">
                    <strong>{nowShowingMovies.length}</strong>
                    <span>đang chiếu</span>
                  </div>
                  <div className="home-insight-stat">
                    <strong>{comingSoonMovies.length}</strong>
                    <span>sắp ra mắt</span>
                  </div>
                  <div className="home-insight-stat">
                    <strong>{topGenres.length}</strong>
                    <span>thể loại</span>
                  </div>
                </div>
                <p className="home-insight-panel__desc">Lọc theo thể loại, quốc gia, độ tuổi và suất chiếu — tất cả trong một bước.</p>
                <span className="home-insight-panel__cta">Mở bộ lọc →</span>
              </div>
              <div className="home-insight-panel__shine" aria-hidden="true" />
            </Link>

            <Link
              to="/feedback"
              className="home-insight-panel"
              style={{ "--panel-index": 2, "--insight-card-image": "url('/assets/images/Violet_Moon_Empress.png')", "--insight-card-pos": "48% 24%" }}
            >
              <span className="home-insight-panel__label">GÓP Ý</span>
              <div className="home-insight-panel__content">
                <h3 className="home-insight-panel__title">Tiếng nói của bạn định hình CineSky</h3>
                <p className="home-insight-panel__desc">Mỗi phản hồi giúp chúng tôi cải thiện giao diện, tính năng và trải nghiệm dịch vụ.</p>
                <div className="home-insight-panel__tags">
                  <span className="home-insight-tag home-insight-tag--gold">⭐ Đánh giá</span>
                  <span className="home-insight-tag">Góp ý UI</span>
                  <span className="home-insight-tag">Báo lỗi</span>
                </div>
                <span className="home-insight-panel__cta">Gửi phản hồi →</span>
              </div>
              <div className="home-insight-panel__shine" aria-hidden="true" />
            </Link>

            <Link
              to="/promotions"
              className="home-insight-panel"
              style={{ "--panel-index": 3, "--insight-card-image": "url('/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png')", "--insight-card-pos": "48% 28%" }}
            >
              <span className="home-insight-panel__label">ƯU ĐÃI</span>
              <div className="home-insight-panel__badge">HOT</div>
              <div className="home-insight-panel__content">
                <h3 className="home-insight-panel__title">Ưu đãi độc quyền đang chờ bạn</h3>
                <p className="home-insight-panel__desc">Mã giảm giá, combo bắp nước và chương trình tích điểm đặc biệt dành cho thành viên.</p>
                <span className="home-insight-panel__cta">Xem ưu đãi →</span>
              </div>
              <div className="home-insight-panel__shine" aria-hidden="true" />
            </Link>

            <Link
              to="/?tab=now"
              className="home-insight-panel"
              style={{ "--panel-index": 4, "--insight-card-image": "url('/assets/images/Azure_Dragon_Sword_Saint.png')", "--insight-card-pos": "48% 22%" }}
            >
              <span className="home-insight-panel__label">LỊCH CHIẾU</span>
              <div className="home-insight-panel__content">
                <h3 className="home-insight-panel__title">Cập nhật nhanh các suất chiếu đang mở bán</h3>
                <p className="home-insight-panel__desc">Theo dõi phim đang chiếu, giờ chiếu và đường tắt đặt vé để chọn ghế nhanh hơn.</p>
                <div className="home-insight-panel__tags">
                  <span className="home-insight-tag">{nowShowingMovies.length} phim</span>
                  <span className="home-insight-tag">Đặt vé nhanh</span>
                </div>
                <span className="home-insight-panel__cta">Xem lịch chiếu -&gt;</span>
              </div>
              <div className="home-insight-panel__shine" aria-hidden="true" />
            </Link>

            <Link
              to="/profile"
              className="home-insight-panel"
              style={{ "--panel-index": 5, "--insight-card-image": "url('/assets/images/Moonlit_Celestial_Dancer_PinkBlue_4K_Wallpaper.png')", "--insight-card-pos": "50% 24%" }}
            >
              <span className="home-insight-panel__label">THÀNH VIÊN</span>
              <div className="home-insight-panel__content">
                <h3 className="home-insight-panel__title">Quản lý hành trình xem phim của riêng bạn</h3>
                <p className="home-insight-panel__desc">Lưu thông tin cá nhân, theo dõi vé đã đặt và quay lại các phim yêu thích để tiếp tục khám phá.</p>
                <div className="home-insight-panel__tags">
                  <span className="home-insight-tag home-insight-tag--gold">Hồ sơ</span>
                  <span className="home-insight-tag">Vé của tôi</span>
                </div>
                <span className="home-insight-panel__cta">Mở tài khoản -&gt;</span>
              </div>
              <div className="home-insight-panel__shine" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section home-section--insights-compare" data-reveal>
        <div className="home-section__header">
          <div>
            <h2>Khám phá CineSky - dạng panel</h2>
          </div>
        </div>

        <div className="home-insight-compare-stage">
          <img
            src="/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png"
            alt=""
            className="home-insight-compare-stage__bg"
          />
          <div className="home-insight-compare-stage__wash" aria-hidden="true" />

          <div className="home-insight-compare-copy">
            <span>Khám phá</span>
            <img
              src="/assets/images/cinesky-wordmark-ai.png"
              alt="CineSky"
              className="home-ai-wordmark"
            />
            <p>
              Một góc nhìn gần với phần Tổng quan: ảnh nền tổng rất nhẹ,
              còn từng card vẫn giữ hình ảnh rõ để dễ so sánh.
            </p>
            <Link to="/filter" className="home-solid-link">
              Khám phá phim
            </Link>
          </div>

          <div className="home-insight-compare-panels">
            <Link
              to="/about"
              className="home-insight-compare-panel"
              style={{ "--panel-y": "-28px", "--compare-card-image": "url('/assets/images/Golden_Dragon_Sovereign.png')" }}
            >
              <span>Giới thiệu</span>
              <strong>Trải nghiệm CineSky</strong>
              <small>UI/UX, đặt vé, hành trình xem phim.</small>
            </Link>

            <Link
              to="/filter"
              className="home-insight-compare-panel"
              style={{ "--panel-y": "20px", "--compare-card-image": "url('/assets/images/Emerald_Lotus_Goddess.png')" }}
            >
              <span>Lọc phim</span>
              <strong>{topGenres.length} thể loại nổi bật</strong>
              <small>Lọc theo thể loại, quốc gia và độ tuổi.</small>
            </Link>

            <Link
              to="/?tab=now"
              className="home-insight-compare-panel"
              style={{ "--panel-y": "-22px", "--compare-card-image": "url('/assets/images/Violet_Moon_Empress.png')" }}
            >
              <span>Đang chiếu</span>
              <strong>{nowShowingMovies.length} phim đang mở bán</strong>
              <small>Đi nhanh đến lịch chiếu trong ngày.</small>
            </Link>

            <Link
              to="/?tab=soon"
              className="home-insight-compare-panel"
              style={{ "--panel-y": "26px", "--compare-card-image": "url('/assets/images/Celestial_Pipa_Sunset_4K_Wallpaper.png')" }}
            >
              <span>Sắp chiếu</span>
              <strong>{comingSoonMovies.length} phim sắp ra mắt</strong>
              <small>Theo dõi phim mới và trailer nổi bật.</small>
            </Link>

            <Link
              to="/promotions"
              className="home-insight-compare-panel"
              style={{ "--panel-y": "-18px", "--compare-card-image": "url('/assets/images/Emerald_Lotus_Goddess.png')" }}
            >
              <span>Ưu đãi</span>
              <strong>Combo va ma giam gia</strong>
              <small>Cập nhật ưu đãi thành viên CineSky.</small>
            </Link>

            <Link
              to="/feedback"
              className="home-insight-compare-panel"
              style={{ "--panel-y": "18px", "--compare-card-image": "url('/assets/images/Violet_Moon_Empress.png')" }}
            >
              <span>Góp ý</span>
              <strong>Lắng nghe phản hồi</strong>
              <small>Gửi đánh giá để cải thiện trải nghiệm.</small>
            </Link>
          </div>
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
          <DynamicLottie
            src="/assets/lottie/loader-cat.json"
            loop
            autoplay
          />
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
