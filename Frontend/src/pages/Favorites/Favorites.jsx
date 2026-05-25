import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import MovieCard from "../../components/MovieCard/MovieCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getMyFavorites, removeMyFavorite } from "../../services/movieService";
import "./Favorites.css";

const SKELETON_COUNT = 8;

function FavoriteSkeleton() {
  return (
    <div className="favorites-skeleton-card" aria-hidden="true">
      <div className="favorites-skeleton-poster" />
      <div className="favorites-skeleton-meta" />
    </div>
  );
}

export default function Favorites({ showToast }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const sessionUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; }
  })();
  const isAuthenticated = Boolean(sessionUser?.id || sessionUser?.email);

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getMyFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách phim yêu thích.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setIsLoading(false); return; }
    fetchFavorites();
  }, [fetchFavorites, isAuthenticated]);

  const handleRemove = async (movieId, movieTitle) => {
    try {
      setRemovingId(movieId);
      await removeMyFavorite(movieId);
      setFavorites((prev) => prev.filter((m) => m.id !== movieId));
      showToast?.({
        type: "success",
        title: "Đã xóa khỏi yêu thích",
        message: `${movieTitle} đã được xóa khỏi danh sách yêu thích.`,
      });
    } catch (err) {
      showToast?.({
        type: "error",
        title: "Không thể xóa",
        message: err.message || "Có lỗi xảy ra khi xóa phim yêu thích.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="favorites-page">
      {/* Hero */}
      <section className="favorites-hero">
        <div className="favorites-hero__inner">
          <span className="favorites-hero__eyebrow">Thư viện cá nhân</span>
          <h1 className="favorites-hero__title">
            Phim Yêu Thích
            {favorites.length > 0 && (
              <span className="favorites-hero__count">{favorites.length}</span>
            )}
          </h1>
          <p className="favorites-hero__subtitle">
            Lưu lại những bộ phim bạn muốn xem hoặc đã yêu thích để truy cập nhanh bất cứ lúc nào.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="favorites-content">
        {!isAuthenticated ? (
          <EmptyState
            icon="🔐"
            title="Cần đăng nhập"
            description="Đăng nhập để xem và quản lý danh sách phim yêu thích của bạn trên CineSky."
            action={
              <Link to="/login" className="favorites-cta-btn">
                Đăng nhập ngay
              </Link>
            }
          />
        ) : isLoading ? (
          <div className="favorites-grid">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => <FavoriteSkeleton key={i} />)}
          </div>
        ) : error ? (
          <EmptyState
            icon="😞"
            title="Không thể tải danh sách"
            description={error}
            action={
              <button className="favorites-cta-btn" onClick={fetchFavorites}>Thử lại</button>
            }
          />
        ) : favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="favorites-card-wrapper">
                <MovieCard movie={fav.movie || {}} />
                <button
                  type="button"
                  className={"favorites-remove-btn" + (removingId === fav.movieId ? " is-removing" : "")}
                  onClick={() => handleRemove(fav.movieId, fav.movieTitle)}
                  disabled={removingId === fav.movieId}
                  aria-label={`Xóa ${fav.movieTitle} khỏi yêu thích`}
                  title="Xóa khỏi yêu thích"
                >
                  {removingId === fav.movieId ? "..." : "✕"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎬"
            title="Chưa có phim yêu thích"
            description="Hãy khám phá danh sách phim và nhấn ❤ để lưu những bộ phim bạn yêu thích."
            action={
              <Link to="/?tab=now" className="favorites-cta-btn">
                Khám phá phim ngay
              </Link>
            }
          />
        )}
      </section>
    </main>
  );
}
