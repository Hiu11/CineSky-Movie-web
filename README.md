# CineSky Movie Web

CineSky là ứng dụng web đặt vé xem phim full-stack được xây dựng bằng React, Vite, Node.js, Express và MongoDB. Dự án hỗ trợ luồng đặt vé cho khách hàng, xác thực tài khoản, khuyến mãi, thông báo, đánh giá, chat hỗ trợ và trang quản trị dành cho vận hành rạp phim.

## Demo

- Frontend: [https://cine-sky-fe.vercel.app](https://cine-sky-fe.vercel.app)
- Trang admin: `/admin`
- GitHub: [https://github.com/Hiu11/CineSky-Movie-web](https://github.com/Hiu11/CineSky-Movie-web)

## Hướng dẫn trải nghiệm nhanh

- **Trang chủ:** xem phim nổi bật, phim đang chiếu, phim sắp chiếu và tin tức điện ảnh.
- **Chi tiết phim:** xem poster, trailer, mô tả, thời lượng, thể loại, lịch chiếu và đánh giá.
- **Đặt vé:** chọn phim, rạp, ngày chiếu, suất chiếu, ghế ngồi, combo bắp nước và voucher.
- **Thanh toán:** giữ ghế tạm thời, đếm ngược thời gian thanh toán và mô phỏng thanh toán.
- **Vé điện tử:** hiển thị vé sau khi đặt thành công, hỗ trợ xem lại trong lịch sử đặt vé.
- **Tài khoản:** cập nhật hồ sơ, xem hạng thành viên, lưu phim yêu thích và nhận thông báo.
- **Hỗ trợ:** gửi phản hồi, chat với bộ phận hỗ trợ và chuyển tiếp hội thoại sang admin khi cần.
- **AI trợ lý CineSky:** hỏi AI thật về phim, đặt vé, ưu đãi, membership và trải nghiệm đi xem phim.
- **Admin:** quản lý phim, người dùng, đơn đặt vé, khuyến mãi, phản hồi, check-in vé, hội thoại hỗ trợ, nhật ký hoạt động và thống kê.

## Tính năng chính

- Xem danh sách phim, tìm kiếm, lọc phim và xem chi tiết phim kèm trailer.
- Đăng ký, đăng nhập, quên/đặt lại mật khẩu, xác thực JWT, đăng nhập Google OAuth và Facebook OAuth.
- Chọn rạp, suất chiếu, ghế, combo bắp nước, voucher và phương thức thanh toán mô phỏng.
- Giữ ghế tạm thời, đếm ngược thời gian thanh toán, khôi phục đơn đặt vé đang dở và hiển thị vé điện tử.
- Xem lịch sử đặt vé, hủy vé, cập nhật hạng thành viên, yêu thích phim, đánh giá phim, nhận khuyến mãi và thông báo.
- Gửi phản hồi và chat hỗ trợ khách hàng, có thể chuyển tiếp sang admin.
- AI trợ lý CineSky bằng Gemini API hoặc OpenAI API, sử dụng catalog phim, ưu đãi và dữ liệu tài khoản khi có.
- Trang quản trị cho phim, người dùng, đơn đặt vé, khuyến mãi, phản hồi, check-in vé, hội thoại hỗ trợ, nhật ký hoạt động và thống kê.

## Công nghệ sử dụng

### Frontend

- React 19
- Vite
- React Router
- CSS / Tailwind CSS
- Lottie
- QRCode / JsBarcode

### Backend

- Node.js 20
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Joi
- CORS
- express-rate-limit

### Triển khai

- Vercel
- MongoDB Atlas

## Cấu trúc dự án

```text
CineSky-Movie web/
|-- Backend/
|   |-- api/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- data/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- scripts/
|   |   `-- services/
|   `-- package.json
|-- Frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- config/
|   |   |-- data/
|   |   |-- pages/
|   |   `-- services/
|   `-- package.json
`-- README.md
```

## Yêu cầu

- Node.js `20.19.x` trở lên
- npm
- MongoDB local hoặc MongoDB Atlas

## Chạy dự án ở local

### 1. Backend

```bash
cd Backend
npm install
```

Tạo file môi trường trên Windows:

```powershell
Copy-Item .env.example .env
```

Tạo file môi trường trên macOS/Linux:

```bash
cp .env.example .env
```

Chạy backend:

```bash
npm run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

Kiểm tra trạng thái API:

```text
http://localhost:5000/api/v1/health
```

### 2. Tạo dữ liệu demo

Chạy trong thư mục `Backend`:

```bash
npm run seed
```

Lệnh này tạo dữ liệu mẫu cho phim, suất chiếu, phản hồi, đơn đặt vé demo và dữ liệu thống kê cho trang quản trị.

### 3. Frontend

Mở một terminal khác:

```bash
cd Frontend
npm install
```

Tạo file môi trường trên Windows:

```powershell
Copy-Item .env.example .env
```

Tạo file môi trường trên macOS/Linux:

```bash
cp .env.example .env
```

Chạy frontend:

```bash
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

## Biến môi trường

Backend sử dụng file `Backend/.env`:

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
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=your_openai_api_key_optional
OPENAI_MODEL=gpt-4o-mini
```

Frontend sử dụng file `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

Sau khi thay đổi `.env`, cần khởi động lại server tương ứng.

## Tài khoản admin local

Nếu giữ nguyên `ADMIN_EMAIL` và `ADMIN_PASSWORD` mặc định, backend sẽ tự tạo hoặc cập nhật tài khoản admin này khi khởi động:

```text
Email: review-admin@cinesky.local
Password: ReviewAdmin@2026
```

## OAuth

Google/Facebook OAuth là tùy chọn. Nếu cần sử dụng, thêm các biến sau vào `Backend/.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/v1/auth/facebook/callback
```

Ứng dụng vẫn hỗ trợ đăng nhập bằng email/mật khẩu khi chưa cấu hình OAuth.

## AI trợ lý CineSky

- AI chat dùng endpoint backend `POST /api/v1/chats/ai/recommend`.
- Backend đọc catalog phim, ưu đãi, lịch sử đặt vé, phim yêu thích, review/rating và membership rồi gọi Gemini API.
- AI hỗ trợ trong phạm vi CineSky: phim, lịch chiếu, đặt vé, chọn ghế, combo, voucher, membership và trải nghiệm đi xem phim.
- Các câu cần kiểm tra giao dịch, hoàn tiền hoặc khiếu nại nên được chuyển sang admin.
- Nếu có cả `GEMINI_API_KEY` và `OPENAI_API_KEY`, backend sẽ ưu tiên Gemini.
- OpenAI API được giữ làm fallback nếu không cấu hình Gemini.
- Frontend không lưu API key, chỉ gửi câu hỏi của người dùng về backend.
- Nếu chưa cấu hình `GEMINI_API_KEY` hoặc `OPENAI_API_KEY`, khung chat vẫn hoạt động với câu hỏi nhanh và chuyển tiếp admin như cũ.
- Khi deploy, thêm `GEMINI_API_KEY` và `GEMINI_MODEL` vào biến môi trường của backend.

## Các script thường dùng

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

## Ghi chú triển khai

Dự án đã có cấu hình Vercel:

- `Frontend/vercel.json` dùng cho React Router fallback.
- `Backend/vercel.json` dùng cho Express serverless API.
- Frontend cần `VITE_API_BASE_URL` và `VITE_API_URL` trỏ đến backend đã deploy.
- Backend cần `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `BACKEND_PUBLIC_URL` và `GEMINI_API_KEY` nếu bật AI chat.

Không commit tài khoản admin thật, URI database, OAuth secret hoặc biến môi trường production.

## Không commit các file/thư mục sau

- `.env`
- `.env.*`
- `node_modules/`
- `dist/`
- `build/`
- `*.log`
- `Backend/public/uploads/`

Chỉ commit các file môi trường mẫu như `Backend/.env.example` và `Frontend/.env.example`.
