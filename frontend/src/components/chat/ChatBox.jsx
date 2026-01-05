// frontend/src/components/chat/ChatBox.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { clearMessages } from "../../redux/slices/chatSlice";
import "../../styles/Chat.css";

const ChatBox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { sending } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);

  // Hàm cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Tự động cuộn xuống cuối khi component được mount
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Xử lý khi người dùng nhấn nút "Đoạn chat mới"
  const handleNewChat = () => {
    if (sending) return; // Không cho phép tạo mới nếu đang gửi tin nhắn
    dispatch(clearMessages()); // Xóa tin nhắn hiện tại trong Redux
    if (sessionId) {
      navigate("/chat"); // Điều hướng về trang chat chính nếu đang ở session cụ thể
    }
  };

  return (
    <Card className="chat-box h-100">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">💬 English Chat Practice</h5>
      </Card.Header>

      <Card.Body className="chat-messages p-0">
        <MessageList />
        {/* Element dùng để cuộn xuống cuối */}
        <div ref={messagesEndRef} />
      </Card.Body>

      <Card.Footer className="bg-light">
        <div className="d-flex flex-column flex-md-row gap-2 align-items-md-end">
          <div className="flex-grow-1">
            <MessageInput />
          </div>
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={handleNewChat}
              disabled={sending}
            >
              Đoạn chat mới
            </Button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ChatBox;
