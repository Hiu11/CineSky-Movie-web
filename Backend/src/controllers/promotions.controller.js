import PromotionModel from "../models/promotion.model.js";

const defaultPromotions = [
  {
    kind: "hero",
    tag: "Hot voucher",
    title: "Giảm 30K",
    value: "Giảm 30K",
    description: "Cho hóa đơn từ 199K khi đặt vé online và mua combo tại CineSky.",
    order: 1,
  },
  {
    kind: "member",
    tier: "Silver",
    tag: "Silver",
    title: "Silver Movie Night",
    value: "Giảm 15%",
    description: "Áp dụng cho vé 2D từ thứ Hai đến thứ Năm khi đăng nhập tài khoản thành viên Silver.",
    order: 2,
  },
  {
    kind: "member",
    tier: "Gold",
    tag: "Gold",
    title: "Gold Combo Plus",
    value: "Combo 69K",
    description: "Bắp lớn + 2 nước ngọt cho hội viên Gold khi đặt vé online tại CineSky.",
    order: 3,
  },
  {
    kind: "member",
    tier: "Diamond",
    tag: "Diamond",
    title: "Diamond Premiere",
    value: "1 vé miễn phí",
    description: "Ưu đãi sinh nhật dành cho hội viên Diamond, dùng cho phim đang chiếu trong tháng.",
    order: 4,
  },
  {
    kind: "combo",
    tag: "Combo Couple",
    title: "Combo Couple",
    description: "2 vé + bắp caramel + 2 nước chỉ từ 219K.",
    order: 5,
  },
  {
    kind: "combo",
    tag: "Combo Family",
    title: "Combo Family",
    description: "4 vé + 2 bắp lớn + 4 nước, phù hợp suất cuối tuần.",
    order: 6,
  },
  {
    kind: "combo",
    tag: "Student Day",
    title: "Student Day",
    description: "Xuất trình thẻ học sinh/sinh viên để nhận giá vé ưu đãi mỗi thứ Tư.",
    order: 7,
  },
];

const serializePromotion = (promotion) => ({
  id: promotion._id,
  kind: promotion.kind,
  tier: promotion.tier || "",
  tag: promotion.tag,
  title: promotion.title,
  value: promotion.value || "",
  description: promotion.description,
  order: promotion.order,
});

const ensureDefaultPromotions = async () => {
  const existingCount = await PromotionModel.countDocuments();

  if (existingCount === 0) {
    await PromotionModel.insertMany(defaultPromotions);
  }
};

const promotionsController = {
  getPromotions: async (req, res) => {
    try {
      await ensureDefaultPromotions();

      const promotions = await PromotionModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
      const serializedPromotions = promotions.map(serializePromotion);

      return res.status(200).send({
        success: true,
        message: "Get promotions successfully",
        data: {
          heroVoucher: serializedPromotions.find((item) => item.kind === "hero") || null,
          vouchers: serializedPromotions.filter((item) => item.kind === "member"),
          combos: serializedPromotions.filter((item) => item.kind === "combo"),
        },
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default promotionsController;
