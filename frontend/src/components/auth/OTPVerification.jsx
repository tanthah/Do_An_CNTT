// frontend/src/components/auth/OTPVerification.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Container, Row, Col, Card } from "react-bootstrap";
import { verifyOTP, clearError } from "../../redux/slices/authSlice";
import { resendOTP } from "../../services/authService";
import { toast } from "react-toastify";
import "../../styles/Auth.css";

const OTPVerification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, registrationEmail } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  const email = location.state?.email || registrationEmail;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (!email) return;
    setOtpCountdown(60);
  }, [email]);

  useEffect(() => {
    if (otpCountdown <= 0) return;

    const timer = setTimeout(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setFormErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setFormErrors({ otp: "Mã OTP phải gồm 6 chữ số" });
      return;
    }

    setFormErrors({});
    const result = await dispatch(verifyOTP({ email, otp }));

    if (result.type === "auth/verifyOTP/fulfilled") {
      toast.success("Xác thực email thành công!");
      navigate("/dashboard");
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResending(true);
    try {
      await resendOTP(email);
      toast.success("OTP đã được gửi lại vào email của bạn");
      setOtp("");
      setOtpCountdown(60);
      if (error) {
        dispatch(clearError());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi lại OTP thất bại");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="mb-3">Xác thực OTP 📧</h2>
                  <p className="text-muted mb-2">{email}</p>
                  <small className="text-muted">
                    OTP đã được gửi đến email của bạn.
                    <br />
                    Vui lòng kiểm tra email và nhập mã OTP (6 chữ số).
                  </small>
                </div>

                <Form onSubmit={handleVerifyOtp}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mã OTP</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(value);
                        if (formErrors.otp) {
                          setFormErrors((prev) => ({ ...prev, otp: "" }));
                        }
                        if (error) {
                          dispatch(clearError());
                        }
                      }}
                      maxLength="6"
                      isInvalid={!!formErrors.otp}
                      disabled={loading}
                      placeholder="000000"
                      className="text-center fs-4 letter-spacing-wide"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.otp}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="text-center mb-3">
                    {otpCountdown > 0 ? (
                      <small className="text-muted">
                        Bạn có thể gửi lại OTP sau {otpCountdown}s
                      </small>
                    ) : (
                      <Button
                        variant="link"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="p-0"
                      >
                        {resending ? "Đang gửi..." : "Gửi lại OTP"}
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Đang xác thực...
                      </>
                    ) : (
                      <>Xác thực OTP</>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="danger" className="mt-3 mb-0">
                      {error}
                    </Alert>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OTPVerification;
