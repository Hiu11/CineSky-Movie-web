import { useEffect, useState } from "react";
import Lottie from "lottie-react";

/**
 * DynamicLottie — Component tải và render Lottie animation động từ public folder.
 * Giúp tối ưu bundle size, không cần import trực tiếp file JSON nặng và không phụ thuộc CDN unpkg.com.
 *
 * @param {string} src — Đường dẫn đến file JSON (ví dụ: "/assets/lottie/loader-cat.json")
 * @param {boolean} loop — Có lặp lại hay không (mặc định: true)
 * @param {boolean} autoplay — Tự động chạy (mặc định: true)
 * @param {string} className — Class CSS tùy chỉnh
 * @param {object} style — Style CSS inline
 */
export default function DynamicLottie({ src = "", loop = true, autoplay = true, className = "", style = {} }) {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    let isMounted = true;
    setAnimationData(null);
    setError(false);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch lottie from ${src}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setAnimationData(data);
        }
      })
      .catch((err) => {
        console.error("[DynamicLottie] Error loading animation:", err);
        if (isMounted) {
          setError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (error) {
    return (
      <div
        className={`dynamic-lottie-fallback ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          color: "#f9c74f",
          minHeight: "100px",
          ...style,
        }}
      >
        🎬
      </div>
    );
  }

  if (!animationData) {
    return (
      <div
        className={`dynamic-lottie-loader ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100px",
          opacity: 0.3,
          ...style,
        }}
      >
        <div className="dynamic-lottie-spinner" style={{
          width: "24px",
          height: "24px",
          border: "2px solid rgba(255,255,255,0.2)",
          borderTopColor: "#f9c74f",
          borderRadius: "50%",
          animation: "dynamic-lottie-spin 0.8s linear infinite"
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dynamic-lottie-spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}
