export const PAYMENT_LOGOS = {
  card: [
    "https://www.google.com/s2/favicons?domain=visa.com&sz=128",
    "https://www.google.com/s2/favicons?domain=mastercard.com&sz=128",
    "https://www.google.com/s2/favicons?domain=jcb.co.jp&sz=128",
  ],
  momo: ["https://www.google.com/s2/favicons?domain=momo.vn&sz=128"],
  zalopay: ["https://www.google.com/s2/favicons?domain=zalopay.vn&sz=128"],
  shopeepay: ["https://www.google.com/s2/favicons?domain=shopeepay.vn&sz=128"],
  vnpay: ["https://www.google.com/s2/favicons?domain=vnpay.vn&sz=128"],
};

export const GALAXY_PAYMENT_METHODS = [
  {
    id: "card",
    provider: "Thẻ tín dụng",
    title: "Thẻ tín dụng",
    helper: "Visa, Mastercard, JCB",
    logos: PAYMENT_LOGOS.card,
    color: "#4778ff",
  },
  {
    id: "momo",
    provider: "Momo",
    title: "Momo",
    helper: "Trả ngay hoặc Trả sau",
    logos: PAYMENT_LOGOS.momo,
    color: "#a50064",
  },
  {
    id: "zalopay",
    provider: "Ví ZaloPay",
    title: "Ví ZaloPay",
    helper: "Quét QR hoặc mở ví",
    logos: PAYMENT_LOGOS.zalopay,
    color: "#0b83ff",
  },
  {
    id: "shopeepay",
    provider: "Ví ShopeePay",
    title: "Ví ShopeePay",
    helper: "Thanh toán qua ví",
    logos: PAYMENT_LOGOS.shopeepay,
    color: "#ee4d2d",
  },
];

export const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export const getPaymentMethodByProvider = (provider = "") => {
  const normalized = String(provider || "").toLowerCase();
  return (
    GALAXY_PAYMENT_METHODS.find((method) =>
      [method.id, method.provider, method.title].some((item) => normalized.includes(String(item).toLowerCase()))
    ) || GALAXY_PAYMENT_METHODS[0]
  );
};
