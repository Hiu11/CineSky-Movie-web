import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout, { AuthIcon, AuthSocialFooter } from "../../components/AuthLayout/AuthLayout";
import "./ForgotPassword.css";

export default function ForgotPassword({ showToast }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus({ type: "error", message: "Please enter your email address." });
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      const message = `Password reset instructions have been sent to ${normalizedEmail}.`;
      setStatus({ type: "success", message });
      showToast?.({
        type: "success",
        title: "Reset email sent",
        message,
      });
      setIsSubmitting(false);
    }, 650);
  };

  return (
    <AuthLayout
      mode="forgot"
      subtitle="Enter the email used for your CineSky account and we will send a recovery link."
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? "SENDING..." : "SEND RESET LINK"}
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

      <p className="forgot-password-note">
        Remember your password? <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
