// frontend/src/components/history/ChatHistoryList.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, ListGroup, Badge, Button, Spinner, Modal } from "react-bootstrap";
import { FaComments, FaTrash, FaClock } from "react-icons/fa";
import { getChatHistory, deleteSession } from "../../redux/slices/chatSlice";
import { formatDate, truncateText } from "../../utils/helpers";
import { toast } from "react-toastify";

const ChatHistoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, loading } = useSelector((state) => state.chat);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    dispatch(getChatHistory({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleOpenSession = (sessionId) => {
    navigate(`/chat/${sessionId}`);
  };

  const openConfirm = (e, sessionId) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) {
      setShowConfirm(false);
      return;
    }

    const result = await dispatch(deleteSession(sessionToDelete));
    setShowConfirm(false);
    setSessionToDelete(null);

    if (result.type === "chat/deleteSession/fulfilled") {
      toast.success("Đã xóa đoạn chat");
    } else {
      toast.error("Xóa đoạn chat thất bại");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center p-5">
          <FaComments size={50} className="text-muted mb-3" />
          <h5>No chat history yet</h5>
          <p className="text-muted">Start a conversation to see it here</p>
          <Button variant="primary" onClick={() => navigate("/chat")}>
            Start Chatting
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <FaComments className="me-2" />
          Chat History
        </h5>
      </Card.Header>
      <ListGroup variant="flush">
        {sessions.map((session) => (
          <ListGroup.Item
            key={session._id}
            as="div"
            action
            role="button"
            tabIndex={0}
            onClick={() => handleOpenSession(session._id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenSession(session._id);
              }
            }}
            className="history-item"
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <h6 className="mb-1">{session.sessionName}</h6>
                <p className="mb-1 text-muted">
                  {session.messages.length > 0
                    ? truncateText(
                        session.messages[session.messages.length - 1].content,
                        80
                      )
                    : "No messages"}
                </p>
                <div>
                  <Badge bg="secondary">
                    {session.messages.length} messages
                  </Badge>
                </div>
              </div>
              
              <div className="d-flex flex-column align-items-end ms-3">
                <small className="text-muted mb-2">
                  <FaClock className="me-1" />
                  {formatDate(session.updatedAt)}
                </small>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => openConfirm(e, session._id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xóa đoạn chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa đoạn chat này? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ChatHistoryList;
