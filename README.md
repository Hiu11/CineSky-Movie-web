# CineSky Movie Web

CineSky là web đặt vé xem phim full-stack dùng React, Express và MongoDB.

## Tính năng chính

- Xem, tìm kiếm, lọc phim và xem chi tiết phim.
- Đăng ký, đăng nhập, quên mật khẩu, Google/Facebook OAuth.
- Đặt vé, chọn rạp, suất chiếu, ghế và xem lịch sử đặt vé.
- Favorite, review, feedback và thông báo.
- Admin dashboard quản lý phim, user, booking, feedback, check-in và analytics.

## Công nghệ

- Frontend: React 19, Vite, React Router, CSS.
- Backend: Node.js 20, Express, MongoDB, Mongoose.
- Auth: JWT, bcryptjs.
- Deploy: Vercel, MongoDB Atlas.

## Yêu cầu

- Node.js `20.x` hoặc mới hơn.
- npm.
- MongoDB local hoặc MongoDB Atlas.

## Chạy local

### 1. Backend

```bash
cd Backend
npm install
copy .env.example .env
npm run dev
```

Trên macOS/Linux, dùng:

```bash
cp .env.example .env
```

Backend chạy tại:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/v1/health
```

### 2. Seed dữ liệu mẫu

Chạy trong thư mục `Backend`:

```bash
npm run seed
```

Lệnh này thêm phim, suất chiếu, feedback, booking demo và dữ liệu dashboard admin.

### 3. Frontend

Mở terminal khác:

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

## Environment

Backend đọc cấu hình từ `Backend/.env`.

Các biến quan trọng:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie-web-pro
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
SEED_ON_START=false
ADMIN_EMAIL=review-admin@cinesky.local
ADMIN_PASSWORD=ReviewAdmin@2026
FRONTEND_URL=http://localhost:3000
BACKEND_PUBLIC_URL=http://localhost:5000
```

Frontend đọc cấu hình từ `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Sau khi đổi `.env`, hãy restart server tương ứng.

## Tài khoản admin local

Nếu giữ nguyên `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `Backend/.env`, backend sẽ tự tạo/cập nhật tài khoản admin khi start:

```text
Email: review-admin@cinesky.local
Password: ReviewAdmin@2026
```

File `.env.example` chỉ là mẫu. Mỗi người chạy local cần tự tạo `.env` riêng trên máy của mình.

## OAuth

Google/Facebook OAuth là tuỳ chọn. Nếu cần dùng, điền các biến sau trong `Backend/.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/v1/auth/facebook/callback
```

Nếu không cấu hình OAuth, app vẫn đăng nhập được bằng email/password.

## Deploy

Project đã có cấu hình Vercel:

- `Frontend/vercel.json` cho React Router.
- `Backend/vercel.json` cho Express API dạng serverless.
- Frontend cần `VITE_API_BASE_URL` trỏ tới backend deploy.
- Backend cần `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `BACKEND_PUBLIC_URL`.

Không đưa tài khoản admin thật, database URI hoặc OAuth secret lên GitHub.

## Lệnh thường dùng

Backend:

```bash
cd Backend
npm run dev
npm start
npm run seed
```

Frontend:

```bash
cd Frontend
npm run dev
npm run build
npm run preview
```

## Không commit

- `.env`
- `.env.*`
- `node_modules/`
- `dist/`
- `build/`
- `*.log`
- `Backend/public/uploads/`

Chỉ commit các file mẫu như `Backend/.env.example` và `Frontend/.env.example`.
