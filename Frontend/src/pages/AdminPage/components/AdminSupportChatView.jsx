import React, { useState } from "react";
import { API_BASE_URL } from "../../../config/api";

const getAdminMessageStatus = (message) => {
  if (message.status === "sending") {
    return "Đang gửi";
  }
  if (message.status === "failed") {
    return "Gửi thất bại";
  }
  return message.readAt || message.status === "read" ? "Đã xem" : "Đã gửi";
};

export default function AdminSupportChatView({
  activeChat,
  chatDraft,
  chats,
  isLoading,
  onSelectChat,
  onSendMessage,
  setChatDraft,
}) {
  const [adminAvatarCacheBuster] = useState(() => Date.now());

  return (
    <section className="admin-chatdesk">
      <aside className="admin-chatdesk__list">
        <header>
          <span>Hỗ trợ trực tuyến</span>
          <h2>Đoạn chat</h2>
        </header>
        <div className="admin-chatdesk__threads">
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={"admin-chatdesk__thread" + (activeChat?.id === chat.id ? " is-active" : "")}
              onClick={() => onSelectChat(chat)}
            >
              <img 
                src={chat.userId ? `${API_BASE_URL}/api/v1/auth/users/${chat.userId}/avatar?v=${new Date(chat.updatedAt).getTime()}` : `https://api.dicebear.com/7.x/notionists/svg?seed=${chat.fullName || chat.email || "Guest"}&backgroundColor=f2c14e`} 
                alt="User" 
                className="admin-chatdesk__avatar" 
              />
              <span>
                <strong>{chat.fullName || "Khách hàng"}</strong>
                <em>{chat.lastMessage || "Chưa có tin nhắn"}</em>
              </span>
              {chat.unreadByAdmin > 0 ? <b>{chat.unreadByAdmin}</b> : null}
            </button>
          ))}
          {!isLoading && chats.length === 0 ? <p>Chưa có cuộc chat nào.</p> : null}
        </div>
      </aside>

      <main className="admin-chatdesk__room">
        {activeChat ? (
          <>
            <header className="admin-chatdesk__room-head">
              <img 
                src={activeChat.userId ? `${API_BASE_URL}/api/v1/auth/users/${activeChat.userId}/avatar?v=${new Date(activeChat.updatedAt).getTime()}` : `https://api.dicebear.com/7.x/notionists/svg?seed=${activeChat.fullName || activeChat.email || "Guest"}&backgroundColor=f2c14e`} 
                alt="User" 
                className="admin-chatdesk__avatar" 
              />
              <div>
                <h2>{activeChat.fullName || "Khách hàng"}</h2>
                <p>{activeChat.email || "Chưa có email"}</p>
              </div>
            </header>
            <div className="admin-chatdesk__messages">
              {(activeChat.messages || []).map((message) => {
                const isAdmin = message.sender === "admin";
                return (
                  <div key={message.id} className={`admin-chatdesk__message-row admin-chatdesk__message-row--${isAdmin ? "admin" : "user"}`}>
                    {!isAdmin && (
                      <img 
                        src={activeChat.userId ? `${API_BASE_URL}/api/v1/auth/users/${activeChat.userId}/avatar?v=${new Date(activeChat.updatedAt).getTime()}` : `https://api.dicebear.com/7.x/notionists/svg?seed=${message.authorName || activeChat.fullName || activeChat.email || "Guest"}&backgroundColor=f2c14e`} 
                        alt="User" 
                        className="admin-chatdesk__avatar admin-chatdesk__avatar--small" 
                      />
                    )}
                    <div className={`admin-chatdesk__bubble admin-chatdesk__bubble--${isAdmin ? "admin" : "user"}`}>
                      <p style={{ margin: 0 }}>{message.text}</p>
                      {isAdmin ? (
                        <small className={message.status === "failed" ? "is-failed" : ""}>{getAdminMessageStatus(message)}</small>
                      ) : null}
                    </div>
                    {isAdmin && (
                      <img 
                        src={`${API_BASE_URL}/api/v1/auth/users/admin/avatar?v=${adminAvatarCacheBuster}`} 
                        alt="Admin" 
                        className="admin-chatdesk__avatar admin-chatdesk__avatar--small" 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <form className="admin-chatdesk__composer" onSubmit={onSendMessage}>
              <input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="Nhắn tin cho khách..."
              />
              <button type="submit">Gửi</button>
            </form>
          </>
        ) : (
          <div className="admin-chatdesk__empty">
            <h2>Chọn một đoạn chat</h2>
            <p>Admin có thể trả lời trực tiếp tại đây, không qua feedback.</p>
          </div>
        )}
      </main>

      <aside className="admin-chatdesk__info">
        <h2>Thông tin</h2>
        <dl>
          <div><dt>Tên</dt><dd>{activeChat?.fullName || "Chưa có"}</dd></div>
          <div><dt>Email</dt><dd>{activeChat?.email || "Chưa có"}</dd></div>
          <div><dt>Trạng thái</dt><dd>{activeChat?.status || "Chưa chọn"}</dd></div>
        </dl>
      </aside>
    </section>
  );
}



