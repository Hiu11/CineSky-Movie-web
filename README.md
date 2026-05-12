# CineSky Movie Web

CineSky là web đặt vé xem phim gồm 2 phần:

- `Backend`: server API dùng Node.js, Express, MongoDB
- `Frontend`: giao diện người dùng dùng React

## 1. Cần Cài Trước

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

## 2. Clone Project

```bash
git clone https://github.com/Hiu11/CineSky-Movie-web.git
cd CineSky-Movie-web
```

## 3. Cấu Hình Backend

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

Mở file `Backend/.env` và kiểm tra các biến:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie-web-pro
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
SEED_ON_START=false
```

Nếu dùng MongoDB local, giữ:

```env
MONGO_URI=mongodb://localhost:27017/movie-web-pro
```

Nếu dùng MongoDB Atlas, thay `MONGO_URI` bằng connection string của Atlas.

Các dòng nên đổi sau khi clone:

- `JWT_SECRET`: tự đặt một chuỗi bí mật bất kỳ
- `JWT_REFRESH_SECRET`: tự đặt một chuỗi bí mật khác `JWT_SECRET`
- `MONGO_URI`: chỉ cần đổi nếu dùng MongoDB Atlas hoặc database khác

Chạy backend:

```bash
npm run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

## 4. Thêm Dữ Liệu Mẫu

Mở terminal trong thư mục `Backend`, chạy:

```bash
npm run seed
```

Lệnh này dùng để thêm dữ liệu mẫu như phim, suất chiếu, feedback, v.v.

Chỉ cần seed khi database chưa có dữ liệu hoặc muốn reset dữ liệu mẫu.

## 5. Cấu Hình Frontend

Mở terminal mới từ thư mục project, rồi chạy:

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

## 6. Thứ Tự Chạy Project

Nên chạy theo thứ tự này:

1. Bật MongoDB
2. Chạy backend bằng `npm run dev`
3. Seed dữ liệu bằng `npm run seed` nếu cần
4. Chạy frontend bằng `npm start`
5. Mở `http://localhost:3000`

## 7. Các Lệnh Hay Dùng

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

## 8. Các File Không Public Lên GitHub

Không commit các file/thư mục này:

- `.env`
- `node_modules/`
- `build/`
- `dist/`
- `*.log`

Chỉ commit file mẫu:

- `.env.example`

Lý do: file `.env` có thể chứa mật khẩu database, JWT secret hoặc API key.

## 9. Lỗi Thường Gặp

Nếu frontend không gọi được API:

- Kiểm tra backend đã chạy chưa
- Kiểm tra `Frontend/.env` có đúng `REACT_APP_API_BASE_URL=http://localhost:5000` chưa
- Sau khi sửa `.env`, tắt frontend và chạy lại `npm start`

Nếu backend không kết nối được database:

- Kiểm tra MongoDB đã bật chưa
- Kiểm tra `MONGO_URI` trong `Backend/.env`

Nếu thiếu thư viện:

```bash
npm install
```

Nếu port bị trùng:

- Backend mặc định dùng port `5000`
- Frontend mặc định dùng port `3000`
- Tắt app đang dùng port đó hoặc đổi port trong `.env`
