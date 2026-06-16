import ChatConversationModel from "../models/chatConversation.model.js";
import { getGeminiApiKey, getGeminiModel, getOpenAiApiKey, getOpenAiModel } from "../config/env.js";
import MovieModel from "../models/movie.model.js";
import BookingModel from "../models/booking.model.js";
import FavoriteModel from "../models/favorite.model.js";
import ReviewModel from "../models/review.model.js";
import PromotionModel from "../models/promotion.model.js";

const serializeMessage = (message) => ({
  id: String(message._id),
  sender: message.sender,
  text: message.text,
  authorName: message.authorName || "",
  avatar: "",
  status: message.status || "sent",
  readAt: message.readAt || null,
  createdAt: message.createdAt,
});

const serializeConversation = (conversation) => ({
  id: String(conversation._id),
  sessionId: conversation.sessionId,
  userId: conversation.userId?._id || conversation.userId || null,
  fullName: conversation.fullName || "",
  avatar: "",
  email: conversation.email || "",
  status: conversation.status || "new",
  lastMessage: conversation.lastMessage || "",
  lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
  unreadByAdmin: Number(conversation.unreadByAdmin || 0),
  unreadByUser: Number(conversation.unreadByUser || 0),
  messages: (conversation.messages || []).map(serializeMessage),
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

const findUserConversation = async ({ conversationId = "", sessionId = "", userId = null }) => {
  if (conversationId) {
    const conversation = await ChatConversationModel.findById(conversationId);
    if (conversation && (!sessionId || conversation.sessionId === sessionId)) {
      return conversation;
    }
  }

  if (userId) {
    const conversation = await ChatConversationModel.findOne({ userId, status: { $ne: "closed" } }).sort({ updatedAt: -1 });
    if (conversation) return conversation;
  }

  if (sessionId) {
    const conversationBySession = await ChatConversationModel.findOne({ sessionId, status: { $ne: "closed" } }).sort({ updatedAt: -1 });
    if (conversationBySession) {
      if (!conversationBySession.userId || String(conversationBySession.userId) === String(userId)) {
        return conversationBySession;
      }
    }
  }

  return null;
};

const extractOpenAiText = (payload = {}) => {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];
  (payload.output || []).forEach((item) => {
    (item.content || []).forEach((content) => {
      if (typeof content.text === "string") {
        textParts.push(content.text);
      }
    });
  });

  return textParts.join("\n").trim();
};

const extractGeminiText = (payload = {}) =>
  (payload.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();

const movieAssistantInstruction =
  "Bạn là AI trợ lý CineSky. Chỉ hỗ trợ trong phạm vi CineSky: phim, lịch chiếu, đặt vé, chọn ghế, combo bắp nước, voucher/ưu đãi, membership, tài khoản và trải nghiệm đi xem phim. Nếu câu hỏi ngoài phạm vi, từ chối nhẹ và kéo về CineSky. Dùng catalog phim, ưu đãi và dữ liệu user được cung cấp; không bịa dữ liệu ngoài nguồn. Ưu tiên cá nhân hóa theo lịch sử đặt vé, phim yêu thích, review/rating và hạng thành viên. Trả lời tiếng Việt, ngắn gọn, không viết đoạn văn dài. Luôn trả JSON hợp lệ theo schema: {\"answer\":\"câu trả lời ngắn cho câu hỏi chung\", \"intro\":\"1 câu mở đầu khi có gợi ý phim\", \"recommendations\":[{\"title\":\"Tên phim\", \"reason\":\"Lý do tối đa 22 từ\", \"tags\":[\"tag 1\",\"tag 2\"]}], \"note\":\"1 câu CTA ngắn\", \"handoff\":false}. Chỉ dùng recommendations khi đang gợi ý phim, tối đa 3 phim. Với lỗi thanh toán thật, hoàn tiền, khiếu nại hoặc cần kiểm tra đơn, đặt handoff=true và khuyên chuyển admin.";

const buildMovieCatalog = async () => {
  const movies = await MovieModel.find({ deletedAt: null })
    .sort({ statusOrder: 1, catalogOrder: 1, legacyId: 1 })
    .limit(30)
    .select("legacyId title genres status duration rating description showtimes releaseDate");

  return movies.map((movie) => ({
    id: movie.legacyId,
    title: movie.title,
    genres: movie.genres || [],
    status: movie.status,
    duration: movie.duration || 0,
    rating: movie.rating || "",
    showtimes: movie.showtimes || [],
    releaseDate: movie.releaseDate || "",
    description: String(movie.description || "").slice(0, 260),
  }));
};

const buildPromotionContext = async () => {
  const promotions = await PromotionModel.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .limit(12)
    .select("title code kind tier description value requiredPoints minOrderValue eligibleTiers memberOnly applicableGenres");

  return promotions.map((promotion) => ({
    title: promotion.title,
    code: promotion.code || "",
    kind: promotion.kind || "",
    tier: promotion.tier || "",
    description: promotion.description || "",
    value: promotion.value || "",
    requiredPoints: promotion.requiredPoints || 0,
    minOrderValue: promotion.minOrderValue || 0,
    eligibleTiers: promotion.eligibleTiers || [],
    memberOnly: Boolean(promotion.memberOnly),
    applicableGenres: promotion.applicableGenres || [],
  }));
};

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isMembershipVoucherQuestion = (question = "") => {
  const normalized = normalizeText(question);
  return (
    /(member|membership|mambership|thanh vien|hang|diem)/.test(normalized) &&
    /(voucher|uu dai|khuyen mai|ma|code|hang|diem)/.test(normalized)
  );
};

const isMovieCountQuestion = (question = "") => {
  const normalized = normalizeText(question);
  return (
    /(bao nhieu|co may|may phim|so luong|tong)/.test(normalized) &&
    /phim/.test(normalized) &&
    /(dang chieu|sap chieu|chieu|rap|catalog|danh sach|tat ca|tong)/.test(normalized)
  );
};

const buildMovieCountResponse = (movies = [], question = "") => {
  const normalized = normalizeText(question);
  const nowShowing = movies.filter((movie) => movie.status === "now-showing");
  const comingSoon = movies.filter((movie) => movie.status === "coming-soon");
  const wantsComingSoon = /(sap chieu|coming)/.test(normalized);
  const wantsNowShowing = /(dang chieu|now showing|hien dang chieu|phim chieu|trong rap|ngoai rap)/.test(normalized);
  const wantsTotal = /(tat ca|tong|catalog|danh sach)/.test(normalized) || (!wantsComingSoon && !wantsNowShowing);

  if (wantsComingSoon && !wantsNowShowing) {
    return `CineSky hiện có ${comingSoon.length} phim sắp chiếu.`;
  }

  if (wantsNowShowing && !wantsComingSoon) {
    return `CineSky hiện có ${nowShowing.length} phim đang chiếu.`;
  }

  if (false && wantsComingSoon && !wantsNowShowing) {
    const titles = sampleTitles(comingSoon);
    return [
      `CineSky hiện có ${comingSoon.length} phim sắp chiếu.`,
      titles.length ? `Một vài phim: ${titles.join(", ")}.` : "",
    ].filter(Boolean).join("\n");
  }

  if (false && wantsNowShowing && !wantsComingSoon) {
    const titles = sampleTitles(nowShowing);
    return [
      `CineSky hiện có ${nowShowing.length} phim đang chiếu.`,
      titles.length ? `Một vài phim: ${titles.join(", ")}.` : "",
    ].filter(Boolean).join("\n");
  }

  if (wantsTotal) {
    return [
      `CineSky hiện có ${movies.length} phim trong catalog.`,
      `Đang chiếu: ${nowShowing.length} phim.`,
      `Sắp chiếu: ${comingSoon.length} phim.`,
    ].join("\n");
  }

  return `CineSky hiện có ${nowShowing.length} phim đang chiếu và ${comingSoon.length} phim sắp chiếu.`;
};

const tierRank = {
  Member: 0,
  Silver: 1,
  Gold: 2,
  Diamond: 3,
};

const getTierLabel = (tier = "Member") =>
  ({
    Member: "Thành viên",
    Silver: "Bạc",
    Gold: "Vàng",
    Diamond: "Kim cương",
  }[tier] || tier || "Thành viên");

const isPromotionEligibleForTier = (promotion, tier = "Member") => {
  if (!promotion.memberOnly && !promotion.tier && !promotion.eligibleTiers?.length) {
    return true;
  }

  if (promotion.eligibleTiers?.includes(tier)) {
    return true;
  }

  if (promotion.tier && tierRank[tier] >= tierRank[promotion.tier]) {
    return true;
  }

  return false;
};

const buildMembershipVoucherResponse = ({ user, promotions }) => {
  if (!user?._id) {
    return {
      answer: "Bạn cần đăng nhập để mình xem hạng thành viên, điểm và voucher phù hợp với tài khoản.",
      handoff: false,
      personalized: false,
    };
  }

  const tier = user.membership?.tier || "Member";
  const points = Number(user.membership?.points || 0);
  const totalTickets = Number(user.membership?.totalTickets || 0);
  const eligiblePromotions = promotions
    .filter((promotion) => isPromotionEligibleForTier(promotion, tier))
    .slice(0, 4);

  const voucherLines = eligiblePromotions.length
    ? eligiblePromotions.map((promotion, index) => {
        const code = promotion.code ? ` - mã ${promotion.code}` : "";
        const requirement = promotion.requiredPoints
          ? `, cần ${Number(promotion.requiredPoints).toLocaleString("vi-VN")} điểm`
          : "";
        return `${index + 1}. ${promotion.title}${code}: ${promotion.description}${requirement}`;
      })
    : ["Hiện chưa có voucher phù hợp với hạng của bạn."];

  return {
    membership: {
      tier,
      tierLabel: getTierLabel(tier),
      points,
      totalTickets,
    },
    vouchers: eligiblePromotions.map((promotion) => ({
      title: promotion.title,
      code: promotion.code || "",
      description: promotion.description || "",
      requiredPoints: promotion.requiredPoints || 0,
    })),
    answer: [
      `Bạn đang ở hạng ${getTierLabel(tier)} (${tier}).`,
      `Điểm hiện có: ${points.toLocaleString("vi-VN")} điểm. Tổng vé tích lũy: ${totalTickets.toLocaleString("vi-VN")}.`,
      "Voucher/ưu đãi phù hợp:",
      ...voucherLines,
      "Bạn có thể vào mục Ưu đãi để lưu mã trước khi thanh toán.",
    ].join("\n"),
    handoff: false,
    personalized: true,
  };
};

const buildUserTasteProfile = async (user) => {
  if (!user?._id) {
    return {
      isPersonalized: false,
      reason: "guest_or_missing_user",
    };
  }

  const [bookings, favorites, reviews] = await Promise.all([
    BookingModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .select("movieLegacyId status totalPrice createdAt"),
    FavoriteModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .select("movieLegacyId createdAt"),
    ReviewModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .select("movieLegacyId rating content createdAt"),
  ]);

  const movieIds = [
    ...bookings.map((item) => item.movieLegacyId),
    ...favorites.map((item) => item.movieLegacyId),
    ...reviews.map((item) => item.movieLegacyId),
  ].filter(Boolean);

  const relatedMovies = movieIds.length
    ? await MovieModel.find({ legacyId: { $in: [...new Set(movieIds)] }, deletedAt: null })
        .select("legacyId title genres status")
    : [];
  const movieMap = new Map(relatedMovies.map((movie) => [movie.legacyId, movie]));
  const genreScore = new Map();

  const addGenreScore = (movieLegacyId, score) => {
    const movie = movieMap.get(movieLegacyId);
    (movie?.genres || []).forEach((genre) => {
      genreScore.set(genre, (genreScore.get(genre) || 0) + score);
    });
  };

  bookings.forEach((booking) => addGenreScore(booking.movieLegacyId, booking.status === "cancelled" ? 0.5 : 2));
  favorites.forEach((favorite) => addGenreScore(favorite.movieLegacyId, 3));
  reviews.forEach((review) => addGenreScore(review.movieLegacyId, Number(review.rating || 0) >= 7 ? 3 : 1));

  const serializeMovieRef = (movieLegacyId) => {
    const movie = movieMap.get(movieLegacyId);
    return movie
      ? {
          id: movie.legacyId,
          title: movie.title,
          genres: movie.genres || [],
          status: movie.status,
        }
      : { id: movieLegacyId };
  };

  return {
    isPersonalized: Boolean(bookings.length || favorites.length || reviews.length),
    membership: user.membership || null,
    topGenres: [...genreScore.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, score]) => ({ genre, score })),
    recentBookings: bookings.slice(0, 5).map((booking) => ({
      ...serializeMovieRef(booking.movieLegacyId),
      status: booking.status,
    })),
    favoriteMovies: favorites.slice(0, 6).map((favorite) => serializeMovieRef(favorite.movieLegacyId)),
    reviewedMovies: reviews.slice(0, 6).map((review) => ({
      ...serializeMovieRef(review.movieLegacyId),
      rating: review.rating,
      content: String(review.content || "").slice(0, 120),
    })),
  };
};

