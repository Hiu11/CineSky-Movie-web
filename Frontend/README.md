# CineSky Frontend

Frontend của CineSky Movie Web, xây bằng React 19, React Router 6 và Vite.

## Cài đặt

```bash
npm install
copy .env.example .env
```

Nếu dùng macOS/Linux:

```bash
cp .env.example .env
```

`Frontend/.env` khi chạy local:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Khi deploy trên Vercel, thêm Environment Variable:

```env
VITE_API_BASE_URL=https://your-backend-vercel-domain.vercel.app
```

## Chạy local

```bash
npm run dev
```

Ứng dụng chạy tại `http://localhost:3000`.

## Build và preview

```bash
npm run build
npm run preview
```

## Deploy hiện tại

- Frontend dùng `vercel.json` để rewrite tất cả route về `index.html`, giúp reload trực tiếp các route như `/about`, `/booking-history`, `/admin` không bị 404.
- API base URL được đọc từ `VITE_API_BASE_URL` trong `src/config/api.js`.
- Backend cần bật CORS cho domain frontend deploy.

## Script chính

- `npm start`: chạy frontend ở chế độ development.
- `npm run dev`: chạy frontend ở chế độ development.
- `npm run build`: build production vào thư mục `dist`.
- `npm run preview`: xem thử bản production build.

## Ghi chú

- Cần dùng Node `^20.19.0` hoặc `>=22.12.0` để chạy Vite 7.
- Backend cần chạy trước ở `http://localhost:5000` nếu dùng cấu hình local mặc định.
- Sau khi đổi `VITE_API_BASE_URL`, cần tắt và chạy lại frontend hoặc redeploy trên Vercel.
- OAuth, JWT, database và seed data được cấu hình ở thư mục `Backend`.
