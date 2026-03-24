import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

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
      avatar: "",
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    if (onRegisterSuccess) onRegisterSuccess(null);

    alert("Đăng ký thành công! Mời bạn đăng nhập.");
    navigate("/login");
  };

  return (
    <div className="register-modal">
      <div className="register-modal__card">
        <button onClick={() => navigate("/")} className="register-modal__close" aria-label="Close">
          X
        </button>
        <h2 className="register-modal__title">Đăng Ký Tài Khoản</h2>
        <input placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} className="register-modal__input" />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="register-modal__input" />
        <input placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} className="register-modal__input" />

        <div className="register-modal__gender">
          <label>
            <input type="radio" name="gender" value="Nam" onChange={(e) => setGender(e.target.value)} /> Nam
          </label>
          <label>
            <input type="radio" name="gender" value="Nữ" onChange={(e) => setGender(e.target.value)} /> Nữ
          </label>
        </div>

        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="register-modal__input" />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="register-modal__input" />
        <input type="password" placeholder="Nhập lại mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="register-modal__input" />
        <button onClick={handleRegister} className="register-modal__submit">HOÀN TẤT</button>
      </div>
    </div>
  );
}
