// frontend/src/components/feedback/FeedbackPopup.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Form } from "react-bootstrap";
import { FaStar, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import * as feedbackService from "../../services/feedbackService";
import "../../styles/Feedback.css";

const FeedbackPopup = () => {
    const [show, setShow] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Kiểm tra xem có nên hiển thị popup dựa trên số lượng chat
        const checkShowPopup = () => {
            const totalChats = user?.totalChats || 0;
            const lastPopupChat = parseInt(localStorage.getItem("lastFeedbackPopupChat") || "0");
            const dismissed = localStorage.getItem("feedbackPopupDismissed");

            // Hiển thị popup mỗi 5-10 đoạn chat, và không hiển thị nếu vừa hủy
            if (totalChats >= 5 && totalChats - lastPopupChat >= 5 && !dismissed) {
                // Trì hoãn popup 2 giây
                const timer = setTimeout(() => {
                    setShow(true);
                }, 2000);
                return () => clearTimeout(timer);
            }
        };

        if (user) {
            checkShowPopup();
        }
    }, [user]);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning("Vui lòng chọn số sao");
            return;
        }

        setSubmitting(true);
        try {
            await feedbackService.submitFeedback({
                type: "improvement",
                overallRating: rating,
                message,
            });

            toast.success("Cảm ơn bạn đã đánh giá!");
            localStorage.setItem("lastFeedbackPopupChat", String(user?.totalChats || 0));
            setShow(false);
        } catch (error) {
            toast.error("Không thể gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDismiss = () => {
        setShow(false);
        // Không hiển thị lại trong session này
        localStorage.setItem("feedbackPopupDismissed", "true");
    };

    const handleRemindLater = () => {
        setShow(false);
        // Sẽ hiển thị lại sau
        localStorage.setItem("lastFeedbackPopupChat", String(user?.totalChats || 0));
    };

    if (!show) return null;

    return (
        <div className="feedback-popup-overlay" onClick={handleDismiss}>
            <div className="feedback-popup" onClick={(e) => e.stopPropagation()}>
                <button
                    className="btn-close position-absolute"
                    style={{ top: 12, right: 12 }}
                    onClick={handleDismiss}
                />

                <h4>🌟 Đánh giá trải nghiệm</h4>
                <p className="text-center text-muted mb-3">
                    Bạn thấy website học tiếng Anh này như thế nào?
                </p>

                <div className="popup-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className={`star ${star <= (hoverRating || rating) ? "active" : ""}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                </div>

                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Bạn có góp ý gì không? (tùy chọn)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-3"
                />

                <div className="d-grid gap-2">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                    >
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                    <Button variant="outline-secondary" onClick={handleRemindLater}>
                        Nhắc tôi sau
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
