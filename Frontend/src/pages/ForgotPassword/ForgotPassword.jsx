import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout, { AuthIcon, AuthSocialFooter } from "../../components/AuthLayout/AuthLayout";
import { requestPasswordReset, resetPassword } from "../../services/authService";
import "./ForgotPassword.css";

export default function ForgotPassword({ showToast }) {
  const [searchParams] = useSearchParams();
  const tokenFromLink = searchParams.get("token") || "";
  const emailFromLink = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromLink);
  const [otp, setOtp] = useState(tokenFromLink);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(Boolean(tokenFromLink));
  const isResetMode = otpSent;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = (email || emailFromLink).trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus({ type: "error", message: "Vui lòng nhập email của bạn." });
      return;
    }

    if (isResetMode && !otp.trim()) {
      setStatus({ type: "error", message: "Vui lòng nhập mã OTP trong email." });
      return;
    }

    if (isResetMode && newPassword.length < 6) {
      setStatus({ type: "error", message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    setIsSubmitting(true);

    try {
      const message = isResetMode
        ? "Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới."
        : `Nếu email ${normalizedEmail} tồn tại, mã OTP đặt lại mật khẩu đã được gửi.`;

      if (isResetMode) {
        await resetPassword({ email: normalizedEmail, otp: otp.trim(), password: newPassword });
      } else {
        await requestPasswordReset({ email: normalizedEmail });
        setOtpSent(true);
      }

      setStatus({ type: "success", message });
      showToast?.({
        type: "success",
        title: isResetMode ? "Đã đặt lại mật khẩu" : "Đã gửi mã OTP",
        message,
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
          ? "Nhập mã OTP trong email và mật khẩu mới để hoàn tất khôi phục tài khoản CineSky."
          : "Nhập email đã dùng cho tài khoản CineSky, hệ thống sẽ gửi mã OTP khôi phục mật khẩu."
      }
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? "ĐANG XỬ LÝ..." : isResetMode ? "ĐẶT LẠI MẬT KHẨU" : "GỬI MÃ OTP"}
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
              type="text"
              inputMode="numeric"
              placeholder="Mã OTP 6 số"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="one-time-code"
              required
            />
            <AuthIcon name="lock" />
          </span>
        </label>
      ) : null}

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
