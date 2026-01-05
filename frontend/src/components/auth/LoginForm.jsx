// frontend/src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { login, clearError } from "../../redux/slices/authSlice";
import { googleLogin } from "../../services/authService";
import "../../styles/Auth.css";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, needsVerification } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    
    if (result.type === "auth/login/fulfilled") {
      navigate("/dashboard");
    } else if (needsVerification) {
      navigate("/verify-otp", { state: { email } });
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Welcome Back! 👋</h2>
        <p>Login to continue learning English</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FaEnvelope />
            </InputGroup.Text>
            <Form.Control
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="your.email@example.com"
              required
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FaLock />
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <div className="mb-3 text-end">
          <Link to="/forgot-password" className="text-decoration-none">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-100 mb-3"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="divider">
          <span>OR</span>
        </div>

        <Button
          variant="outline-dark"
          className="w-100 mb-3"
          onClick={handleGoogleLogin}
        >
          <FcGoogle size={20} className="me-2" />
          Continue with Google
        </Button>

        <div className="text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-decoration-none fw-bold">
            Sign Up
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;