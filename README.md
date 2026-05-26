# CineSky Movie Web

CineSky là dự án web đặt vé xem phim full-stack, phục vụ học tập và portfolio. Phiên bản hiện tại đã được cấu hình để demo/deploy trên Vercel, đồng thời vẫn có thể chạy local để phát triển.

- `Backend`: Node.js 20, Express, MongoDB, Mongoose, Vercel Serverless Function
- `Frontend`: React 19, React Router 6, Vite, CSS custom
- `Auth`: JWT, bcryptjs, đăng nhập email/password, Google OAuth, Facebook OAuth
- `Database`: MongoDB local khi phát triển hoặc MongoDB Atlas khi deploy

## 1. Trạng thái hiện tại

Project hiện hỗ trợ 2 môi trường:

- Local frontend: `http://localhost:3000`
- Local backend API: `http://localhost:5000`
- Production/demo: frontend và backend deploy riêng trên Vercel
- Database deploy: MongoDB Atlas

Các chức năng chính đã có:

- Xem danh sách phim, tìm kiếm, lọc phim theo nhu cầu
- Xem chi tiết phim, poster, trailer, thông tin phim và phim liên quan
- Đăng ký, đăng nhập, quên mật khẩu, Google/Facebook OAuth
- Hồ sơ người dùng, cập nhật thông tin cá nhân
- Đặt vé, chọn rạp/phòng/suất chiếu/ghế, xem trang đặt vé thành công
- Lịch sử đặt vé, vé điện tử, mã QR/barcode mô phỏng
- Review, favorite, feedback và thông báo
- Admin dashboard quản lý phim, user, booking, feedback, check-in, analytics và thùng rác phim
- Seed dữ liệu phim, suất chiếu, tài khoản admin và dữ liệu demo

Các phần còn ở mức demo/mô phỏng:

- Thanh toán thật qua cổng thanh toán
- Hoàn/hủy vé đầy đủ theo nghiệp vụ rạp thật
- Một số module admin nâng cao như cinema/showtime/payment/activity chưa CRUD sâu hoàn toàn
- Test tự động và hardening bảo mật production

## 2. Cài đặt yêu cầu

- Node.js `^20.19.0` hoặc `>=22.12.0` cho frontend Vite 7
- Node.js `20.x` cho backend
- npm
- MongoDB local hoặc MongoDB Atlas
- Git

Kiểm tra Node và npm:

```bash
node -v
npm -v
```

## 3. Clone project

```bash
git clone https://github.com/Hiu11/CineSky-Movie-web.git
cd CineSky-Movie-web
```

Khuyến nghị bật Git hook để tránh commit nhầm `.env` hoặc secret:

```bash
git config core.hooksPath .githooks
```

## 4. Cấu hình backend

```bash
cd Backend
npm install
copy .env.example .env
```

Nếu dùng macOS/Linux:

```bash
cp .env.example .env
```

Các biến quan trọng trong `Backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie-web-pro
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
SEED_ON_START=false
FRONTEND_URL=http://localhost:3000
BACKEND_PUBLIC_URL=http://localhost:5000
```

Khi deploy backend lên Vercel, cấu hình Environment Variables tương ứng:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_production_access_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
FRONTEND_URL=https://your-frontend-vercel-domain.vercel.app
BACKEND_PUBLIC_URL=https://your-backend-vercel-domain.vercel.app
SEED_ON_START=false
```

Backend cũng hỗ trợ `FRONTEND_URLS` nếu cần whitelist nhiều domain frontend, ví dụ domain production và preview.

## 5. OAuth Google/Facebook

Backend cần các biến:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/v1/auth/facebook/callback
```

Redirect URI khi deploy:

```text
Google: https://your-backend-vercel-domain.vercel.app/api/v1/auth/google/callback
Facebook: https://your-backend-vercel-domain.vercel.app/api/v1/auth/facebook/callback
```

Lưu ý:

- Không commit OAuth secret hoặc `.env` thật lên GitHub.
- Nếu Google OAuth app ở chế độ Testing, chỉ test users được thêm mới đăng nhập được.
- Nếu Facebook app ở chế độ Development, chỉ admin/dev/tester của app mới đăng nhập được.
- Facebook OAuth hiện chỉ xin `public_profile`, chưa xin `email`, để tránh lỗi quyền `email` khi app chưa được Meta xét duyệt.

