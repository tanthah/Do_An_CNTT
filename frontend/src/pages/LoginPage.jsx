// frontend/src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import LoginForm from "../components/auth/LoginForm";
import { getMe } from "../redux/slices/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) return;

    localStorage.setItem("token", token);

    dispatch(getMe()).then((result) => {
      if (result.type === "auth/getMe/fulfilled") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [location.search, dispatch, navigate]);

  const hasToken = new URLSearchParams(location.search).has("token");

  if (hasToken || loading || isAuthenticated) {
    return (
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col md={6} lg={5} className="text-center">
              <Spinner animation="border" role="status" className="mb-3" />
              <div>Đang đăng nhập, vui lòng đợi...</div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <LoginForm />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
