// frontend/src/components/chat/MessageList.jsx
// frontend/src/components/chat/MessageList.jsx
import { useSelector } from "react-redux";
import { Alert, Spinner } from "react-bootstrap";
import { FaRobot, FaUser } from "react-icons/fa";
import { formatDate } from "../../utils/helpers";
import FormattedMessage from "./FormattedMessage";

const MessageList = () => {
  const { messages, loading, sending } = useSelector((state) => state.chat);

  // Hiển thị loading khi đang tải tin nhắn
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading messages...</p>
      </div>
    );
  }

  // Hiển thị màn hình chào mừng nếu chưa có tin nhắn nào
  if (messages.length === 0) {
    return (
      <div className="empty-chat">
        <div className="text-center p-5">
          <FaRobot size={60} className="text-primary mb-3" />
          <h4>Start a conversation!</h4>
          <p className="text-muted">
            Hi! I'm your English tutor. Ask me anything about English grammar,
            vocabulary, or let's practice conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {/* Duyệt qua danh sách tin nhắn để hiển thị */}
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}
        >
          {/* Avatar của người dùng hoặc AI */}
          <div className="message-avatar">
            {msg.role === "user" ? (
              <FaUser className="avatar-icon" />
            ) : (
              <FaRobot className="avatar-icon" />
            )}
          </div>

          <div className="message-content">
            <div className="message-header">
              <span className="message-sender">
                {msg.role === "user" ? "You" : "English Tutor AI"}
              </span>
              <span className="message-time">
                {formatDate(msg.timestamp)}
              </span>
            </div>

            {/* Nội dung tin nhắn */}
            <div className="message-text">
              {msg.role === "assistant" ? (
                <FormattedMessage content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Hiển thị hiệu ứng đang gõ khi AI đang xử lý */}
      {sending && (
        <div className="message ai-message">
          <div className="message-avatar">
            <FaRobot className="avatar-icon" />
          </div>
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
