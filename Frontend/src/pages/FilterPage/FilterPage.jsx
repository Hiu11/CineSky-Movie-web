import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import "./FilterPage.css";

const MOVIES_PER_PAGE = 12;

const filterFilmPosters = [
  "/assets/images/khe-uoc-ban-dau.jpg",
  "/assets/images/heo-nam-mong.jpg",
  "/assets/images/cai-ma-2025.jpg",
  "/assets/images/Beauty.jpg",
  "/assets/images/bay-tien.jpg",
  "/assets/images/phim-super-mario-thien-ha.jpg",
];

const normalizeText = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const FilterSkeletonCard = () => <div className="filter-skeleton-card" aria-hidden="true"></div>;

const FilterPage = ({ searchQuery = "" }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc giá trị filter từ URL search parameters để giữ trạng thái (sync state) khi back/refresh
  const [selectedGenre, setSelectedGenre] = useState(() => searchParams.get("genre") || "");
  const [selectedCountry, setSelectedCountry] = useState(() => searchParams.get("country") || "");
  const [selectedRating, setSelectedRating] = useState(() => searchParams.get("rating") || "");
  
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state từ searchParams mỗi khi URL thay đổi (ví dụ: nhấn Back)
  useEffect(() => {
    setSelectedGenre(searchParams.get("genre") || "");
    setSelectedCountry(searchParams.get("country") || "");
    setSelectedRating(searchParams.get("rating") || "");
  }, [searchParams]);

  // Cập nhật URL search parameters mỗi khi bộ lọc thay đổi
  useEffect(() => {
    const params = {};
    if (selectedGenre) params.genre = selectedGenre;
    if (selectedCountry) params.country = selectedCountry;
    if (selectedRating) params.rating = selectedRating;
    
    // Giữ lại các param khác như q/search nếu có
    const currentQ = searchParams.get("q") || searchParams.get("search");
    if (currentQ) params.q = currentQ;

    setSearchParams(params, { replace: true });
  }, [selectedGenre, selectedCountry, selectedRating, setSearchParams, searchParams]);

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
          setMovies(data);
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

  const genreOptions = useMemo(() => {
    const set = new Set();
    movies.forEach((movie) => movie.genres.forEach((genre) => set.add(genre)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [movies]);

  const countryOptions = useMemo(() => {
    const set = new Set();
    movies.forEach((movie) => set.add(movie.country));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [movies]);

  const ratingOptions = useMemo(() => {
    const set = new Set();
    movies.forEach((movie) => set.add(movie.rating));
    return Array.from(set);
  }, [movies]);

  const normalizedQuery = normalizeText(searchQuery.trim());

  const filteredMovies = movies.filter((movie) => {
    const matchesQuery = normalizedQuery.length === 0 || normalizeText(movie.title).includes(normalizedQuery);
    const matchesGenre = !selectedGenre || movie.genres.includes(selectedGenre);
    const matchesCountry = !selectedCountry || movie.country === selectedCountry;
    const matchesRating = !selectedRating || movie.rating === selectedRating;

    return matchesQuery && matchesGenre && matchesCountry && matchesRating;
  });

  const pageCount = Math.max(1, Math.ceil(filteredMovies.length / MOVIES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const paginatedMovies = filteredMovies.slice(
    (safeCurrentPage - 1) * MOVIES_PER_PAGE,
    safeCurrentPage * MOVIES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedQuery, selectedGenre, selectedCountry, selectedRating]);

  const handlePageChange = (nextPage) => {
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = [
    searchQuery.trim() ? { key: "query", label: `Từ khóa: ${searchQuery.trim()}` } : null,
    selectedGenre ? { key: "genre", label: `Thể loại: ${selectedGenre}` } : null,
    selectedCountry ? { key: "country", label: `Quốc gia: ${selectedCountry}` } : null,
    selectedRating ? { key: "rating", label: `Độ tuổi: ${selectedRating}` } : null,
  ].filter(Boolean);
  const canClearSelectedFilters = Boolean(selectedGenre || selectedCountry || selectedRating);

  const handleClearAll = () => {
    setSelectedGenre("");
    setSelectedCountry("");
    setSelectedRating("");
  };

  const handleRemoveFilter = (filterKey) => {
    if (filterKey === "genre") {
      setSelectedGenre("");
    }

    if (filterKey === "country") {
      setSelectedCountry("");
    }

    if (filterKey === "rating") {
      setSelectedRating("");
    }
  };

  const filmBackgroundMovies =
    movies.length > 0
      ? [...movies].reverse().filter((movie) => movie.poster)
      : filterFilmPosters.map((poster, index) => ({ id: `fallback-${index}`, poster }));
  const filmBackgroundLoopMovies = Array.from({ length: 3 }).flatMap(() => filmBackgroundMovies);

  return (
    <main className="filter-view-container">
      <div className="cinematic-film-bg" aria-hidden="true">
        <div className="cinematic-film-bg__strip">
          <div className="cinematic-film-bg__track">
            {[...filmBackgroundLoopMovies, ...filmBackgroundLoopMovies].map((movie, index) => (
              <span className="cinematic-film-bg__frame" key={`${movie.id}-${index}`}>
                <img src={movie.poster} alt="" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="filter-options-panel">
        <div className="filter-toolbar">

          <div className="filter-tags-section">
            <span className="filter-section-title">Thể loại</span>
            <div className="filter-tags-scroll">
              <button
                type="button"
                className={`filter-tag-chip ${!selectedGenre ? "is-active" : ""}`}
                onClick={() => setSelectedGenre("")}
              >
                Tất cả
              </button>
              {genreOptions.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className={`filter-tag-chip ${selectedGenre === genre ? "is-active" : ""}`}
                  onClick={() => setSelectedGenre(selectedGenre === genre ? "" : genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-dropdowns-grid">
            <div className="filter-dropdown-container">
              <label>Quốc gia</label>
              <div className="filter-control">
                <select value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)} className="custom-select">
                  <option value="">Tất cả quốc gia</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-dropdown-container">
              <label>Độ tuổi thích hợp</label>
              <div className="filter-control">
                <select value={selectedRating} onChange={(event) => setSelectedRating(event.target.value)} className="custom-select">
                  <option value="">Tất cả độ tuổi</option>
                  {ratingOptions.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="filter-toolbar__footer">
            <div className="filter-results-copy">
              <strong>{filteredMovies.length}</strong>
              <span>phim phù hợp với bộ lọc hiện tại</span>
            </div>

            {canClearSelectedFilters ? (
              <button type="button" className="filter-clear-btn" onClick={handleClearAll}>
                Xóa toàn bộ bộ lọc
              </button>
            ) : null}
          </div>

          {activeFilters.length > 0 ? (
            <div className="filter-chip-row" aria-label="Bộ lọc đang áp dụng">
              {activeFilters.map((filter) =>
                filter.key === "query" ? (
                  <span key={filter.key} className="filter-chip filter-chip--locked">
                    {filter.label}
                  </span>
                ) : (
                  <button
                    key={filter.key}
                    type="button"
                    className="filter-chip"
                    onClick={() => handleRemoveFilter(filter.key)}
                  >
                    {filter.label}
                    <span aria-hidden="true">×</span>
                  </button>
                )
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="movie-grid-container"
        key={`${selectedGenre}-${selectedCountry}-${selectedRating}-${normalizedQuery}-${safeCurrentPage}`}
      >
        {isLoading ? (
          <>
            {Array.from({ length: 6 }, (_, index) => (
              <FilterSkeletonCard key={index} />
            ))}
          </>
        ) : errorMessage ? (
          <div className="filter-state-message">
            <strong>Không thể tải danh sách phim.</strong>
            <span>{errorMessage}</span>
          </div>
        ) : filteredMovies.length > 0 ? (
          paginatedMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
        ) : (
          <div className="filter-state-message filter-state-message--empty">
            <strong>Chưa có phim khớp với bộ lọc này.</strong>
            <span>Thử đổi thể loại, quốc gia hoặc bỏ bớt điều kiện để mở rộng kết quả nhé.</span>
            <button type="button" className="filter-clear-btn filter-clear-btn--inline" onClick={handleClearAll}>
              Làm mới bộ lọc
            </button>
          </div>
        )}
      </section>

      {!isLoading && !errorMessage && filteredMovies.length > MOVIES_PER_PAGE ? (
        <nav className="movie-pagination" aria-label="Movie pages">
          <button
            type="button"
            onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={page === safeCurrentPage ? "is-active" : ""}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handlePageChange(Math.min(pageCount, safeCurrentPage + 1))}
            disabled={safeCurrentPage === pageCount}
          >
            &gt;
          </button>
        </nav>
      ) : null}
    </main>
  );
};

export default FilterPage;
