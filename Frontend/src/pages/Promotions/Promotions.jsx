import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import promoVoucherAnimation from "../../assets/animations/promoVoucher.json";
import { getPromotions } from "../../services/promotionService";
import {
  getMyProfile,
  saveMyPromotion,
  unsaveMyPromotion,
  updateStoredUser,
} from "../../services/authService";
import "../HomePage/HomePage.css";
import "./Promotions.css";

const fallbackPromotions = {
  heroVoucher: {
    tag: "Hot voucher",
    title: "Giảm 30K",
    value: "Giảm 30K",
    description: "Cho hóa đơn từ 199K khi đặt vé online tại CineSky.",
  },
  vouchers: [],
  combos: [],
};

const tierOrder = ["Silver", "Gold", "Diamond", "Member"];

const cinematicParticles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: `${1 + (index % 3)}px`,
  delay: `${(index % 9) * -0.7}s`,
  duration: `${8 + (index % 6)}s`,
}));

const getTierGroups = (vouchers = []) => {
  const groups = vouchers.reduce((map, voucher) => {
    const tier = voucher.tier || voucher.tag || "Member";
    return {
      ...map,
      [tier]: [...(map[tier] || []), voucher],
    };
  }, {});

  return Object.entries(groups).sort(
    ([left], [right]) => tierOrder.indexOf(left) - tierOrder.indexOf(right)
  );
};

export default function Promotions() {
  const [promotions, setPromotions] = useState(fallbackPromotions);
  const [savedIds, setSavedIds] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    getMyProfile()
      .then((profile) => {
        if (!isMounted) return;
        const normalizedUser = updateStoredUser(profile);
        setSavedIds(normalizedUser.savedPromotionIds || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleSave = async (promotion) => {
    if (!promotion?.id) return;

    try {
      const isSaved = savedIds.includes(String(promotion.id));
      const updatedUser = isSaved
        ? await unsaveMyPromotion(promotion.id)
        : await saveMyPromotion(promotion.id);
      const normalizedUser = updateStoredUser(updatedUser);

      setSavedIds(normalizedUser.savedPromotionIds || []);
      setSaveMessage(isSaved ? "Đã bỏ lưu mã ưu đãi." : "Đã lưu mã vào trang cá nhân.");
    } catch (error) {
      setSaveMessage(error.message || "Đăng nhập để lưu mã ưu đãi.");
    }
  };

  const { heroVoucher, vouchers, combos } = promotions;
  const tierGroups = useMemo(() => getTierGroups(vouchers), [vouchers]);

  return (
    <main className="promotions-page">
      <div className="home-cinematic-backdrop" aria-hidden="true">
        <div className="home-cinematic-backdrop__grain"></div>
        <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--gold"></div>
        <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--blue"></div>
        <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--left"></div>
        <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--right"></div>
        <div className="home-cinematic-backdrop__film home-cinematic-backdrop__film--left"></div>
        <div className="home-cinematic-backdrop__film home-cinematic-backdrop__film--right"></div>
        <div className="home-cinematic-backdrop__particles">
          {cinematicParticles.map((particle) => (
            <span
              key={particle.id}
              style={{
                "--particle-left": particle.left,
                "--particle-top": particle.top,
                "--particle-size": particle.size,
                "--particle-delay": particle.delay,
                "--particle-duration": particle.duration,
              }}
            />
          ))}
        </div>
      </div>

      <section className="promotions-hero">
        <div>
          <span>Ưu đãi CineSky</span>
          <h1>Voucher, combo và quyền lợi theo hạng thành viên.</h1>
          <p>Trang này hiển thị ưu đãi nổi bật. Muốn dùng về sau thì lưu mã vào trang cá nhân, lúc đặt vé nhập mã tại bước thanh toán.</p>
          <Link to="/?tab=now">Chọn phim ngay</Link>
        </div>
        <div className="promotions-ticket" aria-label="Voucher nổi bật">
          <div className="promotions-lottie" aria-hidden="true">
            <Lottie animationData={promoVoucherAnimation} loop autoplay />
          </div>
          <small>{heroVoucher.tag}</small>
          <strong>{heroVoucher.value || heroVoucher.title}</strong>
          {heroVoucher.code ? <code className="promotion-code">{heroVoucher.code}</code> : null}
          {heroVoucher.id ? (
            <button type="button" className="promotion-save-btn" onClick={() => handleToggleSave(heroVoucher)}>
              {savedIds.includes(String(heroVoucher.id)) ? "Đã lưu" : "Lưu mã"}
            </button>
          ) : null}
          <p>{heroVoucher.description}</p>
        </div>
      </section>

      {saveMessage ? <p className="promotion-save-message">{saveMessage}</p> : null}

      <section className="promotions-grid promotions-grid--tiered" aria-label="Ưu đãi theo hạng thành viên">
        {tierGroups.map(([tier, tierVouchers]) => (
          <div key={tier} className="promotion-tier-group">
            <div className="promotion-tier-head">
              <span>{tier}</span>
              <strong>{tierVouchers.length} ưu đãi</strong>
            </div>
            <div className="promotion-tier-list">
              {tierVouchers.map((voucher) => (
                <article key={voucher.id || voucher.title} className={`promotion-card promotion-card--${String(voucher.theme || voucher.tag || "slate").toLowerCase()}`}>
                  <span>{voucher.tag}</span>
                  <h2>{voucher.title}</h2>
                  <strong>{voucher.value}</strong>
                  {voucher.code ? <code className="promotion-code">{voucher.code}</code> : null}
                  <p>{voucher.description}</p>
                  <div className="promotion-meta">
                    {voucher.requiredPoints ? <small>{Number(voucher.requiredPoints).toLocaleString("vi-VN")} điểm</small> : null}
                    {voucher.maxUsesPerUser ? <small>{voucher.maxUsesPerUser} lần/user</small> : null}
                    {voucher.applicableGenres?.length ? <small>{voucher.applicableGenres.join(", ")}</small> : null}
                  </div>
                  <button type="button" className="promotion-save-btn" onClick={() => handleToggleSave(voucher)}>
                    {savedIds.includes(String(voucher.id)) ? "Đã lưu" : "Lưu mã"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="promotions-combos">
        <div>
          <span>Combo tiết kiệm</span>
          <h2>Ưu đãi ăn uống cho từng nhóm người xem.</h2>
        </div>
        <div className="promotions-combo-list">
          {combos.map((deal) => (
            <p key={deal.id || deal.title || deal.description}>
              {deal.code ? <code className="promotion-code promotion-code--inline">{deal.code}</code> : null}
              {deal.description}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
