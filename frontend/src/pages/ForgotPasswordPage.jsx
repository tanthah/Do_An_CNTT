// frontend/src/pages/ForgotPasswordPage.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { forgotPassword, resetPassword, verifyResetOTP } from "../services/authService";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Mật khẩu mới
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    if (step !== 2) return;
    if (otpCountdown <= 0) return;

    const timer = setTimeout(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpCountdown, step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      toast.success("OTP sent to your email");
      setStep(2);
      setOtp("");
      setOtpCountdown(60);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      await verifyResetOTP({ email, otp });
      toast.success("OTP verified successfully");
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      toast.success("OTP resent to your email");
      setOtp("");
      setOtpCountdown(60);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ email, otp, newPassword });
      toast.success("Password reset successfully!");
      window.location.href = "/login";
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <div className="auth-header">
                  <h2>Reset Password 🔐</h2>
                  <p>
                    {step === 1 && "Enter your email to receive OTP"}
                    {step === 2 && "Enter the OTP sent to your email"}
                    {step === 3 && "Enter your new password"}
                  </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {step === 1 && (
                  <Form onSubmit={handleSendOTP}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope />
                        </span>
                        <Form.Control
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>

                    <div className="text-center">
                      Remember your password?{" "}
                      <Link to="/login" className="text-decoration-none fw-bold">
                        Login
                      </Link>
                    </div>
                  </Form>
                )}

                {step === 2 && (
                  <Form onSubmit={handleVerifyOtp}>
                    <Form.Group className="mb-3">
                      <Form.Label>OTP Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="000000"
                        maxLength="6"
                        required
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      {otpCountdown > 0 ? (
                        <small className="text-muted">
                          You can resend OTP in {otpCountdown}s
                        </small>
                      ) : (
                        <Button
                          variant="link"
                          type="button"
                          onClick={handleResendOTP}
                          disabled={loading}
                        >
                          Resend OTP
                        </Button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        onClick={() => {
                          setStep(1);
                          setOtp("");
                          setError("");
                          setOtpCountdown(0);
                        }}
                        className="text-decoration-none"
                      >
                        Back to Email
                      </Button>
                    </div>
                  </Form>
                )}

                {step === 3 && (
                  <Form onSubmit={handleResetPassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        onClick={() => setStep(1)}
                        className="text-decoration-none"
                      >
                        Back to Email
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;
