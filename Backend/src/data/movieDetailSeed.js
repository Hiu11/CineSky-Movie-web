const detailOverridesByLegacyId = {
  1: {
    cast: [
      { name: "Sam Worthington", role: "Jake Sully" },
      { name: "Zoe Saldana", role: "Neytiri" },
      { name: "Sigourney Weaver", role: "Kiri" },
      { name: "Stephen Lang", role: "Quaritch" },
    ],
  },
  2: {
    cast: [
      { name: "Mark Wahlberg", role: "Air Marshal" },
      { name: "Michelle Dockery", role: "Madolyn Harris" },
      { name: "Topher Grace", role: "Winston" },
      { name: "Leah Remini", role: "Caroline Van Sant" },
    ],
  },
  3: {
    cast: [
      { name: "Chris Hemsworth", role: "Thor" },
      { name: "Natalie Portman", role: "Jane Foster" },
      { name: "Tom Hiddleston", role: "Loki" },
      { name: "Christopher Eccleston", role: "Malekith" },
    ],
  },
  4: {
    cast: [
      { name: "Doan Quoc Dam", role: "Chien si tre" },
      { name: "Cao Thi Thuy Linh", role: "Nu chinh" },
      { name: "Tuan Hung", role: "Nhac cong" },
      { name: "Trong Trinh", role: "Vai phu noi bat" },
    ],
  },
  5: {
    cast: [
      { name: "Nha Phuong", role: "Nha Van" },
      { name: "Diem My 9x", role: "Linh Lan" },
      { name: "Ninh Duong Lan Ngoc", role: "Jessica" },
      { name: "Duc Phuc", role: "Guest cameo" },
    ],
  },
  6: {
    cast: [
      { name: "Tran Nghia", role: "Ngan" },
      { name: "Truc Anh", role: "Ha Lan" },
      { name: "Khanh Van", role: "Tra Long" },
      { name: "Trong Khang", role: "Dung" },
    ],
  },
  301: {
    cast: [
      { name: "MisThy", role: "Nhan vat trung tam" },
      { name: "Dustin Nguyen", role: "Nguoi than trong gia dinh" },
      { name: "Dinh Y Nhung", role: "Nhan vat gay xao tron" },
      { name: "Jun Vu", role: "Co dau bi cuon vao bien co" },
    ],
  },
  302: {
    cast: [
      { name: "Kieu Minh Tuan", role: "Nguoi dan duong vao rung thieng" },
      { name: "Hanh Thuy", role: "Nguoi giu bi mat co xua" },
      { name: "Diep Bao Ngoc", role: "Nhan vat nu bi am anh" },
      { name: "Nina Nutthacha", role: "Vi khach la mat" },
    ],
  },
  303: {
    cast: [
      { name: "Thai Hoa", role: "Nguoi cha ganh vac bien co" },
      { name: "Vo Tan Phat", role: "Nguoi dong hanh tre tuoi" },
      { name: "Doan The Vinh", role: "Nhan vat tao xung dot" },
      { name: "Hong Anh", role: "Tru cot gia dinh" },
    ],
  },
  304: {
    cast: [
      { name: "Vo Tan Phat", role: "Nhan vat bi cuon vao loi don" },
      { name: "Tran Ngoc Vang", role: "Nguoi truy tim su that" },
      { name: "Oc Thanh Van", role: "Nhan vat giu then chot bi an" },
      { name: "Thanh Thuy", role: "Nguoi chung kien qua khu" },
    ],
  },
  305: {
    cast: [
      { name: "Phuong Anh Dao", role: "Nhan vat nu chinh" },
      { name: "Tuan Tran", role: "Nguoi thay doi nhiep song gia dinh" },
      { name: "Quach Ngoc Ngoan", role: "Thanh vien lon trong nha" },
      { name: "Trung Dan", role: "Nguoi ket noi cac the he" },
    ],
  },
  306: {
    cast: [
      { name: "Mai Tai Phen", role: "Tai" },
      { name: "Vinh Rau", role: "Ban than cua Tai" },
      { name: "Long Dep Trai", role: "Nguoi gay suc ep doi dau" },
      { name: "Hong Anh", role: "Nguoi than quan trong" },
    ],
  },
  307: {
    cast: [
      { name: "Chris Pratt", role: "Mario" },
      { name: "Anya Taylor-Joy", role: "Princess Peach" },
      { name: "Jack Black", role: "Bowser" },
      { name: "Keegan-Michael Key", role: "Toad" },
    ],
  },
  308: {
    cast: [
      { name: "Cao Thai Ha", role: "Nhan vat chinh" },
      { name: "Le Be La", role: "Nhan vat nua tin nua so" },
      { name: "Quoc Truong", role: "Nguoi dieu tra bi an" },
      { name: "Ngoc Lan", role: "Chu nhan co so lam dep" },
    ],
  },
  309: {
    cast: [
      { name: "Quoc Truong", role: "Nguoi tro ve tu qua khu" },
      { name: "Quoc Huy", role: "Ban trai cu con day dut" },
      { name: "Quynh Thy", role: "Nhan vat nu trung tam" },
      { name: "Le Khanh", role: "Nguoi dan duong cho su hoa giai" },
    ],
  },
  310: {
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

const buildTrailerFacts = (movie) => {
  const previewTimes = Array.isArray(movie.showtimes) ? movie.showtimes.filter(Boolean).slice(0, 5) : [];

  return [
    {
      label: "Trang thai",
      value: movie.status === "coming-soon" ? "Sap chieu" : "Dang chieu",
    },
    {
      label: "Do tuoi",
      value: movie.rating || "Dang cap nhat",
    },
    {
      label: "Suat noi bat",
      value: previewTimes.length > 0 ? `${previewTimes.length} suat` : "Dang cap nhat",
    },
    {
      label: "Xem nhanh",
      value: previewTimes.length > 0 ? previewTimes.slice(0, 3).join(" | ") : "Chua co lich chieu",
    },
  ];
};

const buildTrailerPanel = (movie) => {
  const previewTimes = Array.isArray(movie.showtimes) ? movie.showtimes.filter(Boolean) : [];

  return {
    label: "Thong tin nhanh",
    title: movie.title,
    description:
      previewTimes.length > 0
        ? "Xem trailer truoc khi chon suat. Khu vuc nay tom tat nhanh trang thai phat hanh, do tuoi va lich chieu noi bat de ban quyet dinh thuan tien hon."
        : "Phim hien chua co lich chieu kha dung. Ban van co the xem trailer, doc mo ta va theo doi trang thai phat hanh ngay tren trang chi tiet.",
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
