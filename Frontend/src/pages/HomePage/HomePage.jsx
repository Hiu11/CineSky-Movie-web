import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../../components/MovieCard/MovieCard";
import { getMovies } from "../../services/movieService";
import "./HomePage.css";

const normalizeText = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const HomePage = ({ searchQuery = "" }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "now";

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const status = tabParam === "soon" ? "coming-soon" : "now-showing";

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMovies({ status });

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
  }, [status]);

  const normalizedQuery = normalizeText(searchQuery.trim());
  const filteredMovies = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return movies;
    }

    return movies.filter((movie) =>
      normalizeText(movie.title).includes(normalizedQuery)
    );
  }, [movies, normalizedQuery]);

  return (
    <div className="homepage-wrapper">
      <div className="movie-grid-container">
        {isLoading ? (
          <div className="home-empty-state">Đang tải danh sách phim...</div>
        ) : errorMessage ? (
          <div className="home-empty-state">{errorMessage}</div>
        ) : filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <div className="home-empty-state">Không tìm thấy phim phù hợp.</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
