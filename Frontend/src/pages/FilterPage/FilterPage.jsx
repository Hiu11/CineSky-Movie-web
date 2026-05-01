import React, { useEffect, useMemo, useState } from "react";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import "./FilterPage.css";

const normalizeText = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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
          setErrorMessage(
            error.message || "Không thể tải danh sách phim từ server."
          );
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
    const matchesQuery =
      normalizedQuery.length === 0 ||
      normalizeText(movie.title).includes(normalizedQuery);
    const matchesGenre =
      !selectedGenre || movie.genres.includes(selectedGenre);
    const matchesCountry =
      !selectedCountry || movie.country === selectedCountry;
    const matchesRating =
      !selectedRating || movie.rating === selectedRating;

    return matchesQuery && matchesGenre && matchesCountry && matchesRating;
  });

  return (
    <div className="filter-view-container">
      <div className="filter-options-panel">
        <div className="filter-row">
          <select
            className="custom-select"
            value={selectedGenre}
            onChange={(event) => setSelectedGenre(event.target.value)}
          >
            <option value="">Thể loại</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <select
            className="custom-select"
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
          >
            <option value="">Quốc gia</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            className="custom-select"
            value={selectedRating}
            onChange={(event) => setSelectedRating(event.target.value)}
          >
            <option value="">Độ tuổi</option>
            {ratingOptions.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="movie-grid-container">
        {isLoading ? (
          <div style={{ color: "white", textAlign: "center", width: "100%" }}>
            Đang tải danh sách phim...
          </div>
        ) : errorMessage ? (
          <div style={{ color: "white", textAlign: "center", width: "100%" }}>
            {errorMessage}
          </div>
        ) : filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <div style={{ color: "white", textAlign: "center", width: "100%" }}>
            Không tìm thấy phim phù hợp.
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPage;
