import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout, { AuthIcon, AuthSocialFooter } from "../../components/AuthLayout/AuthLayout";
import { registerUser } from "../../services/authService";
import "./Register.css";

const evaluatePasswordStrength = (password = "") => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
};

export default function Register({ onRegisterSuccess, showToast }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const confirmMatches = confirm.length === 0 ? true : password === confirm;

  const handleRegister = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    setStatus({ type: "", message: "" });

    if (password.length < 8) {
      setStatus({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (password !== confirm) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    if (!acceptedTerms) {
      setStatus({
        type: "error",
        message: "Please agree to the terms before creating your account.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        fullName,
        email: normalizedEmail,
        phone,
        gender,
        birthday,
        password,
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(null);
      }

      showToast?.({
        type: "success",
        title: "Account created",
        message: "Your CineSky account is ready. Please sign in to continue.",
      });

      navigate("/login", {
        replace: true,
        state: {
          email: normalizedEmail,
          message: "Registration successful. Please sign in to continue.",
        },
      });
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Registration failed",
        message:
          error.message === "Email already in use"
            ? "This email is already in use. Please sign in or choose another one."
            : error.message,
      });

      setStatus({
        type: "error",
        message:
          error.message === "Email already in use"
            ? "This email is already in use. Please sign in or choose another one."
            : error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="register"
      subtitle="Create an account to save favorites, book faster, and track every transaction on CineSky."
      onSubmit={handleRegister}
      submitLabel={isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      submitDisabled={isSubmitting}
      footerContent={<AuthSocialFooter />}
    >
      {status.message ? (
        <div className={`auth-form__status auth-form__status--${status.type}`}>{status.message}</div>
      ) : null}

      <div className="auth-form__grid">
        <label className="auth-field">
          <span className="auth-field__control">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
            <AuthIcon name="user" />
          </span>
        </label>

        <label className="auth-field">
          <span className="auth-field__control">
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
            <AuthIcon name="phone" />
          </span>
        </label>

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

        <label className="auth-field">
          <span className="auth-field__control">
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <AuthIcon name="chevron" />
          </span>
        </label>

        <label className="auth-field">
          <span className="auth-field__control">
            <input type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
            <AuthIcon name="calendar" />
          </span>
        </label>

        <label className="auth-field">
          <span className="auth-field__control">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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
          <div className="auth-strength">
            <div className="auth-strength__track">
              <span
                className={`auth-strength__fill auth-strength__fill--${passwordStrength}`}
                style={{ width: `${Math.max(passwordStrength, password ? 1 : 0) * 25}%` }}
              ></span>
            </div>
          </div>
        </label>

        <label className="auth-field">
          <span className={`auth-field__control${!confirmMatches ? " auth-field__control--invalid" : ""}`}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-field__toggle"
              onClick={() => setShowConfirm((current) => !current)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </span>
        </label>
      </div>

      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
        />
        <span>I agree to CineSky&apos;s privacy policy and terms of use.</span>
      </label>
    </AuthLayout>
  );
}
