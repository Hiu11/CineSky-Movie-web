
<div align="center">
  <img src="https://img.shields.io/badge/MERN_Stack-Project-blue?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <h1>🎬 CineSky Movie Ticket Booking</h1>
  <p>Hệ thống đặt vé xem phim toàn diện với kiến trúc Micro-services cơ bản, quản trị rạp chiếu và hỗ trợ AI Assistant.</p>
</div>

---

## ⚡ Tính năng nổi bật (Key Features)

### 🧑‍💻 Dành cho Khách hàng (Client-side)
- **Xác thực & Bảo mật:** Đăng nhập/Đăng ký qua JWT Token (Access & Refresh Tokens), hỗ trợ mã hóa mật khẩu bcrypt.
- **Trải nghiệm mượt mà:** Giao diện đặt vé thời gian thực, chọn ghế tương tác trực quan.
- **Tích hợp thanh toán:** Mô phỏng quy trình thanh toán vé qua cổng nội bộ an toàn.
- **AI Chatbot:** Tích hợp trợ lý ảo AI hỗ trợ tìm phim và lịch chiếu nhanh chóng.

### 🛡️ Dành cho Quản trị viên (Admin Dashboard)
- **CMS Đa năng:** Quản lý Phim, Cụm rạp, Lịch chiếu và Khuyến mãi.
- **Dashboard Thống kê:** Biểu đồ doanh thu trực quan, theo dõi lượng vé bán ra theo thời gian thực.
- **Support System:** Hệ thống Admin Support Chat View để giải đáp khách hàng trực tiếp.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend (User & Admin Interface)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)

### Backend (RESTful API Server)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)

---

## 🚀 Hướng dẫn cài đặt (Local Setup)

Để chạy dự án CineSky trên máy cá nhân, yêu cầu máy tính đã cài đặt **Node.js (v18+)** và **MongoDB**.

### 1. Cài đặt Backend
```bash
cd Backend
npm install
```
Tạo file `.env` trong thư mục `Backend` và cấu hình các biến sau:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Khởi chạy Server:
```bash
npm run dev
```

### 2. Cài đặt Frontend
```bash
cd Frontend
npm install
```
Tạo file `.env` trong thư mục `Frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```
Khởi chạy giao diện:
```bash
npm run dev
```

---

## 📁 Kiến trúc thư mục (Folder Structure)

```text
CineSky-Movie-web/
├── Backend/                 # Mã nguồn ExpressJS Server
│   ├── controllers/         # Xử lý logic API
│   ├── models/              # MongoDB Schema
│   ├── routes/              # Khai báo Endpoints
│   └── middlewares/         # JWT Auth, Error Handler
├── Frontend/                # Mã nguồn ReactJS (Vite)
│   ├── src/
│   │   ├── components/      # UI components tái sử dụng
│   │   ├── pages/           # Client & Admin pages
│   │   └── services/        # Axios API Client
└── README.md                # Tài liệu dự án
```

---
<div align="center">
  <i>Được phát triển với ❤️ và sự tỉ mỉ.</i>
</div>