const parseAiRecommendationPayload = (text = "") => {
  try {
    const parsed = JSON.parse(text);
    return {
      intro: String(parsed.intro || "").trim(),
      answer: String(parsed.answer || "").trim(),
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 3).map((item) => ({
            title: String(item.title || "").trim(),
            reason: String(item.reason || "").trim(),
            tags: Array.isArray(item.tags) ? item.tags.slice(0, 3).map((tag) => String(tag).trim()).filter(Boolean) : [],
          })).filter((item) => item.title)
        : [],
      note: String(parsed.note || "").trim(),
      handoff: Boolean(parsed.handoff),
    };
  } catch {
    return null;
  }
};

const formatRecommendationAnswer = (payload, fallbackText = "") => {
  if (!payload?.recommendations?.length) {
    return payload?.answer || payload?.intro || fallbackText || "Mình chưa có câu trả lời phù hợp. Bạn thử hỏi về phim, đặt vé, ưu đãi hoặc membership nhé.";
  }

  return [
    payload.intro,
    ...payload.recommendations.map((item, index) => `${index + 1}. ${item.title}: ${item.reason}`),
    payload.note,
  ].filter(Boolean).join("\n");
};

const askGeminiMovieAssistant = async (context) => {
  const model = getGeminiModel();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": getGeminiApiKey(),
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: movieAssistantInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  ...context,
                }),
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 900,
          temperature: 0.7,
          responseMimeType: "application/json",
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Không thể gọi Gemini lúc này");
  }

  return {
    answer: extractGeminiText(payload),
    model,
    provider: "gemini",
  };
};

