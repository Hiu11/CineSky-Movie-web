import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  confirmMockPaymentSession,
  getMockPaymentSession,
} from "../../services/movieService";
import "./PaymentConfirm.css";

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function PaymentConfirm() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let mounted = true;

    getMockPaymentSession(sessionId)
      .then((data) => {
        if (mounted) {
          setSession(data);
          setMessage({ type: "", text: "" });
        }
      })
      .catch((err) => {
        if (mounted) {
          setMessage({ type: "error", text: err.message || "Không tìm thấy phiên thanh toán." });
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      setMessage({ type: "", text: "" });
      const data = await confirmMockPaymentSession(sessionId);
      setSession(data);
      setMessage({ type: "success", text: "Đã xác nhận thanh toán. Quay lại màn hình đặt vé để hoàn tất." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Không thể xác nhận thanh toán." });
    } finally {
      setIsConfirming(false);
    }
  };

  const isPaid = session?.status === "paid";
  const isExpired = session?.status === "expired";

  return (
    <main className="payment-confirm">
      <section className="payment-confirm__card">
        <span className="payment-confirm__eyebrow">CineSky QR</span>
        <h1>Xác nhận thanh toán</h1>

        {isLoading ? (
          <p className="payment-confirm__muted">Đang kiểm tra phiên thanh toán...</p>
        ) : session ? (
          <>
            <div className="payment-confirm__amount">
              <span>Số tiền</span>
              <strong>{formatCurrency(session.amount)} VND</strong>
            </div>

            <dl className="payment-confirm__details">
              <div>
                <dt>Nhà cung cấp</dt>
                <dd>{session.provider}</dd>
              </div>
              {session.movieTitle ? (
                <div>
                  <dt>Phim</dt>
                  <dd>{session.movieTitle}</dd>
                </div>
              ) : null}
              {session.seatNumbers?.length ? (
                <div>
                  <dt>Ghế</dt>
                  <dd>{session.seatNumbers.join(", ")}</dd>
                </div>
              ) : null}
            </dl>

            <p className={"payment-confirm__status" + (isPaid ? " is-paid" : isExpired ? " is-expired" : "")}>
              {isPaid ? "Đã thanh toán" : isExpired ? "Phiên đã hết hạn" : "Đang chờ xác nhận"}
            </p>

            <button
              type="button"
              className="payment-confirm__button"
              onClick={handleConfirm}
              disabled={isConfirming || isPaid || isExpired}
            >
              {isConfirming ? "Đang xác nhận..." : isPaid ? "Đã thanh toán" : "Đã thanh toán"}
            </button>
          </>
        ) : null}

        {message.text ? (
          <p className={"payment-confirm__message is-" + message.type}>{message.text}</p>
        ) : null}

        <Link className="payment-confirm__link" to="/booking">
          Quay lại đặt vé
        </Link>
      </section>
    </main>
  );
}
