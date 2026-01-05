// frontend/src/pages/ChatPage.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Container, Row, Col } from "react-bootstrap";
import ChatBox from "../components/chat/ChatBox";
import { getSession } from "../redux/slices/chatSlice";

const ChatPage = () => {
  const { sessionId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (sessionId) {
      dispatch(getSession(sessionId));
    }
  }, [sessionId, dispatch]);

  return (
    <Container fluid className="chat-page py-4">
      <Row className="justify-content-center">
        <Col lg={10} xl={12}>
          <ChatBox />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;
