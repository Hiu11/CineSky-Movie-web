import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('now');
  const navigate = useNavigate();

  const allMovies = [
    {
      id: 1,
      title: "AVATAR: LỬA VÀ TRO TÀN",
      poster: "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
      genre: "Giả tưởng, Hành động",
      duration: "197",
      rating: "T13",
      ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["10:50", "13:10", "15:30", "19:00"]
    },
    {
      id: 2, title: "TỬ CHIẾN TRÊN KHÔNG", poster: "/assets/images/Tử chiến.jpg",
      genre: "Hành động", duration: "118", rating: "T18", ratingClass: "t18",
      ratingDesc: "**T18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
      times: ["11:45", "14:00", "16:20"]
    },
    {
      id: 3, title: "THOR: THẾ GIỚI BÓNG TỐI", poster: "/assets/images/Thor.jpg",
      genre: "Hành động, Siêu anh hùng", duration: "112", rating: "T13", ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["10:00", "13:00", "16:00"]
    },
    {
      id: 4, title: "ĐÀO, PHỞ VÀ PIANO", poster: "/assets/images/Đào.jpg",
      genre: "Lịch sử", duration: "100", rating: "T13", ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["09:30", "12:00", "14:30", "17:00"]
    },
    {
      id: 5, title: "1990", poster: "/assets/images/1990.webp",
      genre: "Tâm lý, Hài", duration: "110", rating: "T16", ratingClass: "t16",
      ratingDesc: "**T16:** Phim dành cho khán giả từ đủ 16 tuổi trở lên",
      times: ["11:00", "14:00", "18:00", "21:00"]
    },
    {
      id: 6, title: "MẮT BIẾC", poster: "/assets/images/Mắt biếc.jpg",
      genre: "Lãng mạn", duration: "117", rating: "T13", ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["08:30", "10:30", "12:30", "14:30"]
    },
    {
      id: 7, title: "BEAUTY AND THE BEAST", poster: "/assets/images/Beauty.jpg",
      genre: "Live-action, Thần thoại", duration: "129", rating: "P", ratingClass: "p-rating",
      ratingDesc: "**P:** Phim phổ biến, mọi lứa tuổi",
      times: ["09:00", "11:30", "14:00", "16:30"]
    }
  ];

  return (
    <div className="homepage-wrapper">
      <div className="movie-tabs-navigation">
        <button className={activeTab === 'now' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('now')}>PHIM ĐANG CHIẾU</button>
        <button className={activeTab === 'soon' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('soon')}>PHIM SẮP CHIẾU</button>
        <button className={activeTab === 'special' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('special')}>SUẤT CHIẾU ĐẶC BIỆT</button>
        <button className="tab-btn" onClick={() => navigate('/filter')}>LỌC PHIM</button>
      </div>

      <div className="movie-grid-container">
        {allMovies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;