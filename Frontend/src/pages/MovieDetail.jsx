import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const movies = [
    {
      id: 201,
      title: "THỎ ƠI!!",
      duration: "127 phút",
      release: "10/02/2026",
      country: "Việt Nam",
      director: "Trấn Thành",
      genres: ["Tâm Lý", "Tình Cảm"],
      poster: "/assets/images/thỏ ơi.jpg",
      trailer: "https://www.youtube.com/embed/XMv1Zhj5TQg",
      description: `
Thỏ ơi!! (tiếng Anh: Bunnie!!) là một bộ phim điện ảnh Việt Nam ra mắt năm 2026 thuộc thể loại lãng mạn – giật gân – chính kịch do Trấn Thành làm đạo diễn, viết kịch bản và sản xuất, được lấy cảm hứng từ những câu chuyện tình yêu có thật, khai thác từ góc nhìn cá nhân của anh. Tác phẩm do HKFilm, Galaxy Studio và Trấn Thành Town hợp tác sản xuất. Với sự tham gia diễn xuất của các diễn viên gồm Pháo, Trấn Thành, Lyly, Vĩnh Đam, Văn Mai Hương và Quốc Anh, phim xoay quanh các mối quan hệ tình cảm phức tạp cùng những xung đột tâm lý giữa các nhân vật, với cao trào tập trung vào nhân vật Hải Linh và Nhật Hạ.

Thỏ ơi có buổi họp báo và giới thiệu vào ngày 21 tháng 1 tại Thành phố Hồ Chí Minh và có buổi ra mắt vào ngày 12 tháng 2 tại Thành phố Hồ Chí Minh và ngày 14 tháng 2 tại Hà Nội. Tác phẩm sau đó được công chiếu chính thức trên toàn quốc vào ngày 17 tháng 2 năm 2026, tức mùng 1 Tết Nguyên Đán Bính Ngọ.
      `.trim(),
    },
    {
      id: 202,
      title: "TIỂU YÊU QUÁI NÚI LÃNG LÃNG",
      duration: "118 phút",
      release: "23/01/2026",
      country: "Trung Quốc",
      director: "Shui Yu (Thủy Ngọc)",
      genres: ["Hoạt Hình"],
      poster: "/assets/images/tiểu yêu quái núi lãng lãng.jpg",
      trailer: "https://www.youtube.com/embed/D6vLPsyMSUY",
      description: `
Sau khi không thể cướp của một lữ khách, một con yêu quái cấp thấp là Heo tinh cố gắng tìm việc tại Đại Vương động, một vùng núi do một yêu quái quyền lực là đại vương Hổ tinh cai quản, với sự giúp đỡ của người bạn là yêu quái Cóc tinh. Chúng được giao công việc nặng nhọc là dùng giẻ chùi vạc để đại vương nấu thịt Đường Tam Tạng (Đường Tăng) đang trên đường sang Tây Thiên thỉnh kinh, mong được để miếng thịt thừa để ăn cho bất tử. Heo lấy lông cứng của mình để đánh bóng cái vạc, nhưng lại vô tình xóa mất dòng chữ thư pháp do lão tổ của Hổ đại vương để lại, và bị đuổi đánh khỏi núi.

Sau khi trốn thoát, Heo và Cóc nảy ra ý tưởng đi lấy kinh bằng cách cải trang thành đoàn thầy trò Đường Tăng để dễ bề xin ăn qua đường. Gia nhập cùng chúng là một con Chồn tinh lắm mồm và một con Khỉ Đột tinh hướng nội, nhút nhát. Cóc cải trang thành Đường Tăng, Heo thành Trư Bát Giới, Chồn thành Sa Ngộ Tĩnh, và Khỉ Đột thành Tôn Ngộ Không.

Cóc trên đường bị một tộc Cẩu tinh bắt cóc về động Song Cẩu định ăn thịt vì nghĩ rằng Cóc chính là Đường tăng. Khi những tiểu yêu còn lại đến động Song Cẩu, lũ Cẩu, vì sợ hãi trước việc Tôn Ngộ Không thật đã diệt hết yêu quái ở Đại Vương động, đã đãi cả nhóm một liệu trình spa trước khi cho họ đi tiếp.

Nhóm tiểu yêu trên đường đã tình cờ tới một thôn làng tên Bắc Trương đang bị một con Chuột thành tinh khủng bố và đã đánh bại con chuột đó. Sau đó, nhóm dừng chân tại quê nhà của Heo. Trong buổi tối nghỉ chân, cha của Heo đã dạy Chồn một bí thuật biến hình đặc biệt mang lại sức mạnh phi thường nhưng phải đánh đổi bằng yêu phép, khiến yêu quái trở lại hình dạng súc sinh vô tri sau khi thuật hết tác dụng. Trong khi đó, đoàn thầy trò Đường Tăng thật đến động của Cẩu tinh. Nghĩ rằng đoàn này là giả mạo, lũ Cẩu tinh quay ra tấn công và bị Ngộ Không thật tiêu diệt, chỉ chừa một con đau bụng không kịp ra ứng chiến.

Nhóm tiểu yêu quyết định dừng chân tại chùa Tiểu Lôi Âm, nơi đầy rẫy yêu quái do Hoàng My đại vương cầm đầu. Tưởng rằng đang đón Đường Tăng, Hoàng My và thuộc hạ đóng giả thành Phật và tùy tùng rồi dụ vào để ăn thịt. Cóc và Heo ban đầu đánh lừa được chúng, nhưng sau bị lộ tẩy và đuổi khỏi chùa. Nhóm tiểu yêu sau đó đi xin ăn ở một thôn có liên hệ với trưởng thôn làng Bắc Trương. Dân làng cầu xin nhóm tiểu yêu cứu con cái của họ khỏi bị bắt cóc và Heo đồng ý mà không nhận ra rằng kẻ chủ mưu bắt cóc là Hoàng My đã cho thuộc hạ theo đuôi chờ dân làng sơ hở. Nhóm đã cố gắng bảo vệ dân làng khỏi thuộc hạ của Hoàng My nhưng không thành, bị đánh đập và vạch trần là lừa đảo. Sau đó chúng cùng lũ trẻ trong thôn bị đưa vào chùa.

Hoàng My lên kế hoạch hiến tế lũ trẻ gồm mười đồng nam đồng nữ để có sức mạnh chiến đấu với nhóm của Đường Tăng. Trong khi đó tên phó tướng Cẩu còn sống chạy tới cảnh báo rằng "kẻ giả mạo" (nhóm thầy trò Đường Tăng thật) sắp đến. Hoàng My đề nghị nhóm tiểu yêu cơ hội ăn thịt Đường Tăng nếu chúng giúp hắn tế lũ trẻ. Khỉ Đột từ chối và bị đưa đi xử tử, Cóc và Heo chấp nhận, còn Chồn trốn thoát. Khỉ Đột bị giải đến một vách đá, nhưng tên phó tướng Cẩu leo lên và tấn công lính canh. Hắn bị đánh bại, nhưng đã tạo điều kiện Heo và Chồn khống chế lính canh. Heo, Chồn và Khỉ đột đánh cắp áo giáp của Hoàng My để giả dạng hắn ra lệnh cho lính canh giao lũ trẻ cho chúng, nhưng bị tên phó tướng của Hoàng My chất vấn. Cóc lừa hắn thả lũ trẻ đi và ở lại trong chùa.

Hoàng My phát hiện ra việc bị xổng lũ trẻ và dẫn binh đi truy sát nhóm tiểu yêu. Heo quyết định một mình đối đầu với Hoàng My và sử dụng bí thuật biến hình để trở thành một chiến binh mạnh mẽ, tiêu diệt toàn bộ binh lực của Hoàng My nhưng lại thất thế trước hắn.

Cóc lừa Hoàng My để đến gần Heo và sử dụng bí thuật. Cả hai hợp thể và chiến đấu với Hoàng My, nhưng vẫn bị hắn đánh bại. Khỉ đột và Chồn đến và cũng sử dụng bí thuật để hợp nhất với Heo và Cóc. Hoàng My bị đánh bại trở lại hình dạng tiểu đồng. Sau khi sử dụng bí thuật, nhóm tiểu yêu nằm chờ hoá lại thành súc sinh. Cả bốn hy vọng sẽ được hoá kiếp tốt đẹp hơn, nhưng cũng đều hài lòng với kiếp sống đã theo lối riêng của mình.

Đức Phật Di lặc hiện lên quở trách Hoàng My, vốn được phái xuống để thử thách Đường Tăng nhưng đã trở nên sa đoạ. Đức Phật trả lại sức mạnh cho hắn và sai hắn tiếp tục nhiệm vụ thử thách nhóm của Đường Tăng, nhưng nhắc rằng sau khi bị Đường Tăng đánh bại thì hắn sẽ phải về Thiên giới chịu phạt. Khi một tiểu đồng khác hỏi phải làm gì với bốn con súc sinh từng thành tinh kia, Đức Phật chỉ cười.

Bốn con tiểu yêu được nhân dân lập miếu thờ phụng, và Ngộ Không khi nghe danh đã bứt cho chúng 4 cọng lông giữ mạng.
      `.trim(),
    },
    {
      id: 203,
      title: "RUNNING MAN VIỆT NAM MÙA 3: CON RỐI TỰ DO",
      duration: "161 phút",
      release: "30/01/2026",
      country: "Việt Nam",
      director: "Kim Dong Wook",
      genres: ["Chương Trình Thực Tế"],
      poster: "/assets/images/running-man.jpg",
      trailer: "https://www.youtube.com/embed/uCXi2yUYpb8",
      description: `
Bộ phim đóng vai trò là phần kết cho cuộc đua kéo dài 15 tập của Running Man Vietnam 3: Chạy ngay đi, với chủ đề xuyên suốt là: "Tiền – Tài – Sắc – Danh".

Con rối tự do được xây dựng từ hình ảnh ẩn dụ về đời sống hiện đại, nơi con người không ngừng chạy theo những giá trị như tiền tài, danh vọng và sắc đẹp, đồng thời tự ràng buộc mình trong những áp lực vô hình. Phiên bản điện ảnh cũng kế thừa và mở rộng thông điệp xuyên suốt của mùa chương trình, nhấn mạnh giá trị của sự tự do – tự do suy nghĩ, tự do lựa chọn và tự do yêu thương. Trong phim, các nghệ sĩ hóa thân thành những chú hề, tham gia vào cuộc đua tìm kiếm các quả bóng Running Ball, với mục tiêu giành lấy danh hiệu Biểu tượng giải trí của mùa chương trình. Tuy khai thác những giới hạn và quy luật khắc nghiệt của cuộc chơi, tác phẩm không hướng đến góc nhìn bi quan, mà nhấn mạnh quyền lựa chọn của con người trong cách sống và cách bước đi của chính mình, qua đó truyền tải thông điệp: "Nếu đã là con rối, hãy là những con rối tự do".
      `.trim(),
    },
    {
      id: 1,
      title: "Avatar: Lửa Và Tro Tàn",
      duration: "197 phút",
      release: "12/12/2025",
      country: "Mỹ",
      director: "James Cameron",
      genres: ["Giả tưởng", "Hành động", "Phiêu lưu"],
      description: `
Sau những biến cố làm rung chuyển toàn bộ hành tinh Pandora trong phần trước, Avatar: Lửa Và Tro Tàn mở ra một chương mới đen tối, dữ dội và giàu chiều sâu cảm xúc hơn bao giờ hết. Bộ phim không chỉ tiếp tục khai thác cuộc chiến giữa con người và tộc Na'vi, mà còn đi sâu vào những mâu thuẫn nội tâm, sự đánh đổi của gia đình và câu hỏi về cái giá phải trả cho sự sinh tồn.

Jake Sully – giờ đây không chỉ là một chiến binh Na'vi mà còn là người cha, người chồng – buộc phải đối mặt với lựa chọn khó khăn nhất đời mình. Sau khi gia đình anh quyết định rời bỏ vùng biển Metkayina để tránh khỏi sự truy đuổi của loài người, họ phát hiện ra rằng mối đe dọa mới còn đáng sợ hơn cả quân đội Trái Đất.

Một tộc Na'vi cổ xưa, được mệnh danh là Ash Clan (Tộc Tro Tàn), sống tại những vùng đất núi lửa khắc nghiệt, bắt đầu lộ diện. Ash Clan không giống bất kỳ tộc Na'vi nào trước đây. Họ tin rằng Pandora cần phải “thanh lọc bằng lửa”, và sự tồn tại của con người lẫn những tộc Na'vi hòa hiếu khác đều là mối đe dọa với trật tự tự nhiên.

Trong khi đó, con người quay trở lại Pandora với công nghệ tiên tiến hơn, tàn bạo hơn. Đại tá Quaritch – dù đã “chết” – nay tồn tại trong một hình hài Avatar mới, mang trong mình ký ức cũ nhưng với bản năng sinh tồn và thù hận được khuếch đại. Hắn không chỉ muốn tiêu diệt Jake Sully, mà còn muốn chiếm quyền kiểm soát hoàn toàn Pandora để biến hành tinh này thành nơi sinh sống mới cho nhân loại.
      `.trim(),
      poster:
        "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
      trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
    },
    {
      id: 2,
      title: "Tử Chiến Trên Không",
      duration: "118 phút",
      release: "2024",
      country: "Mỹ",
      director: "Mark Williams",
      genres: ["Hành động", "Giật gân"],
      poster: "/assets/images/Tử chiến.jpg",
      trailer: "https://www.youtube.com/embed/VLS9xSsfxkQ",
      description: `
Một chuyến bay thương mại bị khống chế ở độ cao 10.000 mét. Không có nơi hạ cánh, không có cứu viện, mỗi quyết định đều mang tính sống còn. Trong khoang máy bay chật hẹp, căng thẳng và ngột ngạt, sự hoảng loạn lan nhanh khi hành khách bị đẩy vào tình thế không lối thoát.

Một cựu đặc vụ buộc phải đứng lên bảo vệ gia đình và hàng trăm hành khách. Cuộc chiến không chỉ là đối đầu với kẻ khủng bố, mà còn là cuộc chạy đua với thời gian, lòng tin và sự hy sinh. Tử Chiến Trên Không là câu chuyện về bản năng sinh tồn và lòng dũng cảm khi mọi thứ đều ở ranh giới mong manh.
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
Thor phải đối đầu Malekith – thủ lĩnh Dark Elves – kẻ muốn nhấn chìm vũ trụ vào bóng tối vĩnh viễn bằng sức mạnh Aether. Những cánh cổng giữa các thế giới dần sụp đổ, kéo theo hiểm họa lan rộng khắp Cửu Giới.

Trong hành trình bảo vệ Cửu Giới, Thor buộc phải hợp tác với Loki – người em trai vừa là đồng minh vừa là kẻ thù. Niềm tin và sự phản bội đan xen, đẩy Thor vào những lựa chọn khó khăn nhất. Bộ phim mở rộng vũ trụ Marvel với các trận chiến hoành tráng và xung đột nội tâm sâu sắc.
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
Lấy bối cảnh Hà Nội năm 1946, bộ phim kể về cuộc sống của những con người bình thường trong thời khắc lịch sử đầy biến động. Không có đại cảnh chiến tranh, câu chuyện tập trung vào những khoảnh khắc đời thường, những lựa chọn lặng thầm và sự hy sinh không phô trương.

Đào, Phở và Piano là bản tình ca buồn về Hà Nội, văn hóa và tinh thần dân tộc. Mỗi nhân vật là một lát cắt ký ức, gợi lên sự kiên cường và tình yêu quê hương trong thời khắc gian khó.
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

Bộ phim là bản tình ca buồn về thanh xuân, về những điều dang dở và câu hỏi muôn thuở: liệu yêu một người hết lòng có đủ để giữ họ ở lại?
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
Beauty and the Beast là câu chuyện cổ tích kinh điển được tái hiện dưới dạng live-action, xoay quanh Belle – một cô gái thông minh, yêu sách vở và luôn khao khát một cuộc sống vượt ra ngoài khuôn khổ ngôi làng nhỏ.

Khi cha của Belle bị giam giữ trong lâu đài của Quái Thú, cô đã tự nguyện thay thế ông. Dần dần, Belle khám phá ra rằng đằng sau vẻ ngoài đáng sợ của Quái Thú là một tâm hồn cô độc và tổn thương, bị giam cầm bởi lời nguyền do chính sự ích kỷ trong quá khứ gây ra.

Bộ phim gửi gắm thông điệp về lòng nhân ái, sự thấu hiểu và tình yêu vượt qua vẻ bề ngoài. Beauty and the Beast không chỉ là một câu chuyện tình lãng mạn, mà còn là hành trình học cách yêu thương và được yêu thương đúng nghĩa.
      `.trim(),
    },
    {
      id: 101,
      title: "TẾ LỄ QUỶ LINH NHI",
      duration: "86 phút",
      release: "Thứ Sáu, 13/02/2026",
      country: "Khác",
      director: "Jon Bell",
      genres: ["Kinh Dị", "Phụ Đề"],
      poster: "/assets/images/te-le-quy-linh-nhi.webp",
      trailer: "https://www.youtube.com/embed/VtLnDGnPw50",
      description: `
Sau khi chào đón đứa con thứ hai, một cặp vợ chồng trẻ tưởng chừng đang bước vào quãng thời gian hạnh phúc nhất của cuộc đời. Thế nhưng niềm vui ấy nhanh chóng biến thành cơn ác mộng khi Sarah, người mẹ, tin rằng một linh hồn tà ác đang rình rập và tìm cách bắt đi đứa con mới sinh của cô.

Fergus, chồng Sarah, cố gắng tin tưởng vợ mình. Nhưng khi những biểu hiện bất ổn của Sarah ngày càng nghiêm trọng, ranh giới giữa nỗi sợ siêu nhiên và sự sụp đổ tâm lý dần trở nên mơ hồ, khiến anh không khỏi hoang mang và bất an. Liệu Sarah thực sự đang bị một linh hồn tà ác đe dọa… Hay chính những ám ảnh trong tâm trí cô mới là mối nguy hiểm lớn nhất đối với sự an toàn của gia đình?
      `.trim(),
    },
    {
      id: 102,
      title: "MÙI PHỞ (K)",
      duration: "111 phút",
      release: "Thứ Ba, 17/02/2026",
      country: "Việt Nam",
      director: "Minh Beta",
      genres: ["Tình Cảm", "Gia đình"],
      poster: "/assets/images/mui-pho.webp",
      trailer: "https://www.youtube.com/embed/7L5qkIkkcY8",
      description: `
Câu chuyện về sự xung đột thế hệ và những va chạm giữa quan niệm cũ và lối sống hiện đại, xoay quanh món Phở - biểu tượng ẩm thực Việt. Đằng sau những mâu thuẫn và tranh cãi ấy, từng bí mật dần được hé lộ, mở ra hành trình tìm lại sự ấm áp của tình thân qua những tình tiết hài hước, dí dỏm và đầy duyên dáng.
      `.trim(),
    },
    {
      id: 103,
      title: "QUỶ NHẬP TRÀNG 2",
      duration: "99 phút",
      release: "Thứ Sáu, 06/03/2026",
      country: "Việt Nam",
      director: "Pom Nguyễn",
      genres: ["Kinh Dị"],
      poster: "/assets/images/quy-nhap-trang-main.webp",
      trailer: "https://www.youtube.com/embed/q0UWKBzFFxQ",
      description: `
Quỷ Nhập Tràng 2 là tiền truyện của nhân vật Minh Như, trở về xưởng nhuộm gia đình sau nhiều năm bị xua đuổi. Tại đây, cô phải đối mặt với những hiện tượng ma quái cùng sự thật tàn khốc về cái chết của mẹ và giao ước đẫm máu năm xưa. Ác giả ác báo, liệu Minh Như có thoát khỏi vòng vây của quỷ dữ?
      `.trim(),
    },
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
            <img className="md-poster" src={movie.poster} alt={movie.title} />
          </div>

          <div className="md-info">
            <h1 className="md-title">{movie.title}</h1>

            <div className="md-meta">
              <p>
                <b>Thời lượng:</b> {movie.duration}
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
              {movie.genres.map((g) => (
                <span className="md-genre" key={g}>
                  {g}
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
