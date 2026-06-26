import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import lottie from "lottie-web";
import jellyfishChatAnimation from "../../assets/animations/JellyFish.json";
import { askMovieAi, getChatConversation, sendChatMessage, startChatConversation } from "../../services/chatService";
import "./AdminChatBox.css";


const CHAT_STORAGE_KEY = "cinesky-admin-chat-v3";
const getChatStorageKey = (userId) => `${CHAT_STORAGE_KEY}-${userId ? `user-${userId}` : "guest"}`;

const defaultQuestions = [
  {
    id: "movie-ai",
    label: "Hỏi AI",
    answer:
      "Bạn có thể hỏi mình về phim, đặt vé, ưu đãi, membership hoặc trải nghiệm đi xem phim.",
    category: "ai_assistant",
  },
  {
    id: "admin",
    label: "Chuyển admin",
    answer: "",
    category: "other",
  },
  {
    id: "booking",
    label: "Cách đặt vé",
    answer:
      "Bạn chọn phim, bấm Đặt vé, chọn suất chiếu, ghế, combo bắp nước rồi xác nhận thanh toán. Vé sẽ nằm trong Lịch sử đặt vé.",
    category: "booking_issue",
  },
  {
    id: "payment",
    label: "Lỗi thanh toán",
    answer:
      "Nếu thanh toán bị gián đoạn, bạn kiểm tra lại Lịch sử đặt vé. Nếu chưa có vé, hãy thử đặt lại hoặc gửi mã giao dịch để admin kiểm tra.",
    category: "payment",
  },
  {
    id: "cancel",
    label: "Hủy vé",
    answer:
      "Bạn vào Lịch sử đặt vé và chọn Hủy vé nếu vé còn trong điều kiện hủy. Vé đã check-in hoặc quá sát giờ chiếu có thể không hủy được.",
    category: "booking_issue",
  },
  {
    id: "showtime",
    label: "Suất chiếu",
    answer:
      "Suất chiếu hiển thị trong trang chi tiết phim và trang đặt vé. Nếu bạn không thấy giờ mong muốn, lịch có thể chưa được cập nhật.",
    category: "movie_showtime",
  },
  {
    id: "promotion",
    label: "Mã ưu đãi",
    answer:
      "Bạn có thể xem ưu đãi tại mục Khuyến mãi, lưu mã rồi nhập trong bước thanh toán. Một số mã yêu cầu hạng thành viên hoặc đơn tối thiểu.",
    category: "other",
  },
];

const initialMessages = [
  {
    id: "welcome",
    sender: "bot",
    text: "Xin chào, CineSky có thể hỗ trợ bạn trước bằng một vài câu hỏi nhanh. Nếu chưa giải quyết được, mình sẽ chuyển yêu cầu tới admin.",
    createdAt: new Date(0).toISOString(),
  },
];

const supportKeywords = [
  ["thanh toán", "payment", "momo", "vnpay", "tiền", "giao dịch"],
  ["hủy", "huy", "cancel", "hoàn tiền", "refund"],
  ["đặt vé", "dat ve", "booking", "ghế", "ghe", "vé"],
  ["suất chiếu", "suat chieu", "lịch chiếu", "lich chieu", "giờ chiếu"],
  ["ưu đãi", "uu dai", "voucher", "mã", "khuyến mãi"],
];

const movieAiKeywords = [
  "ai",
  "hỏi ai",
  "hoi ai",
  "tư vấn",
  "tu van",
  "gợi ý phim",
  "goi y phim",
  "recommend",
  "recommendation",
  "rcm",
  "phim nào hay",
  "phim nao hay",
  "nên xem phim",
  "nen xem phim",
  "xem phim gì",
  "xem phim gi",
  "phim hay",
  "phim kinh dị",
  "phim hai",
  "phim hành động",
  "phim hanh dong",
  "phim tình cảm",
  "phim tinh cam",
  "đặt vé",
  "dat ve",
  "cách đặt",
  "cach dat",
  "chọn ghế",
  "chon ghe",
  "ghế",
  "ghe",
  "combo",
  "bắp nước",
  "bap nuoc",
  "voucher",
  "ưu đãi",
  "uu dai",
  "khuyến mãi",
  "khuyen mai",
  "membership",
  "thành viên",
  "thanh vien",
  "điểm",
  "diem",
  "hạng",
  "hang",
  "lịch chiếu",
  "lich chieu",
  "suất chiếu",
  "suat chieu",
  "rạp",
  "rap",
  "date",
  "gia đình",
  "gia dinh",
];

