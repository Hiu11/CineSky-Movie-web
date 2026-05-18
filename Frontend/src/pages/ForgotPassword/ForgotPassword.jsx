import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout, { AuthIcon, AuthSocialFooter } from "../../components/AuthLayout/AuthLayout";
import { requestPasswordReset, resetPassword } from "../../services/authService";
import "./ForgotPassword.css";

export default function ForgotPassword({ showToast }) {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const emailFromLink = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromLink);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isResetMode = Boolean(resetToken);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = (email || emailFromLink).trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus({ type: "error", message: "Vui lòng nhập email của bạn." });
      return;
    }

    if (isResetMode && newPassword.length < 6) {
      setStatus({ type: "error", message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isResetMode
        ? await resetPassword({ email: normalizedEmail, token: resetToken, password: newPassword })
        : await requestPasswordReset({ email: normalizedEmail });
      const message = isResetMode
        ? "Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới."
        : `Nếu email ${normalizedEmail} tồn tại, liên kết đặt lại mật khẩu đã được tạo.`;

      setStatus({ type: "success", message });
      showToast?.({
        type: "success",
        title: isResetMode ? "Đã đặt lại mật khẩu" : "Đã tạo liên kết khôi phục",
        message: payload?.resetUrl
          ? `${message} Link test: ${payload.resetUrl}`
          : message,
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Không thể xử lý yêu cầu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="forgot"
      subtitle={
        isResetMode
          ? "Nhập email và mật khẩu mới để hoàn tất khôi phục tài khoản CineSky."
          : "Nhập email đã dùng cho tài khoản CineSky, hệ thống sẽ tạo liên kết khôi phục bằng token lưu trong database."
      }
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? "ĐANG XỬ LÝ..." : isResetMode ? "ĐẶT LẠI MẬT KHẨU" : "GỬI LIÊN KẾT"}
      submitDisabled={isSubmitting}
      footerContent={<AuthSocialFooter />}
    >
      {status.message ? (
        <div className={`auth-form__status auth-form__status--${status.type}`}>{status.message}</div>
      ) : null}

      <label className="auth-field auth-field--wide">
        <span className="auth-field__control">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <AuthIcon name="mail" />
        </span>
      </label>

      {isResetMode ? (
        <label className="auth-field auth-field--wide">
          <span className="auth-field__control">
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <AuthIcon name="lock" />
          </span>
        </label>
      ) : null}

      <p className="forgot-password-note">
        Nhớ mật khẩu rồi? <Link to="/login">Quay lại đăng nhập</Link>
      </p>
    </AuthLayout>
  );
}
