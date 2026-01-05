// frontend/src/pages/HomePage.jsx
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaComments, FaMicrophone, FaBook, FaChartLine } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaComments size={50} />,
      title: "AI Chat Practice",
      description: "Practice conversation with AI tutor in real-time",
      color: "primary",
    },
    {
      icon: <FaMicrophone size={50} />,
      title: "Voice Recognition",
      description: "Improve pronunciation with instant feedback",
      color: "success",
    },
    {
      icon: <FaBook size={50} />,
      title: "Vocabulary Building",
      description: "Learn new words with examples and pronunciation",
      color: "warning",
    },
    {
      icon: <FaChartLine size={50} />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed stats",
      color: "info",
    },
  ];

  return (
    <div className="home-page">
      {/* Phần Hero */}
      <section
        className="hero-section text-white text-center py-5"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="display-3 fw-bold mb-4">
                Learn English with AI 🎓
              </h1>
              <p className="lead mb-5">
                Master English through interactive conversations, voice practice,
                and personalized learning powered by artificial intelligence.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button
                  variant="light"
                  size="lg"
                  onClick={() => {
                    console.log('Get Started Free button clicked!');
                    navigate("/register");
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline-light"
                  size="lg"
                  onClick={() => {
                    console.log('Login button clicked!');
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Phần tính năng */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose Our Platform?</h2>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="h-100 text-center hover-card border-0 shadow">
                  <Card.Body className="p-4">
                    <div className={`text-${feature.color} mb-3`}>
                      {feature.icon}
                    </div>
                    <h5 className="mb-3">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Phần kêu gọi hành động */}
      <section
        className="py-5 text-white text-center"
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        }}
      >
        <Container>
          <h2 className="mb-4">Ready to Start Learning?</h2>
          <p className="lead mb-4">
            Join thousands of learners improving their English every day
          </p>
          <Button
            variant="light"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Sign Up Now - It's Free!
          </Button>
        </Container>
      </section>

      {/* Chân trang */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">
                © 2024 English Learning AI. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
