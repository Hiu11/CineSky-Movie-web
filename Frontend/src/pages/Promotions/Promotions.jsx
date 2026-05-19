import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import promoVoucherAnimation from "../../assets/animations/promoVoucher.json";
import { getPromotions } from "../../services/promotionService";
import "./Promotions.css";

const fallbackPromotions = {
  heroVoucher: {
    tag: "Hot voucher",
    title: "Giảm 30K",
    description: "Cho hóa đơn từ 199K khi đặt vé online và mua combo tại CineSky.",
  },
  vouchers: [
  {
    tag: "Silver",
    title: "Silver Movie Night",
    value: "Giảm 15%",
    description: "Áp dụng cho vé 2D từ thứ Hai đến thứ Năm khi đăng nhập tài khoản thành viên Silver.",
  },
  {
    tag: "Gold",
    title: "Gold Combo Plus",
    value: "Combo 69K",
    description: "Bắp lớn + 2 nước ngọt cho hội viên Gold khi đặt vé online tại CineSky.",
  },
  {
    tag: "Diamond",
    title: "Diamond Premiere",
    value: "1 vé miễn phí",
    description: "Ưu đãi sinh nhật dành cho hội viên Diamond, dùng cho phim đang chiếu trong tháng.",
  },
  ],
  combos: [
    { id: "combo-couple", description: "Combo Couple: 2 vé + bắp caramel + 2 nước chỉ từ 219K." },
    { id: "combo-family", description: "Combo Family: 4 vé + 2 bắp lớn + 4 nước, phù hợp suất cuối tuần." },
    { id: "student-day", description: "Student Day: xuất trình thẻ học sinh/sinh viên để nhận giá vé ưu đãi mỗi thứ Tư." },
  ],
};

export default function Promotions() {
  const [promotions, setPromotions] = useState(fallbackPromotions);

  useEffect(() => {
    let isMounted = true;

    const loadPromotions = async () => {
      try {
        const payload = await getPromotions();

        if (isMounted) {
          setPromotions({
            heroVoucher: payload.heroVoucher || fallbackPromotions.heroVoucher,
            vouchers: payload.vouchers?.length ? payload.vouchers : fallbackPromotions.vouchers,
            combos: payload.combos?.length ? payload.combos : fallbackPromotions.combos,
          });
        }
      } catch {
        if (isMounted) {
          setPromotions(fallbackPromotions);
        }
      }
    };

    loadPromotions();

    return () => {
      isMounted = false;
    };
  }, []);

  const { heroVoucher, vouchers, combos } = promotions;

  return (
    <main className="promotions-page">
      <section className="promotions-hero">
        <div>
          <span>Ưu đãi CineSky</span>
          <h1>Voucher, combo giảm giá và quyền lợi theo hạng thành viên.</h1>
          <p>
            Chọn ưu đãi phù hợp trước khi đặt vé. Silver, Gold và Diamond đều có quyền lợi riêng để mỗi buổi xem phim nhẹ ví hơn.
          </p>
          <Link to="/?tab=now">Chọn phim ngay</Link>
        </div>
        <div className="promotions-ticket" aria-label="Voucher nổi bật">
          <div className="promotions-lottie" aria-hidden="true">
            <Lottie animationData={promoVoucherAnimation} loop autoplay />
          </div>
          <small>{heroVoucher.tag}</small>
          <strong>{heroVoucher.value || heroVoucher.title}</strong>
          <p>{heroVoucher.description}</p>
        </div>
      </section>

      <section className="promotions-grid" aria-label="Ưu đãi theo hạng thành viên">
        {vouchers.map((voucher) => (
          <article key={voucher.title} className={`promotion-card promotion-card--${voucher.tag.toLowerCase()}`}>
            <span>{voucher.tag}</span>
            <h2>{voucher.title}</h2>
            <strong>{voucher.value}</strong>
            <p>{voucher.description}</p>
          </article>
        ))}
      </section>

      <section className="promotions-combos">
        <div>
          <span>Combo tiết kiệm</span>
          <h2>Ưu đãi ăn uống cho từng nhóm người xem.</h2>
        </div>
        <div className="promotions-combo-list">
          {combos.map((deal) => (
            <p key={deal.id || deal.title || deal.description}>{deal.description}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
