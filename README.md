# Cinema Management System (Web Đặt Vé Xem Phim)

Dự án website quản lý rạp chiếu phim và đặt vé online.
**Công nghệ:** ReactJS, Node.js (Express), SQL Server (MSSQL).

---

## 1. Yêu cầu cài đặt (Prerequisites)

Trước khi chạy dự án, máy tính cần cài đặt:
- **Node.js** (v14 trở lên).
- **SQL Server 2019/2022** (Express hoặc Developer Edition).
- **SQL Server Management Studio (SSMS)**.
- **Git**.

---

## 2. Cài đặt Database (SQL Server)

### Bước 1: Tạo Database
1. Mở **SSMS** và kết nối vào SQL Server.
2. Mở file script tại đường dẫn: `backend/database/CinemaDB.sql`.
3. Nhấn **Execute (F5)** để chạy script. Database `CinemaDB` sẽ được tạo tự động.

### Bước 2: Cấu hình User & TCP/IP (Bắt buộc)
Để Node.js kết nối được với SQL Server, cần thực hiện:

1. **Bật User sa:**
   - Trong SSMS > Security > Logins > Chuột phải `sa` > Properties.
   - Đặt mật khẩu (ví dụ: `123456`).
   - Status > Login: **Enabled**.
   - Chuột phải vào Server > Properties > Security > Chọn **SQL Server and Windows Authentication mode**.

2. **Bật TCP/IP:**
   - Mở **SQL Server Configuration Manager**.
   - Vào **SQL Server Network Configuration** > **Protocols for SQLEXPRESS**.
   - Bật **TCP/IP** (Status: Enabled).
   - Chuột phải **TCP/IP** > Properties > IP Addresses > Kéo xuống **IPAll** > Đặt **TCP Port** là `1433`.
   - Restart lại SQL Server Service.

---

## 3. Cài đặt & Chạy Backend (Node.js)

Cài đặt thư viện
Mở terminal tại thư mục gốc dự án:

```bash
cd backend
npm install

