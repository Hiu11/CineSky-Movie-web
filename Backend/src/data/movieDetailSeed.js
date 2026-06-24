const detailOverridesByLegacyId = {
  15: {
    cast: [
      { name: "Sam Worthington", role: "Jake Sully" },
      { name: "Zoe Saldana", role: "Neytiri" },
      { name: "Sigourney Weaver", role: "Kiri" },
      { name: "Stephen Lang", role: "Quaritch" },
    ],
  },
  16: {
    cast: [
      { name: "Mark Wahlberg", role: "Air Marshal" },
      { name: "Michelle Dockery", role: "Madolyn Harris" },
      { name: "Topher Grace", role: "Winston" },
      { name: "Leah Remini", role: "Caroline Van Sant" },
    ],
  },
  17: {
    cast: [
      { name: "Chris Hemsworth", role: "Thor" },
      { name: "Natalie Portman", role: "Jane Foster" },
      { name: "Tom Hiddleston", role: "Loki" },
      { name: "Christopher Eccleston", role: "Malekith" },
    ],
  },
  18: {
    cast: [
      { name: "Doan Quoc Dam", role: "Chien si tre" },
      { name: "Cao Thi Thuy Linh", role: "Nu chinh" },
      { name: "Tuan Hung", role: "Nhac cong" },
      { name: "Trong Trinh", role: "Vai phu noi bat" },
    ],
  },
  19: {
    cast: [
      { name: "Nha Phuong", role: "Nha Van" },
      { name: "Diem My 9x", role: "Linh Lan" },
      { name: "Ninh Duong Lan Ngoc", role: "Jessica" },
      { name: "Duc Phuc", role: "Guest cameo" },
    ],
  },
  20: {
    cast: [
      { name: "Tran Nghia", role: "Ngan" },
      { name: "Truc Anh", role: "Ha Lan" },
      { name: "Khanh Van", role: "Tra Long" },
      { name: "Trong Khang", role: "Dung" },
    ],
  },
  5: {
    cast: [
      { name: "MisThy", role: "Nhan vat trung tam" },
      { name: "Dustin Nguyen", role: "Nguoi than trong gia dinh" },
      { name: "Dinh Y Nhung", role: "Nhan vat gay xao tron" },
      { name: "Jun Vu", role: "Co dau bi cuon vao bien co" },
    ],
  },
  6: {
    cast: [
      { name: "Kieu Minh Tuan", role: "Nguoi dan duong vao rung thieng" },
      { name: "Hanh Thuy", role: "Nguoi giu bi mat co xua" },
      { name: "Diep Bao Ngoc", role: "Nhan vat nu bi am anh" },
      { name: "Nina Nutthacha", role: "Vi khach la mat" },
    ],
  },
  7: {
    cast: [
      { name: "Thai Hoa", role: "Nguoi cha ganh vac bien co" },
      { name: "Vo Tan Phat", role: "Nguoi dong hanh tre tuoi" },
      { name: "Doan The Vinh", role: "Nhan vat tao xung dot" },
      { name: "Hong Anh", role: "Tru cot gia dinh" },
    ],
  },
  8: {
    cast: [
      { name: "Vo Tan Phat", role: "Nhan vat bi cuon vao loi don" },
      { name: "Tran Ngoc Vang", role: "Nguoi truy tim su that" },
      { name: "Oc Thanh Van", role: "Nhan vat giu then chot bi an" },
      { name: "Thanh Thuy", role: "Nguoi chung kien qua khu" },
    ],
  },
  9: {
    cast: [
      { name: "Phuong Anh Dao", role: "Nhan vat nu chinh" },
      { name: "Tuan Tran", role: "Nguoi thay doi nhiep song gia dinh" },
      { name: "Quach Ngoc Ngoan", role: "Thanh vien lon trong nha" },
      { name: "Trung Dan", role: "Nguoi ket noi cac the he" },
    ],
  },
  10: {
    cast: [
      { name: "Mai Tai Phen", role: "Tai" },
      { name: "Vinh Rau", role: "Ban than cua Tai" },
      { name: "Long Dep Trai", role: "Nguoi gay suc ep doi dau" },
      { name: "Hong Anh", role: "Nguoi than quan trong" },
    ],
  },
  11: {
    cast: [
      { name: "Chris Pratt", role: "Mario" },
      { name: "Anya Taylor-Joy", role: "Princess Peach" },
      { name: "Jack Black", role: "Bowser" },
      { name: "Keegan-Michael Key", role: "Toad" },
    ],
  },
  101: {
    cast: [
      { name: "Cao Thai Ha", role: "Nhan vat chinh" },
      { name: "Le Be La", role: "Nhan vat nua tin nua so" },
      { name: "Quoc Truong", role: "Nguoi dieu tra bi an" },
      { name: "Ngoc Lan", role: "Chu nhan co so lam dep" },
    ],
  },
  102: {
    cast: [
      { name: "Quoc Truong", role: "Nguoi tro ve tu qua khu" },
      { name: "Quoc Huy", role: "Ban trai cu con day dut" },
      { name: "Quynh Thy", role: "Nhan vat nu trung tam" },
      { name: "Le Khanh", role: "Nguoi dan duong cho su hoa giai" },
    ],
  },
  103: {
    cast: [
      { name: "Milly Alcock", role: "Kara Zor-El / Supergirl" },
      { name: "Matthias Schoenaerts", role: "Phan dien chinh" },
      { name: "Eve Ridley", role: "Dong minh tre tuoi" },
      { name: "Jason Momoa", role: "Lobo" },
    ],
  },
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

const buildFallbackCast = (movie) => [
  {
    name: movie.director || "CineSky Studio",
    role: "Director",
  },
  {
    name: movie.country ? `${movie.country} ensemble` : "Global ensemble",
    role: "Lead cast",
  },
  {
    name: movie.rating || "T13",
    role: "Audience focus",
  },
];

const buildGallery = (movie) =>
  [...new Set([movie.poster, ...getYoutubeThumbnailCandidates(movie.trailer)])].filter(Boolean).slice(0, 4);

const isValidSeedShowtime = (timeLabel) => /^\d{2}:\d{2}$/.test(String(timeLabel));

const buildTrailerFacts = (movie) => {
  const previewTimes = Array.isArray(movie.showtimes)
    ? movie.showtimes.filter(isValidSeedShowtime).slice(0, 5)
    : [];

  return [
    {
      label: "Trạng thái",
      value: movie.status === "rental" ? "Phim thuê" : movie.status === "coming-soon" ? "Sắp chiếu" : "Đang chiếu",
    },
    {
      label: "Độ tuổi",
      value: movie.rating || "Đang cập nhật",
    },
    {
      label: "Suất nổi bật",
      value: previewTimes.length > 0 ? `${previewTimes.length} suất` : "Đang cập nhật",
    },
    {
      label: "Xem nhanh",
      value: previewTimes.length > 0 ? previewTimes.slice(0, 3).join(" | ") : "Chưa có lịch chiếu",
    },
  ];
};

const buildTrailerPanel = (movie) => {
  const previewTimes = Array.isArray(movie.showtimes)
    ? movie.showtimes.filter(isValidSeedShowtime)
    : [];

  return {
    label: "Thông tin nhanh",
    title: movie.title,
    description:
      previewTimes.length > 0
        ? "Xem trailer trước khi chọn suất. Khu vực này tóm tắt nhanh trạng thái phát hành, độ tuổi và lịch chiếu nổi bật để bạn quyết định thuận tiện hơn."
        : "Phim hiện chưa có lịch chiếu khả dụng. Bạn vẫn có thể xem trailer, đọc mô tả và theo dõi trạng thái phát hành ngay trên trang chi tiết.",
  };
};

export const buildMovieDetailSeed = (movie) => {
  const detailOverride = detailOverridesByLegacyId[movie.legacyId] || {};

  return {
    cast:
      Array.isArray(detailOverride.cast) && detailOverride.cast.length > 0
        ? detailOverride.cast
        : buildFallbackCast(movie),
    gallery:
      Array.isArray(detailOverride.gallery) && detailOverride.gallery.length > 0
        ? detailOverride.gallery
        : buildGallery(movie),
    trailerFacts:
      Array.isArray(detailOverride.trailerFacts) &&
      detailOverride.trailerFacts.length > 0
        ? detailOverride.trailerFacts
        : buildTrailerFacts(movie),
    trailerPanel:
      detailOverride.trailerPanel &&
      (detailOverride.trailerPanel.label ||
        detailOverride.trailerPanel.title ||
        detailOverride.trailerPanel.description)
        ? detailOverride.trailerPanel
        : buildTrailerPanel(movie),
  };
};
