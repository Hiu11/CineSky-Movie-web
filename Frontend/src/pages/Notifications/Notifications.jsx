import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";
import CinematicBackdrop from "../../components/CinematicBackdrop/CinematicBackdrop";
import "./Notifications.css";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState({ type: "loading", message: "Đang tải thông báo..." });

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const payload = await getMyNotifications({ limit: 80 });

        if (!isMounted) {
          return;
        }

        setNotifications(payload.notifications || []);
        setUnreadCount(payload.unreadCount || 0);
        setStatus({ type: "success", message: "" });
      } catch (error) {
        if (isMounted) {
          setStatus({ type: "error", message: error.message || "Không thể tải thông báo." });
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReadOne = async (notification) => {
    if (notification.readAt) {
      return;
    }

    try {
      const updatedNotification = await markNotificationAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? updatedNotification : item))
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch {}
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Không thể đánh dấu đã đọc." });
    }
  };

  return (
    <>
    <CinematicBackdrop />
    <main className="notifications-page">
      <section className="notifications-shell">
        <div className="notifications-head">
          <div>
            <span>Trung tâm thông báo</span>
            <h1>Thông báo của bạn</h1>
          </div>
          <button type="button" onClick={handleReadAll} disabled={!unreadCount}>
            Đánh dấu đã đọc
          </button>
        </div>

        {status.message ? <p className={`notifications-status notifications-status--${status.type}`}>{status.message}</p> : null}

        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <article
                key={notification.id}
                className={"notification-card" + (!notification.readAt ? " is-unread" : "")}
                onClick={() => handleReadOne(notification)}
              >
                <div>
                  <strong>{notification.title}</strong>
                  <time>{formatDateTime(notification.createdAt)}</time>
                </div>
                <p>{notification.message}</p>
                {notification.sourceType === "feedback" ? (
                  <Link to="/feedback" onClick={(event) => event.stopPropagation()}>
                    Xem góp ý
                  </Link>
                ) : null}
              </article>
            ))
          ) : status.type !== "loading" ? (
            <p className="notifications-empty">Bạn chưa có thông báo nào.</p>
          ) : null}
        </div>
      </section>
    </main>
    </>
  );
}