const readStoredMessages = (storageKey = CHAT_STORAGE_KEY) => {
  if (typeof window === "undefined") {
    return initialMessages;
  }

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return Array.isArray(stored?.messages) && stored.messages.length ? stored.messages : initialMessages;
  } catch {
    return initialMessages;
  }
};

const readStoredConversationId = (storageKey = CHAT_STORAGE_KEY) => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return stored?.conversationId || "";
  } catch {
    return "";
  }
};

const readStoredContact = (storageKey = CHAT_STORAGE_KEY) => {
  if (typeof window === "undefined") {
    return { fullName: "", email: "" };
  }

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return {
      fullName: stored?.contact?.fullName || "",
      email: stored?.contact?.email || "",
    };
  } catch {
    return { fullName: "", email: "" };
  }
};

const getChatSessionId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const existingId = localStorage.getItem("cinesky-chat-session-id");
  if (existingId) {
    return existingId;
  }

  const nextId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("cinesky-chat-session-id", nextId);
  return nextId;
};

const buildMessage = (sender, text, extra = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  text,
  createdAt: new Date().toISOString(),
  ...extra,
});

const cleanAiTextLine = (line = "") =>
  line
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*]\s*/, "")
    .trim();

const splitAiText = (text = "") =>
  String(text)
    .split(/\n+/)
    .map(cleanAiTextLine)
    .filter(Boolean);

const renderAiTextAnswer = (text = "") => {
  const lines = splitAiText(text);

  if (!lines.length) {
    return <p>{text}</p>;
  }

  return (
    <div className="admin-chat__ai-answer">
      {lines.map((line, index) => {
        const looksLikeTitle = line.length <= 34 && (line.endsWith(":") || line === line.toUpperCase());
        return looksLikeTitle ? (
          <strong key={`${line}-${index}`} className="admin-chat__ai-answer-title">
            {line.replace(/:$/, "")}
          </strong>
        ) : (
          <p key={`${line}-${index}`} className="admin-chat__ai-answer-line">
            {line}
          </p>
        );
      })}
    </div>
  );
};

const mapServerMessage = (message) =>
  buildMessage(message.sender === "admin" ? "admin" : "user", message.text, {
    id: String(message.id || `${message.sender}-${message.createdAt}`),
    source: "support",
    status: message.status || "sent",
    readAt: message.readAt || null,
    avatar: message.avatar || "",
    authorName: message.authorName || "",
    createdAt: message.createdAt || new Date().toISOString(),
  });

