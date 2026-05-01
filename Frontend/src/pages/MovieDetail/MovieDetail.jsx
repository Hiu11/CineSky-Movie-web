import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import "./MovieDetail.css";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMovieById(id);

        if (isMounted) {
          setMovie(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message || "Không thể tải thông tin phim từ server."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovie();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <h2 style={{ color: "white" }}>Đang tải thông tin phim...</h2>;
  }

  if (!movie) {
    return (
      <h2 style={{ color: "white" }}>
        {errorMessage || "Không tìm thấy phim"}
      </h2>
    );
  }

  return (
    <div className="md-page">
      <section className="md-top">
        <div className="md-left">
          <div className="md-posterWrap">
            <img className="md-poster" src={movie.poster} alt={movie.title} />
          </div>

          <div className="md-info">
            <h1 className="md-title">{movie.title}</h1>

            <div className="md-meta">
              <p>
                <b>Thời lượng:</b> {movie.duration} phút
              </p>
              <p>
                <b>Khởi chiếu:</b> {movie.release}
              </p>
              <p>
                <b>Quốc gia:</b> {movie.country}
              </p>
              <p>
                <b>Đạo diễn:</b> {movie.director}
              </p>
            </div>

            <div className="md-genres">
              {movie.genres.map((genre) => (
                <span className="md-genre" key={genre}>
                  {genre}
                </span>
              ))}
            </div>

            <button
              className="md-bookBtn"
              onClick={() => navigate(`/booking?movieId=${movie.id}`)}
            >
              ĐẶT VÉ NGAY
            </button>
          </div>
        </div>

        <aside className="md-script">
          <h2 className="md-h2">Nội dung phim</h2>
          <p className="md-text">{movie.description}</p>
        </aside>
      </section>

      <section className="md-trailer">
        <h2 className="md-h2">Trailer</h2>

        <div className="md-video">
          <iframe
            src={movie.trailer}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <style>{`
        .md-page{
          min-height: 100vh;
          padding: 40px 48px;
          color: #fff;
          background: radial-gradient(1200px 500px at 30% 10%, rgba(93, 82, 255, 0.18), transparent 60%),
                      radial-gradient(900px 400px at 75% 20%, rgba(255, 196, 74, 0.12), transparent 55%),
                      linear-gradient(to bottom, #0b1020, #05060f);
        }

        .md-top{
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .md-left{
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex: 1 1 620px;
          min-width: 520px;
        }

        .md-posterWrap{
          width: 320px;
          flex: 0 0 320px;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          box-shadow: 0 18px 60px rgba(0,0,0,0.35);
        }

        .md-poster{
          width: 100%;
          height: 480px;
          object-fit: cover;
          display: block;
        }

        .md-info{
          flex: 1;
          padding-top: 8px;
        }

        .md-title{
          font-size: 44px;
          line-height: 1.15;
          margin: 0 0 16px 0;
          letter-spacing: 0.2px;
        }

        .md-meta p{
          margin: 8px 0;
          color: rgba(255,255,255,0.9);
        }

        .md-meta b{
          color: #fff;
        }

        .md-genres{
          margin-top: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .md-genre{
          display: inline-block;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 14px;
          color: rgba(255,255,255,0.92);
        }

        .md-bookBtn{
          margin-top: 18px;
          width: 220px;
          max-width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          background: #f2c14e;
          color: #111;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.12s ease, filter 0.12s ease;
        }
        .md-bookBtn:hover{ transform: translateY(-1px); filter: brightness(1.03); }
        .md-bookBtn:active{ transform: translateY(0px); }

        .md-script{
          flex: 1 1 520px;
          min-width: 320px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px 18px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.25);
        }

        .md-h2{
          margin: 0 0 12px 0;
          font-size: 26px;
        }

        .md-text{
          margin: 0;
          line-height: 1.75;
          color: rgba(255,255,255,0.92);
          text-align: justify;
          text-justify: inter-word;
          white-space: pre-line;
        }

        .md-trailer{
          margin-top: 26px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.25);
        }

        .md-video{
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(0,0,0,0.3);
        }

        .md-video iframe{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        @media (max-width: 980px){
          .md-page{ padding: 28px 18px; }
          .md-left{
            min-width: 0;
            flex: 1 1 100%;
            flex-wrap: wrap;
          }
          .md-posterWrap{
            width: 100%;
            flex: 1 1 100%;
          }
          .md-poster{ height: 520px; }
          .md-title{ font-size: 34px; }
          .md-bookBtn{ width: 100%; }
        }
      `}</style>
    </div>
  );
}
