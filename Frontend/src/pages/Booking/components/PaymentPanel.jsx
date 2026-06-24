import { GALAXY_PAYMENT_METHODS, formatVnd } from "../../../utils/paymentUi";

const METHOD_TO_BOOKING_TYPE = {
  card: "card",
  momo: "wallet",
  zalopay: "wallet",
  shopeepay: "wallet",
};

export default function PaymentPanel({
  selectedProvider, setSelectedProvider,
  setSelectedPaymentMethod,
  paymentForm, onPaymentFieldChange,
  setUseQrPayment,
  isQrPaymentConfirmed, setIsQrPaymentConfirmed,
  paymentSession, paymentSessionError,
  paymentQrDataUrl, qrPaymentUrl, isPaymentExpired, paymentCountdownLabel,
  voucherState, finalTotal,
}) {
  const activeMethod =
    GALAXY_PAYMENT_METHODS.find((method) => method.provider === selectedProvider || method.title === selectedProvider) ||
    GALAXY_PAYMENT_METHODS[0];
  const isWallet = activeMethod.id !== "card";

  const selectMethod = (method) => {
    setSelectedProvider(method.provider);
    setSelectedPaymentMethod(METHOD_TO_BOOKING_TYPE[method.id] || "wallet");
    setUseQrPayment(method.id !== "card");
    setIsQrPaymentConfirmed(false);
  };

  const qrStatusLabel = isQrPaymentConfirmed
    ? "Điện thoại đã xác nhận thanh toán"
    : paymentSession?.status === "expired" || isPaymentExpired
      ? "Phiên thanh toán đã hết hạn"
      : "Đang chờ điện thoại xác nhận";

  return (
    <section className="booking-page__panel booking-page__panel--payment booking-pay">
      <div className="booking-pay__header">
        <div>
          <span className="booking-page__eyebrow">Bước 5</span>
          <h2>Phương thức thanh toán</h2>
        </div>
        <span className={"booking-pay__timer" + (isPaymentExpired ? " is-expired" : "")}>
          {paymentCountdownLabel}
        </span>
      </div>

      <div className="booking-pay__layout">
        <div className="booking-pay__methods" role="radiogroup" aria-label="Chọn phương thức thanh toán">
          {GALAXY_PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={activeMethod.id === method.id}
              onClick={() => selectMethod(method)}
              className={"booking-pay__method" + (activeMethod.id === method.id ? " is-active" : "")}
              style={{ "--method-color": method.color }}
            >
              <span className="booking-pay__radio" aria-hidden="true"></span>
              <span className="booking-pay__logos" aria-hidden="true">
                {method.logos.map((logo) => (
                  <img key={logo} src={logo} alt="" loading="lazy" />
                ))}
              </span>
              <span className="booking-pay__method-copy">
                <strong>{method.title}</strong>
                <small>{method.helper}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="booking-pay__detail">
          <div className="booking-pay__detail-title">
            <div>
              <strong>Thông tin thanh toán</strong>
              <span>{activeMethod.title}</span>
            </div>
            <span>{formatVnd(finalTotal)}</span>
          </div>

          {isWallet ? (
            <div className="booking-pay__qr-box">
              {paymentQrDataUrl ? (
                <img className="booking-pay__qr-image" src={paymentQrDataUrl} alt="QR thanh toán mô phỏng" />
              ) : (
                <div className="booking-pay__qr-placeholder">Đang tạo QR...</div>
              )}
              <div className="booking-pay__qr-copy">
                <strong>Thanh toán bằng {activeMethod.title}</strong>
                <p>Bước 1: Mở ứng dụng và đăng nhập ví.</p>
                <p>Bước 2: Chọn quét QR ở góc phải màn hình.</p>
                <p>Bước 3: Xác nhận giao dịch để hoàn tất.</p>
                <span className={"booking-pay__qr-state" + (isQrPaymentConfirmed ? " is-paid" : "")}>
                  {qrStatusLabel}
                </span>
              </div>
              {qrPaymentUrl && !isPaymentExpired ? (
                <a className="booking-pay__qr-link" href={qrPaymentUrl} target="_blank" rel="noopener noreferrer">
                  Mở trang xác nhận
                </a>
              ) : null}
              {paymentSessionError ? <p className="booking-pay__error">{paymentSessionError}</p> : null}
            </div>
          ) : (
            <div className="booking-pay__card-form">
              <label>
                <span>Số thẻ</span>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={onPaymentFieldChange("reference")}
                  placeholder="VD: 4111 1111 1111 1111"
                />
              </label>
              <label>
                <span>Tên chủ thẻ</span>
                <input
                  type="text"
                  value={paymentForm.ownerName}
                  onChange={onPaymentFieldChange("ownerName")}
                  placeholder="Nhập tên in trên thẻ"
                />
              </label>
              <label>
                <span>Ngày hết hạn</span>
                <input type="text" value={paymentForm.expiry} onChange={onPaymentFieldChange("expiry")} placeholder="MM/YY" />
              </label>
              <label>
                <span>CVV</span>
                <input type="text" value={paymentForm.secureCode} onChange={onPaymentFieldChange("secureCode")} placeholder="123" />
              </label>
            </div>
          )}

          <label className="booking-pay__promo">
            <span>Áp dụng ưu đãi</span>
            <input
              type="text"
              value={paymentForm.promoCode}
              onChange={onPaymentFieldChange("promoCode")}
              placeholder="Chọn hoặc nhập mã"
            />
          </label>
          {paymentForm.promoCode?.trim() ? (
            <p className={"booking-page__voucher-message " + (voucherState?.error ? "is-error" : "is-success")}>
              {voucherState?.isChecking
                ? "Đang kiểm tra mã khuyến mãi..."
                : voucherState?.error || voucherState?.message || "Mã khuyến mãi đã sẵn sàng."}
            </p>
          ) : null}

          <p className="booking-pay__note">
            Đây là luồng thanh toán mô phỏng theo trải nghiệm thuê phim online. Không có giao dịch thật được gửi đi.
          </p>
        </div>
      </div>
    </section>
  );
}
