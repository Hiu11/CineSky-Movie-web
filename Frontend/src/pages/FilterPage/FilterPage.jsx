import React, { useEffect, useMemo, useState } from "react";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import "./FilterPage.css";

const normalizeText = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const FilterSkeletonCard = () => <div className="filter-skeleton-card" aria-hidden="true"></div>;

const FilterPage = ({ searchQuery = "" }) => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        setIsLoading(true);
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

    return () => {
      isMounted = false;
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

  return (
    <main className="filter-view-container">
      <section className="filter-options-panel">
        <div className="filter-toolbar">
          <div className="filter-toolbar__intro">
            <span className="filter-toolbar__eyebrow">Lọc thông minh</span>
            <h1>Chọn đúng phim bạn muốn xem</h1>
            <p>
              Lọc nhanh theo thể loại, quốc gia và độ tuổi để rút gọn danh sách phim theo đúng nhu
              cầu hiện tại.
            </p>
          </div>

          <div className="filter-row">
            <div className="filter-control">
              <select className="custom-select" value={selectedGenre} onChange={(event) => setSelectedGenre(event.target.value)}>
                <option value="">Thể loại</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-control">
              <select className="custom-select" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}>
                <option value="">Quốc gia</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-control">
              <select className="custom-select" value={selectedRating} onChange={(event) => setSelectedRating(event.target.value)}>
                <option value="">Độ tuổi</option>
                {ratingOptions.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
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

      <section className="movie-grid-container">
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
          filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
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
    </main>
  );
};

export default FilterPage;