const getMessageTime = (message) => {
  const time = new Date(message?.createdAt || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const sortMessagesByTime = (items = []) =>
  [...items].sort((a, b) => getMessageTime(a) - getMessageTime(b));

const requestBrowserNotification = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
};

export default function AdminChatBox({ user, showToast }) {
  const [avatarCacheBuster] = useState(() => Date.now());
  const storageKey = getChatStorageKey(user?.id);
  const storedContact = readStoredContact(storageKey);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => readStoredMessages(storageKey));
  const [conversationId, setConversationId] = useState(() => readStoredConversationId(storageKey));
  const [draft, setDraft] = useState("");
  const [composerMode, setComposerMode] = useState("ai");
  const [handoff, setHandoff] = useState({ requested: false, category: "other", pendingText: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [contact, setContact] = useState({
    fullName: user?.fullName || user?.name || storedContact.fullName || "",
    email: user?.email || storedContact.email || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Drag state
  const [widgetPos, setWidgetPos] = useState({ x: 0, y: 0 });
  const [isTooltipHidden, setIsTooltipHidden] = useState(false);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false });
  
  const scrollRef = useRef(null);
  const lastAdminMessageIdRef = useRef("");
  const lottieContainerRef = useRef(null);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current.isDragging = true;
    dragRef.current.hasMoved = false;
    dragRef.current.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragRef.current.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    dragRef.current.initialX = widgetPos.x;
    dragRef.current.initialY = widgetPos.y;
    
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const dx = currentX - dragRef.current.startX;
    const dy = currentY - dragRef.current.startY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragRef.current.hasMoved = true;
    }
    
    setWidgetPos({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerUp);
  };

  const handleLauncherClick = (e) => {
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(!isOpen);
    setIsTooltipHidden(true);
  };

  useEffect(() => {
    let anim = null;
    if (lottieContainerRef.current && !anim) {
      anim = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: jellyfishChatAnimation,
      });
      anim.setSpeed(1);
    }
    return () => {
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  const hasContact = Boolean(contact.fullName.trim() && contact.email.trim());

  useEffect(() => {
    const nextStorageKey = getChatStorageKey(user?.id);
    setMessages(readStoredMessages(nextStorageKey));
    setConversationId(readStoredConversationId(nextStorageKey));
    setContact((current) => ({
      fullName: user?.fullName || user?.name || current.fullName || "",
      email: user?.email || current.email || "",
    }));
  }, [user?.id, user?.fullName, user?.name, user?.email]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify({ messages, conversationId, contact }));
    }
  }, [contact, conversationId, messages, storageKey]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      requestBrowserNotification();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!conversationId && !user?.id) {
      return undefined;
    }

    let isMounted = true;
    let hasFailedLatest = false;

    const syncSupportMessages = async () => {
      if (!conversationId && hasFailedLatest) {
        return;
      }

      try {
        const idToFetch = conversationId || "latest";
        const conversation = await getChatConversation(idToFetch, { sessionId: getChatSessionId() });
        const supportMessages = conversation?.messages || [];

        if (!isMounted || !Array.isArray(supportMessages)) {
          return;
        }

        if (conversation?.id && !conversationId) {
          setConversationId(conversation.id);
        }

        setMessages((current) => {
          const normalMessages = current.filter((message) => message.source !== "support");
          const nextSupportMessages = supportMessages.map(mapServerMessage);
          const lastAdminMessage = [...nextSupportMessages].reverse().find((message) => message.sender === "admin");

          if (lastAdminMessage?.id && lastAdminMessage.id !== lastAdminMessageIdRef.current) {
            if (lastAdminMessageIdRef.current && !isOpen) {
              setUnreadCount((count) => count + 1);
              showToast?.({ type: "info", title: "Admin vừa nhắn", message: lastAdminMessage.text });
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("CineSky Admin", { body: lastAdminMessage.text });
              } else {
                requestBrowserNotification();
              }
            }
            lastAdminMessageIdRef.current = lastAdminMessage.id;
          }

          return sortMessagesByTime([...normalMessages, ...nextSupportMessages]);
        });
      } catch (error) {
        if (!conversationId) {
          hasFailedLatest = true;
        }
        // Keep current messages visible if the server is temporarily unavailable.
      }
    };

    syncSupportMessages();
    const intervalId = window.setInterval(syncSupportMessages, 6000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [conversationId, isOpen, showToast, user?.id]);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const unresolvedText = useMemo(() => {
    const userMessages = messages.filter((message) => message.sender === "user").map((message) => message.text);
    return userMessages.slice(-4).join("\n");
  }, [messages]);

  const appendMessages = (...nextMessages) => {
    setMessages((current) => sortMessagesByTime([...current, ...nextMessages]));
  };

  const askAiForMovieRecommendation = async (text) => {
    const typingMessage = buildMessage("bot", "Mình đang hỏi AI CineSky...", {
      id: `ai-typing-${Date.now()}`,
      source: "ai",
      status: "loading",
    });

    appendMessages(buildMessage("user", text), typingMessage);

    try {
      const aiResponse = await askMovieAi(text);
      setMessages((current) =>
        current.map((message) =>
          message.id === typingMessage.id
            ? {
                ...message,
                text: aiResponse.answer || "Mình chưa tìm được gợi ý phù hợp. Bạn thử nói rõ gu phim hơn nhé.",
                intro: aiResponse.intro || "",
                recommendations: Array.isArray(aiResponse.recommendations) ? aiResponse.recommendations : [],
                membership: aiResponse.membership || null,
                vouchers: Array.isArray(aiResponse.vouchers) ? aiResponse.vouchers : [],
                note: aiResponse.note || "",
                personalized: Boolean(aiResponse.personalized),
                status: "sent",
              }
            : message
        )
      );
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === typingMessage.id
            ? {
                ...message,
                text:
                  error.message ||
                  "AI hiện chưa sẵn sàng. Bạn có thể hỏi admin hoặc thử lại sau.",
                status: "failed",
              }
            : message
        )
      );
    }
  };

  const answerQuestion = (question) => {
    if (question.id === "movie-ai") {
      setComposerMode("ai");
      appendMessages(
        buildMessage("user", "Hỏi AI"),
        buildMessage(
          "bot",
          "Bạn hỏi mình trực tiếp ở ô nhập nhé. Mình có thể hỗ trợ về phim, lịch chiếu, đặt vé, chọn ghế, combo, voucher, membership hoặc trải nghiệm đi xem phim."
        )
      );
      return;
    }

    if (question.id === "admin") {
      requestAdmin("other", unresolvedText);
      return;
    }

    appendMessages(
      buildMessage("user", question.label),
      buildMessage("bot", question.answer),
      buildMessage("bot", "Vấn đề của bạn đã được giải quyết chưa?", { action: "resolve-check", category: question.category })
    );
  };

  const findAutoAnswer = (text) => {
    const normalized = text.toLowerCase();
    const matchedIndex = supportKeywords.findIndex((keywords) =>
      keywords.some((keyword) => normalized.includes(keyword))
    );

    return matchedIndex >= 0 ? defaultQuestions[matchedIndex] : null;
  };

  const isMovieAiQuestion = (text) => {
    const normalized = text.toLowerCase();
    return movieAiKeywords.some((keyword) => normalized.includes(keyword));
  };

  const requestAdmin = (category = "other", pendingText = "") => {
    setComposerMode("admin");
    setHandoff({ requested: true, category, pendingText });
    appendMessages(
      buildMessage("bot", "Mình sẽ chuyển cuộc trò chuyện này tới admin. Bạn để lại tên và email để admin phản hồi nhé.")
    );
  };

  const handleSubmitMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    setDraft("");

    if (composerMode === "ai" || isMovieAiQuestion(text)) {
      await askAiForMovieRecommendation(text);
      return;
    }

    if (conversationId) {
      const tempId = `temp-${Date.now()}`;
      appendMessages(buildMessage("user", text, { id: tempId, source: "support", status: "sending" }));

      try {
        const updatedConversation = await sendChatMessage(conversationId, {
          text,
          sessionId: getChatSessionId(),
            avatar: user?.avatar || "",
        });

        if (Array.isArray(updatedConversation?.messages)) {
          setMessages((current) =>
            sortMessagesByTime([
              ...current.filter((message) => message.source !== "support"),
              ...updatedConversation.messages.map(mapServerMessage),
            ])
          );
        }
      } catch (error) {
        setMessages((current) =>
          current.map((message) => (message.id === tempId ? { ...message, status: "failed" } : message))
        );
        showToast?.({
          type: "error",
          title: "Chưa gửi được",
          message: error.message || "Không thể gửi tin nhắn lúc này.",
        });
      }
      return;
    }

    const matchedQuestion = findAutoAnswer(text);

    if (matchedQuestion) {
      appendMessages(
        buildMessage("user", text),
        buildMessage("bot", matchedQuestion.answer),
        buildMessage("bot", "Vấn đề của bạn đã được giải quyết chưa?", { action: "resolve-check", category: matchedQuestion.category })
      );
      return;
    }

    appendMessages(
      buildMessage("user", text),
      buildMessage("bot", "Mình chưa có câu trả lời chắc chắn cho nội dung này.")
    );
    requestAdmin("other", text);
  };

  const submitHandoff = async (event) => {
    event.preventDefault();

    if (!hasContact) {
      showToast?.({ type: "error", title: "Thiếu thông tin", message: "Vui lòng nhập tên và email để admin liên hệ." });
      return;
    }

    try {
      setIsSubmitting(true);
      const createdConversation = await startChatConversation({
        sessionId: getChatSessionId(),
            avatar: user?.avatar || "",
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        message: handoff.pendingText || unresolvedText || "Khách cần admin hỗ trợ trực tiếp.",
      });

      setHandoff({ requested: false, category: "other", pendingText: "" });
      if (createdConversation?.id) {
        setConversationId(String(createdConversation.id));
      }
      setComposerMode("admin");
      if (Array.isArray(createdConversation?.messages) && createdConversation.messages.length > 0) {
        setMessages((current) =>
          sortMessagesByTime([
            ...current.filter((message) => message.source !== "support"),
            ...createdConversation.messages.map(mapServerMessage),
          ])
        );
      }
      appendMessages(buildMessage("admin", "Bạn đã được chuyển sang chat trực tiếp. Admin sẽ trả lời ngay tại khung này."));
      showToast?.({ type: "success", title: "Đã chuyển tới admin", message: "Yêu cầu hỗ trợ đã được gửi." });
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Chưa gửi được",
        message: error.message || "Không thể chuyển yêu cầu tới admin lúc này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetChat = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    setMessages(initialMessages);
    setConversationId("");
    setHandoff({ requested: false, category: "other", pendingText: "" });
    setComposerMode("ai");
    setDraft("");
  };

  return (
    <aside 
      className={"admin-chat" + (isOpen ? " admin-chat--open" : "") + (conversationId ? " admin-chat--support" : "")} 
      aria-label="Chat với admin"
      style={{ transform: `translate(${widgetPos.x}px, ${widgetPos.y}px)`, touchAction: "none" }}
    >
      {isOpen ? (
        <section className="admin-chat__panel">
          <header className="admin-chat__header">
            <div>
              <span>Hỗ trợ CineSky</span>
              <strong>AI & admin</strong>
            </div>
            <div className="admin-chat__header-actions">
              <button type="button" onClick={resetChat} title="Làm mới chat" aria-label="Làm mới chat">
                ↻
              </button>
              <button type="button" onClick={() => setIsOpen(false)} title="Thu nhỏ" aria-label="Thu nhỏ chat">
                ×
              </button>
            </div>
          </header>

          <div className="admin-chat__quick-list" aria-label="Câu hỏi mặc định">
            {defaultQuestions.map((question) => (
              <button
                key={question.id}
                type="button"
                className={
                  question.id === "movie-ai"
                    ? "admin-chat__quick-ai"
                    : question.id === "admin"
                      ? "admin-chat__quick-admin"
                      : ""
                }
                onClick={() => answerQuestion(question)}
              >
                {question.label}
              </button>
            ))}
          </div>

          <div className="admin-chat__messages" ref={scrollRef}>
            {messages.map((message) => (
              <div key={message.id} className={`admin-chat__message-row admin-chat__message-row--${message.sender}`}>
                {message.sender === "admin" && (
                  <img 
                    src={`${API_BASE_URL}/api/v1/auth/users/admin/avatar?v=${avatarCacheBuster}`} 
                    alt="Admin" 
                    className="admin-chat__avatar admin-chat__avatar--admin" 
                  />
                )}
                {message.sender === "bot" && (
                  <span className="admin-chat__avatar admin-chat__avatar--bot">🤖</span>
                )}
                <div className={`admin-chat__message admin-chat__message--${message.sender}`}>
                  {Array.isArray(message.recommendations) && message.recommendations.length > 0 ? (
                    <div className="admin-chat__ai-recommendations">
                      {message.intro ? <p className="admin-chat__ai-intro">{message.intro}</p> : null}
                      <div className="admin-chat__ai-list">
                        {message.recommendations.map((item, index) => (
                          <article key={`${item.title}-${index}`} className="admin-chat__ai-card">
                            <strong>{item.title}</strong>
                            <span>{item.reason}</span>
                            {item.tags?.length ? (
                              <div className="admin-chat__ai-tags">
                                {item.tags.map((tag) => <small key={tag}>{tag}</small>)}
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                      {message.note ? <p className="admin-chat__ai-note">{message.note}</p> : null}
                      <small className="admin-chat__ai-source">
                        {message.personalized ? "Dựa trên dữ liệu tài khoản của bạn" : "Dựa trên dữ liệu CineSky"}
                      </small>
                    </div>
                  ) : message.membership ? (
                    <div className="admin-chat__ai-recommendations admin-chat__ai-membership">
                      <div className="admin-chat__member-card">
                        <span>Hạng hiện tại</span>
                        <strong>{message.membership.tierLabel || message.membership.tier}</strong>
                        <small>{Number(message.membership.points || 0).toLocaleString("vi-VN")} điểm • {Number(message.membership.totalTickets || 0).toLocaleString("vi-VN")} vé</small>
                      </div>
                      <div className="admin-chat__ai-list">
                        {(message.vouchers || []).length > 0 ? (
                          message.vouchers.map((voucher, index) => (
                            <article key={`${voucher.title}-${index}`} className="admin-chat__ai-card">
                              <strong>{voucher.title}</strong>
                              {voucher.code ? <code>{voucher.code}</code> : null}
                              <span>{voucher.description}</span>
                              {voucher.requiredPoints ? <small>Cần {Number(voucher.requiredPoints).toLocaleString("vi-VN")} điểm</small> : null}
                            </article>
                          ))
                        ) : (
                          <p className="admin-chat__ai-note">Hiện chưa có voucher phù hợp với hạng của bạn.</p>
                        )}
                      </div>
                      <p className="admin-chat__ai-note">Bạn có thể vào mục Ưu đãi để lưu mã trước khi thanh toán.</p>
                      <small className="admin-chat__ai-source">Dựa trên membership của tài khoản</small>
                    </div>
                  ) : message.source === "ai" ? (
                    renderAiTextAnswer(message.text)
                  ) : (
                    <p>{message.text}</p>
                  )}
                  {message.sender === "user" && message.source === "support" ? (
                    <small className={`admin-chat__message-status admin-chat__message-status--${message.status || "sent"}`}>
                      {message.status === "sending"
                        ? "Đang gửi"
                        : message.status === "failed"
                          ? "Gửi thất bại"
                          : message.readAt || message.status === "read"
                            ? "Đã xem"
                            : "Đã gửi"}
                    </small>
                  ) : null}
                  {message.action === "resolve-check" ? (
                    <div className="admin-chat__inline-actions">
                      <button type="button" onClick={() => appendMessages(buildMessage("user", "Đã giải quyết"), buildMessage("bot", "Tuyệt, cảm ơn bạn đã nhắn CineSky."))}>
                        Đã giải quyết
                      </button>
                      <button type="button" onClick={() => requestAdmin(message.category)}>
                        Chuyển admin
                      </button>
                    </div>
                  ) : null}
                </div>
                {message.sender === "user" && (
                  <img 
                    src={user?.avatar || (user?.id ? `${API_BASE_URL}/api/v1/auth/users/${user.id}/avatar?v=${avatarCacheBuster}` : `https://api.dicebear.com/7.x/notionists/svg?seed=${contact.fullName || contact.email || "Guest"}&backgroundColor=f2c14e`)} 
                    alt="User" 
                    className="admin-chat__avatar admin-chat__avatar--user" 
                  />
                )}
              </div>
            ))}
          </div>

          {handoff.requested ? (
            <form className="admin-chat__handoff" onSubmit={submitHandoff}>
              <input
                value={contact.fullName}
                onChange={(event) => setContact((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Tên của bạn"
                aria-label="Tên của bạn"
              />
              <input
                value={contact.email}
                onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email liên hệ"
                aria-label="Email liên hệ"
                type="email"
              />
              <div className="admin-chat__handoff-actions" style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setHandoff({ requested: false, category: "other", pendingText: "" })} disabled={isSubmitting} style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? "Đang chuyển..." : "Gửi tới admin"}
                </button>
              </div>
            </form>
          ) : (
            <form className="admin-chat__composer" onSubmit={handleSubmitMessage}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={composerMode === "ai" ? "Hỏi AI CineSky..." : "Nhắn admin..."}
                aria-label="Nhập câu hỏi của bạn"
              />
              <button type="submit">Gửi</button>
            </form>
          )}
        </section>
      ) : null}

      <button 
        className={`admin-chat__launcher ${isOpen ? 'admin-chat__launcher--hidden' : ''}`} 
        type="button" 
        onPointerDown={handlePointerDown}
        onClick={handleLauncherClick}
        aria-label="Mở chat với admin"
      >
        {!isOpen && !isTooltipHidden && (
          <span className="admin-chat__tooltip">
            Cần hỗ trợ? Chat ngay!
            <div 
              className="admin-chat__tooltip-close" 
              onClick={(e) => { e.stopPropagation(); setIsTooltipHidden(true); }}
              aria-label="Ẩn"
            >×</div>
          </span>
        )}
        <span className="admin-chat__launcher-icon" ref={lottieContainerRef} style={{ width: 138, height: 138, display: 'block' }}>
        </span>
        {unreadCount > 0 ? <span className="admin-chat__launcher-badge">{unreadCount}</span> : null}
      </button>
    </aside>
  );
}






