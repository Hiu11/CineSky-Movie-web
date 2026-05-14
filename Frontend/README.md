# CineSky Frontend

Frontend của CineSky Movie Web, xây bằng React 19, React Router 6 và React Scripts. Phần này phụ trách giao diện xem phim, tìm kiếm/lọc phim, chi tiết phim, đăng nhập/đăng ký, profile, đặt vé, lịch sử booking, feedback và Admin Dashboard.

## Cài đặt

```bash
npm install
copy .env.example .env
```

Nếu dùng macOS/Linux:

```bash
cp .env.example .env
```

`Frontend/.env` cần trỏ tới backend:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

## Chạy local

```bash
npm start
```

Hoặc:

```bash
npm run dev
```

Ứng dụng chạy tại `http://localhost:3000`.

## Script chính

- `npm start`: chạy frontend ở chế độ development.
- `npm run dev`: alias của `npm start`.
- `npm run build`: build production vào thư mục `build`.
- `npm test`: chạy test theo cấu hình React Scripts.

## Ghi chú

- Backend cần chạy trước ở `http://localhost:5000` nếu dùng cấu hình mặc định.
- Sau khi đổi `REACT_APP_API_BASE_URL`, cần tắt và chạy lại frontend.
- OAuth, JWT, database và seed data được cấu hình ở thư mục `Backend`.
