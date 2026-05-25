/**
 * Danh sách phim "spotlight" được ghim thủ công để ưu tiên hiển thị trên HomePage.
 *
 * Đây là giải pháp tạm thời:
 *   - Khi backend cung cấp field `isFeatured` hoặc `heroOrder` thông qua API,
 *     hãy xóa file này và fetch trực tiếp từ API.
 *   - Thay vì hardcode vào HomePage.jsx, tách ra file riêng giúp quản lý dễ hơn.
 *
 * Format mỗi entry:
 *   { id: <legacyId>, slug: <movie-slug>, title: <tên hiển thị> }
 */
const SPOTLIGHT_MOVIES = [
  { id: 204, slug: "mua-do-2025", title: "MƯA ĐỎ" },
  { id: 205, slug: "thu-cuoi-2025", title: "THÚ CƯỠI" },
  { id: 206, slug: "long-vuong-2025", title: "LONG VƯƠNG" },
  { id: 207, slug: "hanh-tinh-khi-2024", title: "HÀNH TINH KHỈ" },
];

export default SPOTLIGHT_MOVIES;