## 6. Chạy backend local

```bash
cd Backend
npm run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/v1/health
```

## 7. Seed dữ liệu mẫu

Trong thư mục `Backend`:

```bash
npm run seed
```

Lệnh này thêm dữ liệu mẫu như phim, suất chiếu, feedback, booking demo và dữ liệu dashboard admin. Chỉ cần chạy khi database mới hoặc khi muốn đồng bộ lại dữ liệu demo.

## 8. Cấu hình frontend

```bash
cd Frontend
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

`Frontend/.env` hoặc Environment Variables trên Vercel khi deploy:

```env
VITE_API_BASE_URL=https://your-backend-vercel-domain.vercel.app
```

Sau khi đổi `VITE_API_BASE_URL`, cần tắt và chạy lại frontend/dev server.

## 9. Chạy frontend local

```bash
cd Frontend
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

## 10. Thứ tự chạy local

1. Bật MongoDB local hoặc chuẩn bị MongoDB Atlas URI.
2. Chạy backend bằng `npm run dev`.
3. Seed dữ liệu bằng `npm run seed` nếu cần.
4. Chạy frontend bằng `npm run dev`.
5. Mở `http://localhost:3000`.

## 11. Deploy hiện tại

Project đã có cấu hình deploy Vercel:

- `Frontend/vercel.json`: rewrite mọi route về `index.html` để React Router hoạt động khi reload trang.
- `Backend/vercel.json`: rewrite request về `Backend/api/index.js`.
- `Backend/api/index.js`: bootstrap database, đảm bảo admin account nếu có env admin, seed dữ liệu khi `SEED_ON_START=true`, sau đó chuyển request vào Express app.
- `Backend/src/app.js`: cấu hình CORS cho local và các domain Vercel của frontend.

Checklist deploy:

- Frontend Vercel project trỏ vào thư mục `Frontend`.
- Backend Vercel project trỏ vào thư mục `Backend`.
- Frontend có `VITE_API_BASE_URL` trỏ tới domain backend đã deploy.
- Backend có `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `BACKEND_PUBLIC_URL`.
- OAuth redirect URI trong Google Cloud/Meta Developers trỏ về backend deploy.
- Không bật `SEED_ON_START=true` lâu dài trên production nếu không cần seed mỗi lần cold start.

## 12. Các lệnh hay dùng

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

## 13. File không public lên GitHub

Không commit:

- `.env`
- `.env.*`
- `node_modules/`
- `build/`
- `dist/`
- `*.log`
- `Backend/public/uploads/`

Chỉ commit file mẫu:

- `.env.example`
- `Backend/.env.example`
- `Frontend/.env.example`

Lý do: `.env` có thể chứa database URI, JWT secret, OAuth secret hoặc mật khẩu admin.

## 14. Lỗi thường gặp

Nếu frontend không gọi được API:

- Kiểm tra backend đã chạy/deploy chưa.
- Kiểm tra `Frontend/.env` hoặc Vercel env có đúng `VITE_API_BASE_URL` chưa.
- Sau khi sửa env, restart frontend hoặc redeploy Vercel.
- Kiểm tra CORS backend đã whitelist đúng frontend domain chưa.

Nếu backend báo port `5000` bị chiếm:

- Tắt terminal backend cũ.
- Hoặc đổi `PORT=5001` trong `Backend/.env`.
- Nếu đổi backend port, đổi cả `VITE_API_BASE_URL` ở frontend.

Nếu backend không kết nối database:

- Kiểm tra MongoDB local đã bật chưa.
- Kiểm tra `MONGO_URI` trong `Backend/.env` hoặc Vercel Environment Variables.
- Nếu dùng Atlas, kiểm tra network access/IP whitelist và user/password.

Nếu Google/Facebook login báo chưa cấu hình:

- Kiểm tra OAuth client id/secret trong backend env.
- Restart backend hoặc redeploy sau khi sửa env.
- Kiểm tra redirect URI trong Google Cloud/Meta Developers.
