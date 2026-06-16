import {
  LOCALIZED_PAYMENT_METHODS,
  PAYMENT_PROVIDER_LOGOS,
  PAYMENT_SEARCH_PLACEHOLDERS,
} from "../hooks/useBookingFlow";

const getProviderLogo = (provider = "") => {
  const meta = PAYMENT_PROVIDER_LOGOS[provider] || { domain: "vnpay.vn" };
  if (meta.logo) return meta.logo;
  return `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128`;
};

export default function PaymentPanel({
  selectedPaymentMethod, setSelectedPaymentMethod,
  selectedProvider, setSelectedProvider,
  providerSearch, setProviderSearch,
  visibleProviders, paymentForm, onPaymentFieldChange,
  useQrPayment, setUseQrPayment,
  isQrPaymentConfirmed, setIsQrPaymentConfirmed,
  paymentSession, paymentSessionError,
  paymentQrDataUrl, qrPaymentUrl, isPaymentExpired, paymentCountdownLabel,
  voucherState, finalTotal, formatCurrency,
}) {
  const qrStatusLabel = isQrPaymentConfirmed
    ? "Điện thoại đã xác nhận thanh toán"
    : paymentSession?.status === "expired"
      ? "Phiên QR đã hết hạn"
      : "Đang chờ điện thoại xác nhận";

  return (
    <section className="booking-page__panel booking-page__panel--payment">
      <div className="booking-page__panel-header booking-page__panel-header--split">
        <div>
          <span className="booking-page__eyebrow">Bước 5</span>
          <h2>Chọn thanh toán</h2>
        </div>
        <p>Giao diện thử nghiệm mô phỏng luồng chọn cổng thanh toán và thông tin xác nhận.</p>
      </div>

      <div className="booking-page__payment-methods">
        {LOCALIZED_PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedPaymentMethod(method.id)}
            className={"booking-page__payment-method" + (selectedPaymentMethod === method.id ? " is-active" : "")}
          >
            <span>{method.label}</span>
            <small>{method.helper}</small>
          </button>
        ))}
      </div>

      <div className="booking-page__payment-layout">
        <div className="booking-page__payment-bank-card">
          <div className="booking-page__payment-card-header">
            <div>
              <strong>Chọn nhà cung cấp</strong>
              <span>{LOCALIZED_PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.helper}</span>
            </div>
            <span className="booking-page__payment-badge">Test UI</span>
          </div>

          <div className="booking-page__payment-search">
            <input
              type="text"
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              placeholder={PAYMENT_SEARCH_PLACEHOLDERS[selectedPaymentMethod] || "Tìm kiếm nhà cung cấp..."}
            />
          </div>

          <div className="booking-page__provider-grid">
            {visibleProviders.map((provider) => {
              const logo = getProviderLogo(provider);
              const color = PAYMENT_PROVIDER_LOGOS[provider]?.color || "#f7b400";
              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setSelectedProvider(provider)}
                  className={"booking-page__provider-tile" + (selectedProvider === provider ? " is-active" : "")}
                  style={{ "--provider-color": color }}
                >
                  <img 
                    className="booking-page__provider-logo" 
                    src={logo} 
                    alt={`${provider} logo`} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider)}&background=${color.replace('#', '')}&color=fff&rounded=true&bold=true`;
                    }}
                  />
                  <span>{provider}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="booking-page__payment-form-card">
          <div className="booking-page__payment-card-header">
            <div>
              <strong>Thông tin thanh toán</strong>
              <span>{selectedProvider}</span>
            </div>
            <span className={"booking-page__payment-time" + (isPaymentExpired ? " is-expired" : "")} aria-live="polite">
              {paymentCountdownLabel}
            </span>
          </div>

          <div className="booking-page__qr-switch">
            <div>
              <strong>Quét QR thanh toán</strong>
              <span>Không cần liên kết tài khoản ngân hàng.</span>
            </div>
            <button
              type="button"
              className={useQrPayment ? "is-active" : ""}
              onClick={() => { setUseQrPayment((v) => !v); setIsQrPaymentConfirmed(false); }}
              aria-pressed={useQrPayment}
            >
              {useQrPayment ? "Đang bật" : "Bật QR"}
            </button>
          </div>

          {useQrPayment ? (
            <div className="booking-page__qr-panel">
              {paymentQrDataUrl ? (
                <img src={paymentQrDataUrl} alt="QR thanh toán mô phỏng" />
              ) : (
                <div className="booking-page__qr-placeholder">Đang tạo QR...</div>
              )}
              <div>
                <strong>{formatCurrency(finalTotal)} VND</strong>
                <span>{selectedProvider} • {qrStatusLabel}</span>
              </div>
              <div className={"booking-page__qr-status" + (isQrPaymentConfirmed ? " is-paid" : "")} aria-live="polite">
                {isQrPaymentConfirmed
                  ? "Bạn có thể xác nhận đặt vé."
                  : "Quét QR hoặc bấm nút bên dưới để mở trang xác nhận thanh toán."}
              </div>
              {qrPaymentUrl && !isPaymentExpired ? (
                <a
                  className="booking-page__qr-link"
                  href={qrPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mở trang thanh toán
                </a>
              ) : null}
              {paymentSessionError ? (
                <p className="booking-page__qr-error">{paymentSessionError}</p>
              ) : null}
            </div>
          ) : (
            <div className="booking-page__payment-form-grid">
              <label className="booking-page__field booking-page__field--full">
                <span>{selectedPaymentMethod === "wallet" ? "Số điện thoại / tài khoản" : "Số thẻ / số tài khoản"}</span>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={onPaymentFieldChange("reference")}
                  placeholder={selectedPaymentMethod === "wallet" ? "Nhập số điện thoại ví" : "Nhập số thẻ hoặc tài khoản"}
                />
              </label>
              <label className="booking-page__field booking-page__field--full">
                <span>Tên chủ thẻ / tài khoản</span>
                <input
                  type="text"
                  value={paymentForm.ownerName}
                  onChange={onPaymentFieldChange("ownerName")}
                  placeholder="Nhập tên chủ thẻ hoặc chủ tài khoản"
                />
              </label>
              {selectedPaymentMethod !== "wallet" ? (
                <>
                  <label className="booking-page__field">
                    <span>Ngày hiệu lực</span>
                    <input type="text" value={paymentForm.expiry} onChange={onPaymentFieldChange("expiry")} placeholder="MM/YY" />
                  </label>
                  <label className="booking-page__field">
                    <span>Mã bảo mật</span>
                    <input type="text" value={paymentForm.secureCode} onChange={onPaymentFieldChange("secureCode")} placeholder="CVV / OTP" />
                  </label>
                </>
              ) : null}
              <label className="booking-page__field booking-page__field--full">
                <span>Mã khuyến mãi</span>
                <input type="text" value={paymentForm.promoCode} onChange={onPaymentFieldChange("promoCode")} placeholder="Nhập mã giảm giá nếu có" />
              </label>
              {paymentForm.promoCode?.trim() ? (
                <p className={"booking-page__voucher-message " + (voucherState?.error ? "is-error" : "is-success")}>
                  {voucherState?.isChecking
                    ? "Đang kiểm tra mã khuyến mãi..."
                    : voucherState?.error || voucherState?.message || "Mã khuyến mãi đã sẵn sàng."}
                </p>
              ) : null}
            </div>
          )}

          <div className="booking-page__payment-note">
            Thông tin trên chỉ dùng để mô phỏng giao diện thanh toán, không gửi tới cổng thanh toán thật.
          </div>
        </div>
      </div>
    </section>
  );
}
