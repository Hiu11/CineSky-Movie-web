import React, { useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const FilterPage = ({ searchQuery = "" }) => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const movies = [
    {
      id: 201,
      title: "THỎ ƠI!!",
      poster: "/assets/images/thỏ ơi.jpg",
      genre: "Tâm Lý, Tình Cảm",
      genres: ["Tâm Lý", "Tình Cảm"],
      country: "Việt Nam",
      duration: "127",
      rating: "T18",
      ratingClass: "t18",
      ratingDesc: "**T18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
      times: ["10:15", "13:30", "16:45", "20:00"],
    },
    {
      id: 202,
      title: "TIỂU YÊU QUÁI NÚI LÃNG LÃNG",
      poster: "/assets/images/tiểu yêu quái núi lãng lãng.jpg",
      genre: "Hoạt Hình",
      genres: ["Hoạt Hình"],
      country: "Trung Quốc",
      duration: "118",
      rating: "T13",
      ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["09:30", "12:15", "15:00", "18:30"],
    },
    {
      id: 203,
      title: "RUNNING MAN VIỆT NAM MÙA 3: CON RỐI TỰ DO",
      poster: "/assets/images/running-man.jpg",
      genre: "Chương Trình Thực Tế",
      genres: ["Chương Trình Thực Tế"],
      country: "Việt Nam",
      duration: "161",
      rating: "T16",
      ratingClass: "t16",
      ratingDesc: "**T16:** Phim dành cho khán giả từ đủ 16 tuổi trở lên",
      times: ["11:00", "14:30", "19:30"],
    },
    {
      id: 1,
      title: "AVATAR: LỬA VÀ TRO TÀN",
      poster:
        "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
      genre: "Giả tưởng, Hành động",
      genres: ["Giả tưởng", "Hành động"],
      country: "Mỹ",
      duration: "197",
      rating: "T13",
      ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["10:50", "13:10", "15:30", "19:00"],
    },
    {
      id: 2,
      title: "TỬ CHIẾN TRÊN KHÔNG",
      poster: "/assets/images/Tử chiến.jpg",
      genre: "Hành động",
      genres: ["Hành động"],
      country: "Mỹ",
      duration: "118",
      rating: "T18",
      ratingClass: "t18",
      ratingDesc: "**T18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
      times: ["11:45", "14:00", "16:20"],
    },
    {
      id: 3,
      title: "THOR: THẾ GIỚI BÓNG TỐI",
      poster: "/assets/images/Thor.jpg",
      genre: "Hành động, Siêu anh hùng",
      genres: ["Hành động", "Siêu anh hùng"],
      country: "Mỹ",
      duration: "112",
      rating: "T13",
      ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["10:00", "13:00", "16:00"],
    },
    {
      id: 4,
      title: "ĐÀO, PHỞ VÀ PIANO",
      poster: "/assets/images/Đào.jpg",
      genre: "Lịch sử",
      genres: ["Lịch sử"],
      country: "Việt Nam",
      duration: "100",
      rating: "T13",
      ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["09:30", "12:00", "14:30", "17:00"],
    },
    {
      id: 5,
      title: "1990",
      poster: "/assets/images/1990.webp",
      genre: "Tâm lý, Hài",
      genres: ["Tâm lý", "Hài"],
      country: "Việt Nam",
      duration: "110",
      rating: "T16",
      ratingClass: "t16",
      ratingDesc: "**T16:** Phim dành cho khán giả từ đủ 16 tuổi trở lên",
      times: ["11:00", "14:00", "18:00", "21:00"],
    },
    {
      id: 6,
      title: "MẮT BIẾC",
      poster: "/assets/images/Mắt biếc.jpg",
      genre: "Lãng mạn",
      genres: ["Lãng mạn"],
      country: "Việt Nam",
      duration: "117",
      rating: "T13",
      ratingClass: "t13",
      ratingDesc: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
      times: ["08:30", "10:30", "12:30", "14:30"],
    },
    {
      id: 7,
      title: "BEAUTY AND THE BEAST",
      poster: "/assets/images/Beauty.jpg",
      genre: "Live-action, Thần thoại",
      genres: ["Live-action", "Thần thoại"],
      country: "Mỹ",
      duration: "129",
      rating: "P",
      ratingClass: "p-rating",
      ratingDesc: "**P:** Phim phổ biến, mọi lứa tuổi",
      times: ["09:00", "11:30", "14:00", "16:30"],
    },
    {
      id: 101,
      title: "TẾ LỄ QUỶ LINH NHI",
      poster: "/assets/images/te-le-quy-linh-nhi.webp",
      genre: "Kinh Dị, Phụ Đề",
      genres: ["Kinh Dị", "Phụ Đề"],
      country: "Khác",
      duration: "86",
      rating: "C18",
      ratingClass: "t18",
      ratingDesc: "**C18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
      times: ["Chưa có lịch"],
    },
    {
      id: 102,
      title: "MÙI PHỞ (K)",
      poster: "/assets/images/mui-pho.webp",
      genre: "Tình Cảm, Gia đình",
      genres: ["Tình Cảm", "Gia đình"],
      country: "Việt Nam",
      duration: "111",
      rating: "K",
      ratingClass: "p-rating",
      ratingDesc:
        "**K:** Phim dành cho khán giả dưới 13 tuổi khi xem cùng cha mẹ hoặc người giám hộ",
      times: ["Chưa có lịch"],
    },
    {
      id: 103,
      title: "QUỶ NHẬP TRÀNG 2",
      poster: "/assets/images/quy-nhap-trang-main.webp",
      genre: "Kinh Dị",
      genres: ["Kinh Dị"],
      country: "Việt Nam",
      duration: "99",
      rating: "NR",
      ratingClass: "p-rating",
      ratingDesc: "**NR:** Chưa phân loại",
      times: ["Chưa có lịch"],
    },
  ];

  const genreOptions = useMemo(() => {
    const set = new Set();
    movies.forEach((movie) => movie.genres.forEach((g) => set.add(g)));
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
            onChange={(e) => setSelectedGenre(e.target.value)}
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
            onChange={(e) => setSelectedCountry(e.target.value)}
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
            onChange={(e) => setSelectedRating(e.target.value)}
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
        {filteredMovies.length > 0 ? (
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
