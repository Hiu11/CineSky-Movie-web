import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const movies = [
  {
    id: 1,
    title: "Avatar: Lửa Và Tro Tàn",
    duration: "197 phút",
    release: "12/12/2025",
    country: "Mỹ",
    director: "James Cameron",
    genres: ["Giả tưởng", "Hành động", "Phiêu lưu"],
    description: `
Sau những biến cố làm rung chuyển toàn bộ hành tinh Pandora trong phần trước, Avatar: Lửa Và Tro Tàn mở ra một chương mới đen tối, dữ dội và giàu chiều sâu cảm xúc hơn bao giờ hết. Bộ phim không chỉ tiếp tục khai thác cuộc chiến giữa con người và tộc Na’vi, mà còn đi sâu vào những mâu thuẫn nội tâm, sự đánh đổi của gia đình, và câu hỏi về cái giá phải trả cho sự sinh tồn.

Jake Sully – giờ đây không chỉ là một chiến binh Na’vi mà còn là người cha, người chồng – buộc phải đối mặt với lựa chọn khó khăn nhất đời mình. Sau khi gia đình anh quyết định rời bỏ vùng biển Metkayina để tránh khỏi sự truy đuổi của loài người, họ phát hiện ra rằng mối đe dọa mới còn đáng sợ hơn cả quân đội Trái Đất. Một tộc Na’vi cổ xưa, được mệnh danh là Ash Clan (Tộc Tro Tàn), sống tại những vùng đất núi lửa khắc nghiệt, bắt đầu lộ diện.

Ash Clan không giống bất kỳ tộc Na’vi nào trước đây. Họ tin rằng Pandora cần phải “thanh lọc bằng lửa”, và sự tồn tại của con người lẫn những tộc Na’vi hòa hiếu khác đều là mối đe dọa với trật tự tự nhiên. Đứng đầu tộc này là Varang – một nữ thủ lĩnh lạnh lùng, thông minh và tàn nhẫn, sẵn sàng hy sinh tất cả để bảo vệ niềm tin của mình.

Trong khi đó, con người quay trở lại Pandora với công nghệ tiên tiến hơn, tàn bạo hơn. Đại tá Quaritch – dù đã “chết” – nay tồn tại trong một hình hài Avatar mới, mang trong mình ký ức cũ nhưng với bản năng sinh tồn và thù hận được khuếch đại. Hắn không chỉ muốn tiêu diệt Jake Sully, mà còn muốn chiếm quyền kiểm soát hoàn toàn Pandora để biến hành tinh này thành nơi sinh sống mới cho nhân loại.

Bộ phim liên tục đẩy người xem vào những xung đột chồng chéo: cuộc chiến giữa Na’vi và con người, mâu thuẫn nội bộ giữa các tộc Na’vi, cuộc giằng xé giữa bảo vệ gia đình và bảo vệ hành tinh. Những đứa con của Jake và Neytiri đã trưởng thành hơn, mỗi người mang một cá tính riêng, một lựa chọn riêng: có người khao khát hòa bình, có người bị cuốn vào thù hận, có người đứng giữa ranh giới mong manh của sự phản bội.

Cao trào của phim diễn ra khi một cuộc chiến ba bên nổ ra tại vùng núi lửa đang hoạt động. Lửa, tro bụi và biển năng lượng sinh học của Pandora hòa quyện, tạo nên những hình ảnh choáng ngợp. Avatar: Lửa Và Tro Tàn không đơn thuần là một bom tấn giải trí, mà còn đặt ra câu hỏi lớn: liệu sự sống có thể tồn tại khi mọi thứ bị thiêu rụi bởi thù hận? Con người sẽ chọn trở thành kẻ hủy diệt hay người bảo vệ?
    `.trim(),
    poster:
      "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
    trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
  },
  {
      id: 2,
      title: "TỬ CHIẾN TRÊN KHÔNG",
      duration: "118 phút",
      release: "2024",
      country: "Mỹ",
      director: "Mark Williams",
      genres: ["Hành động", "Giật gân"],
      poster: "/assets/images/Tử chiến.jpg",
      trailer: "https://www.youtube.com/embed/VLS9xSsfxkQ",
      description: `
Một chuyến bay thương mại bị khủng bố khống chế ở độ cao 10.000 mét.
Không có nơi hạ cánh, không có cứu viện, mỗi quyết định đều mang tính sống còn.

Một cựu đặc vụ buộc phải đứng lên bảo vệ gia đình và hàng trăm hành khách.
Cuộc chiến diễn ra trong không gian chật hẹp, căng thẳng đến nghẹt thở.

Tử Chiến Trên Không là cuộc đối đầu giữa bản năng sinh tồn và lòng dũng cảm.
      `.trim(),
    },

    {
      id: 3,
      title: "THOR: THẾ GIỚI BÓNG TỐI",
      duration: "112 phút",
      release: "2013",
      country: "Mỹ",
      director: "Alan Taylor",
      genres: ["Hành động", "Siêu anh hùng", "Giả tưởng"],
      poster: "/assets/images/Thor.jpg",
      trailer: "https://www.youtube.com/embed/npvJ9FTgZbM",
      description: `
Thor phải đối đầu với Malekith – thủ lĩnh Dark Elves – kẻ muốn nhấn chìm vũ trụ
vào bóng tối vĩnh viễn bằng sức mạnh Aether.

Trong hành trình bảo vệ Cửu Giới, Thor buộc phải hợp tác với Loki – người em trai
vừa là đồng minh, vừa là kẻ thù.

Bộ phim mở rộng vũ trụ Marvel với những trận chiến hoành tráng và xung đột nội tâm sâu sắc.
      `.trim(),
    },

    {
      id: 4,
      title: "ĐÀO, PHỞ VÀ PIANO",
      duration: "100 phút",
      release: "2024",
      country: "Việt Nam",
      director: "Phi Tiến Sơn",
      genres: ["Lịch sử", "Tâm lý"],
      poster: "/assets/images/Đào.jpg",
      trailer: "https://www.youtube.com/embed/qn1t_biQigc",
      description: `
Lấy bối cảnh Hà Nội năm 1946, bộ phim kể về cuộc sống của những con người bình thường
trong thời khắc lịch sử đầy biến động.

Không có đại cảnh chiến tranh, phim tập trung vào cảm xúc, sự lựa chọn và hy sinh thầm lặng.
Đào, Phở và Piano là bản tình ca buồn về Hà Nội, văn hóa và tinh thần dân tộc.
      `.trim(),
    },

    {
  id: 5,
  title: "1990",
  duration: "110 phút",
  release: "2022",
  country: "Việt Nam",
  director: "Nhất Trung",
  genres: ["Tâm lý", "Hài", "Gia đình"],
  poster: "/assets/images/1990.webp",
  trailer: "https://www.youtube.com/embed/0509zlM8QA8",
  description: `
1990 là câu chuyện xoay quanh ba người phụ nữ ở tuổi 30 – Linh, Nhã và Quỳnh – mỗi người mang trong mình những nỗi lo rất riêng của thế hệ trưởng thành trong giai đoạn giao thời giữa truyền thống và hiện đại.

Họ đều sinh năm 1990, cái tuổi tưởng như đã “ổn định”, nhưng thực tế lại đầy hoang mang: áp lực hôn nhân, sự nghiệp, gia đình và nỗi sợ bị bỏ lại phía sau. Những buổi tụ họp tưởng chừng vui vẻ lại dần lộ ra những tổn thương sâu kín mà mỗi người đang cố che giấu.

Bộ phim nhẹ nhàng pha chút hài hước, nhưng chạm thẳng vào tâm lý của người trẻ hiện đại: sống cho mình hay sống cho kỳ vọng của người khác? 1990 không cần cao trào kịch tính, mà để cảm xúc dẫn dắt, khiến khán giả thấy chính mình trong từng khoảnh khắc rất đời.
  `.trim(),
},

{
  id: 6,
  title: "MẮT BIẾC",
  duration: "117 phút",
  release: "2019",
  country: "Việt Nam",
  director: "Victor Vũ",
  genres: ["Lãng mạn", "Tâm lý"],
  poster: "/assets/images/Mắt biếc.jpg",
  trailer: "https://www.youtube.com/embed/ITlQ0oU7tDA",
  description: `
Mắt Biếc kể câu chuyện tình đơn phương kéo dài suốt nhiều năm của Ngạn dành cho Hà Lan – cô gái có đôi mắt đẹp và buồn, gắn liền với ký ức tuổi thơ tại làng Đo Đo.

Từ những rung động trong trẻo của thời niên thiếu đến khi trưởng thành, tình cảm của Ngạn vẫn vẹn nguyên, trong khi Hà Lan lại khao khát một cuộc sống rực rỡ nơi thành phố. Sự khác biệt trong lựa chọn sống đã đẩy họ dần xa nhau, để lại những tiếc nuối không thể cứu vãn.

Bộ phim là bản tình ca buồn về thanh xuân, về những điều dang dở và câu hỏi muôn thuở: liệu yêu một người hết lòng có đủ để giữ họ ở lại? Mắt Biếc không chỉ khiến người xem khóc vì tình yêu, mà còn vì những điều ta từng bỏ lỡ trong chính cuộc đời mình.
  `.trim(),
},

{
  id: 7,
  title: "BEAUTY AND THE BEAST",
  duration: "129 phút",
  release: "2017",
  country: "Mỹ",
  director: "Bill Condon",
  genres: ["Live-action", "Thần thoại", "Lãng mạn"],
  poster: "/assets/images/Beauty.jpg",
  trailer: "https://www.youtube.com/embed/pnkgw6pAKkM",
  description: `
Beauty and the Beast là câu chuyện cổ tích kinh điển được tái hiện dưới dạng live-action, xoay quanh Belle – một cô gái thông minh, yêu sách vở và luôn khao khát cuộc sống vượt ra ngoài khuôn khổ ngôi làng nhỏ bé.

Khi cha của Belle bị giam giữ trong lâu đài của Quái Thú, cô đã tự nguyện thay thế ông. Dần dần, Belle khám phá ra rằng đằng sau vẻ ngoài đáng sợ của Quái Thú là một tâm hồn cô độc và tổn thương, bị giam cầm bởi lời nguyền do chính sự ích kỷ trong quá khứ gây ra.

Bộ phim gửi gắm thông điệp về lòng nhân ái, sự thấu hiểu và tình yêu vượt qua vẻ bề ngoài. Beauty and the Beast không chỉ là một câu chuyện tình lãng mạn, mà còn là hành trình học cách yêu thương và được yêu thương đúng nghĩa.
  `.trim(),
}
  ];

const movie = movies.find((m) => m.id === Number(id));

if (!movie) {
  return <h2 style={{ color: "white" }}>Không tìm thấy phim</h2>;
}

return (
  <div className="md-page">
    <section className="md-top">
      <div className="md-left">
        <div className="md-posterWrap">
          <img
            className="md-poster"
            src={movie.poster}
            alt={movie.title}
          />
        </div>

        <div className="md-info">
          <h1 className="md-title">{movie.title}</h1>

          <div className="md-meta">
            <p><b>Thời lượng:</b> {movie.duration}</p>
            <p><b>Khởi chiếu:</b> {movie.release}</p>
            <p><b>Quốc gia:</b> {movie.country}</p>
            <p><b>Đạo diễn:</b> {movie.director}</p>
          </div>

          <div className="md-genres">
            {movie.genres.map((g) => (
              <span className="md-genre" key={g}>
                {g}
              </span>
            ))}
          </div>

          <button
            className="md-bookBtn"
            onClick={() =>
              navigate(`/booking?movieId=${movie.id}`)
            }
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