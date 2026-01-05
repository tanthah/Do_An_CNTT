// frontend/src/pages/FeedbackPage.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaStar, FaBug, FaLightbulb, FaPlus, FaQuestion, FaInfoCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import * as feedbackService from "../services/feedbackService";
import "../styles/Feedback.css";

const FeedbackPage = () => {
    const [overallRating, setOverallRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [featureRatings, setFeatureRatings] = useState({
        chatWriting: 0,
        chatSpeaking: 0,
        textToSpeech: 0,
        fileUpload: 0,
    });

    const [feedbackType, setFeedbackType] = useState("improvement");
    const [message, setMessage] = useState("");

    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

    const [myFeedbacks, setMyFeedbacks] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    // State trạng thái feedback
    const [feedbackStatus, setFeedbackStatus] = useState({
        canSubmitFeedback: true,
        remainingFeedback: 5,
        feedbackCountToday: 0,
        shouldRateAgain: true,
        daysSinceLastRating: null,
        lastRatingDate: null,
    });

    const feedbackTypes = [
        { value: "bug", label: "Báo lỗi", icon: <FaBug /> },
        { value: "improvement", label: "Góp ý cải thiện", icon: <FaLightbulb /> },
        { value: "feature", label: "Đề xuất tính năng", icon: <FaPlus /> },
        { value: "other", label: "Khác", icon: <FaQuestion /> },
    ];

    const features = [
        { key: "chatWriting", label: "Chat luyện viết" },
        { key: "chatSpeaking", label: "Chat luyện nói" },
        { key: "textToSpeech", label: "Đọc văn bản (TTS)" },
        { key: "fileUpload", label: "Upload tài liệu" },
    ];

    useEffect(() => {
        loadMyFeedbacks();
        loadFeedbackStatus();
    }, []);

    const loadFeedbackStatus = async () => {
        try {
            const response = await feedbackService.getFeedbackStatus();
            if (response.data.success) {
                setFeedbackStatus(response.data.status);
            }
        } catch (error) {
            console.error("Load feedback status error:", error);
        }
    };

    const loadMyFeedbacks = async () => {
        try {
            const response = await feedbackService.getMyFeedbacks();
            setMyFeedbacks(response.data.feedbacks || []);
        } catch (error) {
            console.error("Load feedbacks error:", error);
        }
    };

    const handleFeatureRating = (feature, rating) => {
        setFeatureRatings((prev) => ({ ...prev, [feature]: rating }));
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();

        if (!feedbackStatus.canSubmitFeedback) {
            toast.warning("Bạn đã gửi đủ 5 phản hồi trong ngày. Vui lòng quay lại vào ngày mai!");
            return;
        }

        if (overallRating === 0) {
            toast.warning("Vui lòng chọn số sao đánh giá tổng thể");
            return;
        }

        setRatingSubmitting(true);
        try {
            await feedbackService.submitFeedback({
                overallRating,
                featureRatings,
                // No message or type for rating submission
            });

            toast.success("Cảm ơn bạn đã đánh giá!");
            setOverallRating(0);
            setFeatureRatings({
                chatWriting: 0,
                chatSpeaking: 0,
                textToSpeech: 0,
                fileUpload: 0,
            });
            loadMyFeedbacks();
            loadFeedbackStatus();
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error(error.response.data.message || "Bạn đã gửi đủ 5 phản hồi trong ngày.");
                loadFeedbackStatus();
            } else {
                toast.error("Lỗi khi gửi đánh giá. Vui lòng thử lại.");
            }
        } finally {
            setRatingSubmitting(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();

        if (!feedbackStatus.canSubmitFeedback) {
            toast.warning("Bạn đã gửi đủ 5 phản hồi trong ngày. Vui lòng quay lại vào ngày mai!");
            return;
        }

        if (!message.trim()) {
            toast.warning("Vui lòng nhập nội dung góp ý");
            return;
        }

        setFeedbackSubmitting(true);
        try {
            await feedbackService.submitFeedback({
                type: feedbackType,
                message,
                // No ratings for feedback submission
            });

            toast.success("Đã gửi góp ý thành công!");
            setMessage("");
            loadMyFeedbacks();
            loadFeedbackStatus();
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error(error.response.data.message || "Bạn đã gửi đủ 5 phản hồi trong ngày.");
                loadFeedbackStatus();
            } else {
                toast.error("Lỗi khi gửi góp ý. Vui lòng thử lại.");
            }
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    const renderStars = (rating, setRating, hover = null, setHover = null, size = "2rem") => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={`star ${star <= (hover || rating) ? "active" : ""}`}
                        style={{ fontSize: size }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover && setHover(star)}
                        onMouseLeave={() => setHover && setHover(0)}
                    />
                ))}
            </div>
        );
    };

    return (
        <Container className="feedback-page py-4">
            <Row className="mb-4">
                <Col>
                    <h2>📝 Đánh giá & Góp ý</h2>
                    <p className="text-muted">
                        Ý kiến của bạn giúp chúng tôi cải thiện website tốt hơn!
                    </p>
                </Col>
            </Row>

            {/* Alert: Đã đủ 5 feedback trong ngày */}
            {!feedbackStatus.canSubmitFeedback && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="warning" className="d-flex align-items-center gap-2">
                            <FaExclamationTriangle />
                            <div>
                                <strong>Đã đạt giới hạn!</strong> Bạn đã gửi đủ 5 phản hồi trong ngày hôm nay.
                                Vui lòng quay lại vào ngày mai để tiếp tục gửi phản hồi.
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Alert: Nhắc nhở đánh giá lại sau 5 ngày */}
            {feedbackStatus.shouldRateAgain && feedbackStatus.daysSinceLastRating !== null && feedbackStatus.daysSinceLastRating >= 5 && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="info" className="d-flex align-items-center gap-2">
                            <FaClock />
                            <div>
                                <strong>Đã {feedbackStatus.daysSinceLastRating} ngày</strong> kể từ lần đánh giá cuối của bạn!
                                Hãy đánh giá lại để giúp chúng tôi cải thiện dịch vụ nhé! ⭐
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Alert: Số lượt feedback còn lại trong ngày */}
            {feedbackStatus.canSubmitFeedback && feedbackStatus.remainingFeedback < 5 && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="light" className="d-flex align-items-center gap-2 border">
                            <FaInfoCircle className="text-primary" />
                            <div>
                                Bạn còn <strong>{feedbackStatus.remainingFeedback}</strong> lượt gửi phản hồi trong ngày hôm nay.
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                <Col lg={8}>
                    {/* Section 1: Rating */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">⭐ Đánh giá trải nghiệm</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleRatingSubmit}>
                                {/* Overall Rating */}
                                <div className="text-center mb-4">
                                    <p className="mb-2">Bạn hài lòng mức nào với website?</p>
                                    {renderStars(overallRating, setOverallRating, hoverRating, setHoverRating)}
                                    <p className="text-muted mt-2">
                                        {overallRating === 0 && "Chưa đánh giá"}
                                        {overallRating === 1 && "Rất không hài lòng"}
                                        {overallRating === 2 && "Không hài lòng"}
                                        {overallRating === 3 && "Bình thường"}
                                        {overallRating === 4 && "Hài lòng"}
                                        {overallRating === 5 && "Rất hài lòng"}
                                    </p>
                                </div>

                                {/* Feature Ratings */}
                                <Form.Group className="mb-4">
                                    <Form.Label>Đánh giá chi tiết (tùy chọn):</Form.Label>
                                    <div className="feature-ratings">
                                        {features.map((feature) => (
                                            <div key={feature.key} className="feature-rating-item">
                                                <span className="label">{feature.label}</span>
                                                <div className="stars">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={`star ${star <= featureRatings[feature.key] ? "active" : ""}`}
                                                            onClick={() => handleFeatureRating(feature.key, star)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100"
                                    disabled={ratingSubmitting || overallRating === 0}
                                >
                                    {ratingSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Section 2: Feedback/Report */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">💬 Gửi góp ý & Báo lỗi</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleFeedbackSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Loại phản hồi:</Form.Label>
                                    <div className="feedback-type-selector">
                                        {feedbackTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                className={`feedback-type-btn ${feedbackType === type.value ? "active" : ""}`}
                                                onClick={() => setFeedbackType(type.value)}
                                            >
                                                {type.icon} {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Nội dung:</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Mô tả lỗi hoặc ý tưởng của bạn..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={2000}
                                    />
                                    <Form.Text className="text-muted">
                                        {message.length}/2000 ký tự
                                    </Form.Text>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="outline-primary"
                                    className="w-100"
                                    disabled={feedbackSubmitting || !message.trim()}
                                >
                                    {feedbackSubmitting ? "Đang gửi..." : "Gửi góp ý"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* My Feedbacks */}
                <Col lg={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">📋 Lịch sử gửi</h5>
                        </Card.Header>
                        <Card.Body>
                            {myFeedbacks.length === 0 ? (
                                <p className="text-muted text-center">Chưa có dữ liệu</p>
                            ) : (
                                <div className="my-feedbacks-list">
                                    {myFeedbacks.map((fb) => (
                                        <div key={fb._id} className="my-feedback-item">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                {/* Show stars or type icon depending on content */}
                                                {fb.overallRating ? (
                                                    <span className="rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                style={{ color: i < fb.overallRating ? "#ffc107" : "#ddd" }}
                                                            />
                                                        ))}
                                                    </span>
                                                ) : (
                                                    <span className="feedback-type-badge">
                                                        {feedbackTypes.find(t => t.value === fb.type)?.icon} {feedbackTypes.find(t => t.value === fb.type)?.label}
                                                    </span>
                                                )}

                                                <small className="text-muted">
                                                    {new Date(fb.createdAt).toLocaleDateString("vi-VN")}
                                                </small>
                                            </div>
                                            {fb.message && (
                                                <p className="mb-1 small">{fb.message.substring(0, 100)}...</p>
                                            )}
                                            <span className={`badge bg-${fb.status === "resolved" ? "success" : fb.status === "reviewed" ? "info" : "warning"}`}>
                                                {fb.status === "pending" && "Đang chờ"}
                                                {fb.status === "reviewed" && "Đã xem"}
                                                {fb.status === "resolved" && "Đã xử lý"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default FeedbackPage;
