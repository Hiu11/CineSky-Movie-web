import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      alert("Tài khoản chưa đăng ký!");
      return;
    }

    if (foundUser.password !== password) {
      alert("Sai mật khẩu!");
      return;
    }

    sessionStorage.setItem("user", JSON.stringify(foundUser));

    if (onLoginSuccess) onLoginSuccess(foundUser);

    alert("Đăng nhập thành công!");
    navigate("/");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 400,
          background: "#0b1020",
          padding: 24,
          borderRadius: 12,
          color: "white",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Đăng Nhập
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={btnStyle}>
          ĐĂNG NHẬP
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
