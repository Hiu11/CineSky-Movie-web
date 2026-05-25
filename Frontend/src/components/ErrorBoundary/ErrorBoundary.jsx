import { Component } from "react";
import { Link } from "react-router-dom";

/**
 * ErrorBoundary — bắt lỗi runtime JavaScript của toàn bộ component tree con.
 * Đặt tại App.jsx để tránh crash trắng toàn trang.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log lỗi — có thể tích hợp Sentry ở đây trong tương lai
    console.error("[ErrorBoundary] Uncaught runtime error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0f14",
        color: "#e5e7eb",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem",
        textAlign: "center",
        gap: "1.5rem",
      }}>
        <div style={{ fontSize: "3.5rem" }}>🎬</div>

        <div>
          <h1 style={{ color: "#f9c74f", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            Ồ! CineSky gặp sự cố nhỏ
          </h1>
          <p style={{ color: "#9ca3af", maxWidth: "500px", lineHeight: 1.6 }}>
            Đã xảy ra lỗi không mong muốn khi hiển thị trang này. Hãy thử tải lại hoặc quay về trang chủ.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error ? (
            <pre style={{
              background: "#1e2130",
              border: "1px solid #374151",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "0.75rem",
              color: "#ef4444",
              textAlign: "left",
              maxWidth: "600px",
              overflowX: "auto",
              marginTop: "1rem",
            }}>
              {this.state.error.toString()}
            </pre>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: "0.75rem 1.75rem",
              background: "#f9c74f",
              color: "#0d0f14",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Thử lại
          </button>
          <Link
            to="/"
            style={{
              padding: "0.75rem 1.75rem",
              background: "transparent",
              color: "#9ca3af",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
            onClick={this.handleReset}
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }
}
