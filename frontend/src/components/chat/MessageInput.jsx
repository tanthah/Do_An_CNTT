// frontend/src/components/chat/MessageInput.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, InputGroup } from "react-bootstrap";
import { FaPaperPlane, FaMicrophone, FaPaperclip } from "react-icons/fa";
import { sendMessage, addUserMessage, uploadChatFile } from "../../redux/slices/chatSlice";
import { toast } from "react-toastify";

const MessageInput = () => {
  const dispatch = useDispatch();
  const { sending, uploading, currentSessionId } = useSelector((state) => state.chat);
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [task, setTask] = useState("translate");

  // Tự động điều chỉnh độ cao khung nhập liệu (textarea)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Xử lý gửi tin nhắn
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.warning("Please type a message");
      return;
    }

    // Thêm tin nhắn của người dùng vào giao diện ngay lập tức
    dispatch(addUserMessage(message));

    setMessage("");

    // Đặt lại độ cao khung nhập sau khi gửi
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Gửi tin nhắn đến API
    const result = await dispatch(
      sendMessage({
        message,
        sessionId: currentSessionId,
      })
    );

    if (result.type === "chat/sendMessage/rejected") {
      toast.error("Failed to send message");
    }
  };

  // Khởi tạo tính năng nhận dạng giọng nói
  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Trình duyệt không hỗ trợ nhận dạng giọng nói");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      toast.error("Không thể nhận dạng giọng nói");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    return recognition;
  };

  // Xử lý khi click nút Micro
  const handleMicClick = () => {
    if (sending) return;

    // Nếu đang nghe thì dừng lại
    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      return;
    }

    // Bắt đầu nghe
    try {
      const recognition = initRecognition();
      if (!recognition) return;
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      toast.error("Không thể bắt đầu thu âm");
    }
  };

  // Xử lý phím tắt (Enter để gửi, Shift+Enter xuống dòng)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const validTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error("File format not supported");
      return;
    }

    // Kiểm tra kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be < 10MB");
      return;
    }

    setSelectedFile(file);
    setShowTaskModal(true);

    // Đặt lại giá trị input để có thể chọn lại cùng một file nếu cần
    e.target.value = null;
  };

  // Xác nhận upload và xử lý file
  const confirmUpload = async () => {
    if (!selectedFile) return;

    setShowTaskModal(false);

    if (sending || uploading) {
      toast.warning("Processing...");
      return;
    }

    const result = await dispatch(
      uploadChatFile({
        file: selectedFile,
        sessionId: currentSessionId,
        task: task
      })
    );

    if (result.type === "chat/uploadFile/fulfilled") {
      toast.success("Processed successfully");
    } else {
      toast.error(result.payload?.message || "Upload failed");
    }
    setSelectedFile(null);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="align-items-end">
          <Form.Control
            as="textarea"
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message in English... (Shift+Enter for new line)"
            disabled={sending}
            className="message-input"
            style={{
              minHeight: '60px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}
          />

          <Button
            variant="outline-secondary"
            disabled={sending || uploading}
            title="Upload file (Image, PDF, Word)"
            onClick={() => {
              if (fileInputRef.current && !uploading && !sending) {
                fileInputRef.current.click();
              }
            }}
          >
            <FaPaperclip />
          </Button>
          <Form.Control
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            style={{ display: "none" }}
          />

          <Button
            variant={listening ? "outline-danger" : "outline-secondary"}
            disabled={sending}
            title={
              listening
                ? "Stop recording"
                : "Voice input"
            }
            onClick={handleMicClick}
          >
            <FaMicrophone />
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={sending || !message.trim()}
          >
            {sending ? "..." : <FaPaperPlane />}
          </Button>
        </InputGroup>
      </Form>

      {/* Modal xử lý file */}
      {showTaskModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Process File</h5>
                <button type="button" className="btn-close" onClick={() => setShowTaskModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Selected file: <strong>{selectedFile?.name}</strong></p>
                <Form.Group>
                  <Form.Label>Choose action:</Form.Label>
                  <Form.Select value={task} onChange={(e) => setTask(e.target.value)}>
                    <option value="translate">Dịch Anh → Việt</option>
                    <option value="translate_vi_to_en">Dịch Việt → Anh</option>
                    <option value="fix_grammar">Sửa ngữ pháp & Cải thiện</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={confirmUpload} disabled={uploading}>
                  {uploading ? "Processing..." : "Upload & Process"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageInput;
