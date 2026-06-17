import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, {
  AuthDivider,
  AuthIcon,
  AuthSocialButtons,
  AuthSocialFooter,
} from "../../components/AuthLayout/AuthLayout";
import {
  loginUser,
  readSocialAuthSession,
  redirectToSocialLogin,
  storeAuthSession,
} from "../../services/authService";
import "./Login.css";

export default function Login({ onLoginSuccess, showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authSession = searchParams.get("authSession");
    const authError = searchParams.get("authError");

    // Sau khi login Google/Facebook, backend redirect về đây với session giống login thường,
    // nên app có thể lưu user/token và dùng lại toàn bộ auth state cũ.
    if (authSession) {
      try {
        const session = readSocialAuthSession(authSession);
        const { user } = storeAuthSession(session);

        if (onLoginSuccess) {
          onLoginSuccess(user);
        }

        showToast?.({
          type: "success",
          title: "Welcome back",
          message: `Signed in as ${user.fullName || user.name || user.email}.`,
        });

        window.location.replace("/");
        return;
      } catch {
        setStatus({
          type: "error",
          message: "Social sign in failed. Please try again.",
        });
        navigate("/login", { replace: true });
      }
    }

    // Nếu login mạng xã hội lỗi, backend cũng redirect về đây kèm thông báo dễ đọc.
    if (authError) {
      setStatus({
        type: "error",
        message: authError,
      });
      navigate("/login", { replace: true });
    }

    if (location.state?.email) {
      setEmail(location.state.email);
    }

    if (location.state?.message) {
      setStatus({
        type: "success",
        message: location.state.message,
      });
    }
  }, [location.search, location.state, navigate, onLoginSuccess, showToast]);

  const handleLogin = async (event) => {
    event.preventDefault();

    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const session = await loginUser({
        email,
        password,
      });
      const { user } = storeAuthSession(session);

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      showToast?.({
        type: "success",
        title: "Welcome back",
        message: `Signed in as ${user.fullName || user.name || user.email}.`,
      });

      navigate("/", { replace: true });
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Sign in failed",
        message:
          error.message === "Invalid email or password"
            ? "Email or password is incorrect."
            : error.message,
      });

      setStatus({
        type: "error",
        message:
          error.message === "Invalid email or password"
            ? "Email or password is incorrect."
            : error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      subtitle="Sign in to save tickets, view booking history, and continue your cinema journey."
      topContent={
        <>
          <AuthSocialButtons
            onGoogleClick={() => redirectToSocialLogin("google")}
            onFacebookClick={() => redirectToSocialLogin("facebook")}
            disabled={isSubmitting}
          />
          <AuthDivider label="Or" />
        </>
      }
      onSubmit={handleLogin}
      submitLabel={isSubmitting ? "SIGNING IN..." : "SIGN IN"}
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
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <AuthIcon name="mail" />
        </span>
      </label>

      <label className="auth-field auth-field--wide">
        <span className="auth-field__control">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <div className="auth-form__meta">
        <label className="auth-checkbox">
          <input type="checkbox" />
          <span>Remember me on this device</span>
        </label>
        <Link to="/forgot-password" className="login-forgot-link">
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}
