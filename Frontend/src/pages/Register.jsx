import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ onRegisterSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const handleRegister = () => {
    if (password !== confirm) {
      alert("Mật khẩu không trùng!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((u) => u.email === email)) {
      alert("Email đã tồn tại, vui lòng đăng nhập!");
      return;
    }

    const newUser = {
      name: fullName || email,
      email,
      phone,
      gender,
      birthday,
      password,
      avatar: "/user.png",
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    if (onRegisterSuccess) onRegisterSuccess(null);

    alert("Đăng ký thành công! Mời bạn đăng nhập.");
    navigate("/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 450,
          background: "#0b1020",
          padding: 24,
          borderRadius: 12,
          color: "white",
          position: "relative",
        }}
      >
        <button onClick={() => navigate("/")} style={closeBtnStyle} aria-label="Close">
          X
        </button>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Đăng Ký Tài Khoản</h2>

        <input
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
          <label>
            <input type="radio" name="gender" value="Nam" onChange={(e) => setGender(e.target.value)} /> Nam
          </label>
          <label>
            <input type="radio" name="gender" value="Nữ" onChange={(e) => setGender(e.target.value)} /> Nữ
          </label>
        </div>

        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} style={inputStyle} />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleRegister} style={btnStyle}>
          HOÀN TẤT
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #555",
  background: "#1a1c2e",
  color: "white",
};

const btnStyle = {
  width: "100%",
  padding: 12,
  background: "#f7b400",
  color: "black",
  fontWeight: "bold",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};

const closeBtnStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "1px solid #666",
  background: "transparent",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};