const askOpenAiMovieAssistant = async (context) => {
  const model = getOpenAiModel();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenAiApiKey()}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: movieAssistantInstruction,
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
      max_output_tokens: 500,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Không thể gọi OpenAI lúc này");
  }

  return {
    answer: extractOpenAiText(payload),
    model,
    provider: "openai",
  };
};

const chatController = {
  askMovieAi: async (req, res) => {
    try {
      const question = String(req.body?.message || "").trim();

      if (!question) {
        return res.status(400).send({ success: false, message: "Câu hỏi là bắt buộc", data: null });
      }

      const [movieCatalog, promotionContext, tasteProfile] = await Promise.all([
        buildMovieCatalog(),
        buildPromotionContext(),
        buildUserTasteProfile(req.authUser),
      ]);

      if (isMovieCountQuestion(question)) {
        return res.status(200).send({
          success: true,
          message: "AI answered successfully",
          data: {
            answer: buildMovieCountResponse(movieCatalog, question),
            handoff: false,
            intro: "",
            recommendations: [],
            note: "",
            personalized: false,
            model: "cinesky-rules",
            provider: "cinesky",
          },
        });
      }

      if (isMembershipVoucherQuestion(question)) {
        const membershipResponse = buildMembershipVoucherResponse({
          user: req.authUser,
          promotions: promotionContext,
        });

        return res.status(200).send({
          success: true,
          message: "AI answered successfully",
          data: {
            answer: membershipResponse.answer,
            handoff: membershipResponse.handoff,
            membership: membershipResponse.membership || null,
            vouchers: membershipResponse.vouchers || [],
            intro: "",
            recommendations: [],
            note: "",
            personalized: membershipResponse.personalized,
            model: "cinesky-rules",
            provider: "cinesky",
          },
        });
      }

      if (!getGeminiApiKey() && !getOpenAiApiKey()) {
        return res.status(503).send({
          success: false,
          message: "AI chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY hoặc OPENAI_API_KEY trong Backend/.env",
          data: null,
        });
      }

      const aiPayload = {
        question,
        appCapabilities: [
          "Gợi ý phim theo gu và catalog CineSky",
          "Hướng dẫn đặt vé, chọn ghế, combo và thanh toán mô phỏng",
          "Giải thích voucher, ưu đãi, điểm và hạng membership",
          "Chuyển admin khi cần kiểm tra giao dịch, hoàn tiền hoặc khiếu nại",
        ],
        user: {
          fullName: req.authUser?.fullName || "",
          membershipTier: req.authUser?.membership?.tier || "",
        },
        tasteProfile,
        promotions: promotionContext,
        movies: movieCatalog,
      };

      const aiResult = getGeminiApiKey()
        ? await askGeminiMovieAssistant(aiPayload)
        : await askOpenAiMovieAssistant(aiPayload);
      const recommendationPayload = parseAiRecommendationPayload(aiResult.answer);
      const answer = formatRecommendationAnswer(recommendationPayload, aiResult.answer);

      return res.status(200).send({
        success: true,
        message: "AI answered successfully",
        data: {
          answer,
          handoff: Boolean(recommendationPayload?.handoff),
          intro: recommendationPayload?.intro || "",
          recommendations: recommendationPayload?.recommendations || [],
          note: recommendationPayload?.note || "",
          personalized: Boolean(tasteProfile.isPersonalized),
          model: aiResult.model,
          provider: aiResult.provider,
        },
      });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  startConversation: async (req, res) => {
    try {
      const {
        sessionId = "",
        fullName = "",
        email = "",
        message = "Khách cần admin hỗ trợ trực tiếp.",
      } = req.body || {};
      const safeSessionId = String(sessionId || "").trim();
      const safeMessage = String(message || "").trim();

      if (!safeSessionId) {
        return res.status(400).send({ success: false, message: "Session chat là bắt buộc", data: null });
      }

      let conversation = await findUserConversation({
        sessionId: safeSessionId,
        userId: req.authUser?._id || null,
      });

      if (!conversation) {
        conversation = await ChatConversationModel.create({
          sessionId: safeSessionId,
          userId: req.authUser?._id || null,
          fullName: String(fullName || req.authUser?.fullName || req.authUser?.email || "Khách hàng").trim(),
          email: String(email || req.authUser?.email || "").trim().toLowerCase(),
          avatar: "",
          messages: [],
        });
      }

      if (safeMessage) {
        conversation.messages.push({
          sender: "user",
          text: safeMessage,
          authorName: conversation.fullName || "Khách hàng"
        });
        conversation.lastMessage = safeMessage;
        conversation.lastMessageAt = new Date();
        conversation.status = "new";
        conversation.unreadByAdmin += 1;
      }

      if (req.authUser?.fullName) conversation.fullName = req.authUser.fullName;

      await conversation.save();

      return res.status(201).send({
        success: true,
        message: "Start chat successfully",
        data: serializeConversation(conversation),
      });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  getMyConversation: async (req, res) => {
    try {
      const conversation = await findUserConversation({
        conversationId: req.params.conversationId !== "latest" ? req.params.conversationId : "",
        sessionId: String(req.query.sessionId || "").trim(),
        userId: req.authUser?._id || null,
      });

      if (!conversation) {
        return res.status(404).send({ success: false, message: "Không tìm thấy cuộc chat", data: null });
      }

      conversation.unreadByUser = 0;
      conversation.messages.forEach((message) => {
        if (message.sender === "admin" && !message.readAt) {
          message.status = "read";
          message.readAt = new Date();
        }
      });
      await conversation.save();

      return res.status(200).send({ success: true, message: "Get chat successfully", data: serializeConversation(conversation) });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  sendUserMessage: async (req, res) => {
    try {
      const conversation = await findUserConversation({
        conversationId: req.params.conversationId !== "latest" ? req.params.conversationId : "",
        sessionId: String(req.body?.sessionId || "").trim(),
        userId: req.authUser?._id || null,
      });
      const text = String(req.body?.text || "").trim();

      if (!conversation) {
        return res.status(404).send({ success: false, message: "Không tìm thấy cuộc chat", data: null });
      }

      if (!text) {
        return res.status(400).send({ success: false, message: "Tin nhắn là bắt buộc", data: null });
      }

      conversation.messages.push({
        sender: "user",
        text,
        authorName: conversation.fullName || "Khách hàng"
      });
      conversation.lastMessage = text;
      conversation.lastMessageAt = new Date();
      conversation.status = "new";
      conversation.unreadByAdmin += 1;
      
      await conversation.save();

      return res.status(200).send({ success: true, message: "Send message successfully", data: serializeConversation(conversation) });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  getAdminConversations: async (_req, res) => {
    try {
      const conversations = await ChatConversationModel.find()
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .limit(100);

      return res.status(200).send({
        success: true,
        message: "Get admin chats successfully",
        data: conversations.map(serializeConversation),
      });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  getAdminConversation: async (req, res) => {
    try {
      const conversation = await ChatConversationModel.findById(req.params.conversationId);

      if (!conversation) {
        return res.status(404).send({ success: false, message: "Không tìm thấy cuộc chat", data: null });
      }

      conversation.unreadByAdmin = 0;
      conversation.messages.forEach((message) => {
        if (message.sender === "user" && !message.readAt) {
          message.status = "read";
          message.readAt = new Date();
        }
      });
      await conversation.save();

      return res.status(200).send({ success: true, message: "Get admin chat successfully", data: serializeConversation(conversation) });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },

  sendAdminMessage: async (req, res) => {
    try {
      const conversation = await ChatConversationModel.findById(req.params.conversationId);
      const text = String(req.body?.text || "").trim();

      if (!conversation) {
        return res.status(404).send({ success: false, message: "Không tìm thấy cuộc chat", data: null });
      }

      if (!text) {
        return res.status(400).send({ success: false, message: "Tin nhắn là bắt buộc", data: null });
      }

      conversation.messages.push({
        sender: "admin",
        text,
        authorName: req.authUser?.fullName || req.authUser?.email || "Admin"
      });
      conversation.lastMessage = text;
      conversation.lastMessageAt = new Date();
      conversation.status = "in_progress";
      conversation.unreadByUser += 1;
      conversation.unreadByAdmin = 0;
      await conversation.save();

      return res.status(200).send({ success: true, message: "Send admin message successfully", data: serializeConversation(conversation) });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message || "Internal server error", data: null });
    }
  },
};

export default chatController;
