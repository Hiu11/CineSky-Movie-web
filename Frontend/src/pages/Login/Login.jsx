import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find((u) => u.email === email);

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
    <div className="login-modal">
      <div className="login-modal__card">
        <button onClick={() => navigate("/")} className="login-modal__close" aria-label="Close">
          X
        </button>
        <h2 className="login-modal__title">Đăng Nhập</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="login-modal__input" />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="login-modal__input" />
        <button onClick={handleLogin} className="login-modal__submit">ĐĂNG NHẬP</button>
      </div>
    </div>
  );
}
