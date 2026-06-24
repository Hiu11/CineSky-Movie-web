import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  confirmMockPaymentSession,
  getMockPaymentSession,
} from "../../services/movieService";
import { formatVnd, getPaymentMethodByProvider } from "../../utils/paymentUi";
import "./PaymentConfirm.css";

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

  const method = useMemo(() => getPaymentMethodByProvider(session?.provider), [session?.provider]);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      setMessage({ type: "", text: "" });
      const data = await confirmMockPaymentSession(sessionId);
      setSession(data);
      setMessage({ type: "success", text: "Đã xác nhận thanh toán. Bạn có thể quay lại màn hình đặt vé để hoàn tất." });
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
        <div className="payment-confirm__brand">
          <span>
            {method.logos.map((logo) => <img key={logo} src={logo} alt="" />)}
          </span>
          <strong>Thanh toán bằng {method.title}</strong>
        </div>

        {isLoading ? (
          <p className="payment-confirm__muted">Đang kiểm tra phiên thanh toán...</p>
        ) : session ? (
          <>
            <div className="payment-confirm__amount">
              <span>Số tiền</span>
              <strong>{formatVnd(session.amount)}</strong>
            </div>

            <dl className="payment-confirm__details">
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
              <div>
                <dt>Trạng thái</dt>
                <dd>{isPaid ? "Đã thanh toán" : isExpired ? "Phiên đã hết hạn" : "Đang chờ xác nhận"}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="payment-confirm__button"
              onClick={handleConfirm}
              disabled={isConfirming || isPaid || isExpired}
            >
              {isConfirming ? "Đang xác nhận..." : isPaid ? "Đã thanh toán" : "Xác nhận đã thanh toán"}
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
