# CineSky Movie Web

CineSky là dự án web đặt vé xem phim full-stack, phục vụ học tập và portfolio. Dự án hiện được thiết kế để chạy local, chưa deploy production.

- `Backend`: Node.js, Express, MongoDB, Mongoose
- `Frontend`: React, React Router, CSS custom
- `Auth`: JWT, bcryptjs, đăng nhập email/password, Google OAuth, Facebook OAuth

## 1. Trạng Thái Dự Án

Project hiện chạy local với:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Database: MongoDB local hoặc MongoDB Atlas

Các chức năng chính đã có:

- Xem danh sách phim, tìm kiếm, lọc phim
- Xem chi tiết phim, trailer, thông tin phim
- Đăng ký, đăng nhập, đăng nhập Google/Facebook
- Hồ sơ người dùng, upload avatar
- Đặt vé, chọn ghế, xem lịch sử đặt vé
- Feedback, review/favorite
- Admin dashboard quản lý phim, user, booking và thùng rác phim

Các phần còn ở mức mô phỏng/chưa production:

- Thanh toán thật
- Hoàn/hủy vé đầy đủ
- Kiểm thử tự động
- Deploy production
- Bảo mật production nâng cao

## 2. Cần Cài Trước

Trước khi chạy project, máy cần có:

- Node.js 18 trở lên
- npm
- MongoDB local hoặc MongoDB Atlas
- Git

Kiểm tra Node và npm:

```bash
node -v
npm -v
```

## 3. Clone Project

```bash
git clone https://github.com/Hiu11/CineSky-Movie-web.git
cd CineSky-Movie-web
```

Khuyến nghị bật Git hook để chặn commit nhầm `.env` hoặc secret:

```bash
git config core.hooksPath .githooks
```

## 4. Cấu Hình Backend

Vào thư mục backend:

```bash
cd Backend
npm install
```

Tạo file `.env` từ file mẫu:

```bash
copy .env.example .env
```

Nếu dùng macOS/Linux:

```bash
cp .env.example .env
```

Mở `Backend/.env` và kiểm tra các biến quan trọng:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-web-pro
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
BACKEND_PUBLIC_URL=http://localhost:5000
```

Nếu dùng MongoDB local, giữ:

```env
MONGODB_URI=mongodb://localhost:27017/movie-web-pro
```

Nếu dùng MongoDB Atlas, thay `MONGODB_URI` bằng connection string Atlas.

Các dòng nên đổi sau khi clone:

- `JWT_SECRET`: tự đặt chuỗi bí mật dài, khó đoán
- `JWT_REFRESH_SECRET`: tự đặt chuỗi khác `JWT_SECRET`
- `ADMIN_PASSWORD`: đổi mật khẩu admin mặc định nếu có dùng admin
- `MONGODB_URI`: đổi nếu dùng Atlas hoặc database khác

## 5. Google/Facebook Login

Người clone project không đăng nhập Google/Facebook được ngay nếu chưa tự tạo OAuth app và điền key vào `.env`.

Backend cần các biến:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

Redirect URI khi chạy local:

```text
Google: http://localhost:5000/api/v1/auth/google/callback
Facebook: http://localhost:5000/api/v1/auth/facebook/callback
```

Lưu ý:

- Không tự nghĩ ra các giá trị OAuth, phải lấy từ Google Cloud Console và Meta/Facebook Developers.
- Không commit `.env` thật lên GitHub.
- Nếu Google OAuth app đang ở chế độ Testing, chỉ test users được thêm mới login được.
- Nếu Facebook app đang ở chế độ Development, chỉ admin/dev/tester của app mới login được.
- Code Facebook hiện chỉ xin `public_profile`, không xin `email`, để tránh lỗi quyền `email` khi app chưa được Meta xét duyệt.

## 6. Chạy Backend

Trong thư mục `Backend`:

```bash
npm run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

## 7. Thêm Dữ Liệu Mẫu

Mở terminal trong thư mục `Backend`, chạy:

```bash
npm run seed
```

Lệnh này dùng để thêm dữ liệu mẫu như phim, suất chiếu, feedback, v.v.

Chỉ cần seed khi database chưa có dữ liệu hoặc muốn reset dữ liệu mẫu.

## 8. Cấu Hình Frontend

Mở terminal mới từ thư mục project:

```bash
cd Frontend
npm install
```

Tạo file `.env`:

```bash
copy .env.example .env
```

Nếu dùng macOS/Linux:

```bash
cp .env.example .env
```

File `Frontend/.env` cần có:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

Chạy frontend:

```bash
npm start
```

Frontend chạy tại:

```text
http://localhost:3000
```

## 9. Thứ Tự Chạy Project

Nên chạy theo thứ tự:

1. Bật MongoDB
2. Chạy backend bằng `npm run dev`
3. Seed dữ liệu bằng `npm run seed` nếu cần
4. Chạy frontend bằng `npm start`
5. Mở `http://localhost:3000`

## 10. Deploy Sau Này

Dự án hiện chưa deploy production. Nếu deploy, cần đổi các URL local sang domain thật.

Ví dụ:

```env
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_PUBLIC_URL=https://your-backend-domain.com
REACT_APP_API_BASE_URL=https://your-backend-domain.com
```

Redirect URI OAuth khi deploy:

```text
Google: https://your-backend-domain.com/api/v1/auth/google/callback
Facebook: https://your-backend-domain.com/api/v1/auth/facebook/callback
```

Khi deploy:

- Điền secret trong Environment Variables của hosting, không commit `.env`
- Đổi `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_PASSWORD`
- Dùng HTTPS
- Chỉ whitelist đúng redirect URI của domain thật

## 11. Các Lệnh Hay Dùng

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
npm start
npm run build
```

## 12. File Không Public Lên GitHub

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

Project có pre-commit hook trong `.githooks/pre-commit` để chặn commit nhầm `.env` và các key nhạy cảm. Sau khi clone, chạy lệnh dưới đây một lần để bật hook:

```bash
git config core.hooksPath .githooks
```

## 13. Lỗi Thường Gặp

Nếu frontend không gọi được API:

- Kiểm tra backend đã chạy chưa
- Kiểm tra `Frontend/.env` có đúng `REACT_APP_API_BASE_URL=http://localhost:5000` chưa
- Sau khi sửa `.env`, tắt frontend và chạy lại `npm start`

Nếu backend báo port `5000` bị chiếm:

- Tắt terminal backend cũ
- Hoặc đổi `PORT=5001` trong `Backend/.env`
- Nếu đổi backend port, cũng đổi `REACT_APP_API_BASE_URL` ở frontend

Nếu backend không kết nối được database:

- Kiểm tra MongoDB đã bật chưa
- Kiểm tra `MONGODB_URI` trong `Backend/.env`

Nếu Google/Facebook login báo chưa cấu hình:

- Kiểm tra đã điền OAuth client id/secret trong `Backend/.env`
- Restart backend sau khi sửa `.env`
- Kiểm tra redirect URI trong Google Cloud/Meta Developers
