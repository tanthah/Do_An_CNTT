// frontend/src/components/admin/AdminFeedbackTab.jsx
import { useState, useEffect, useCallback } from "react";
import { Table, Button, Badge, Form, Modal, Card, Row, Col, Nav, Tab, ProgressBar } from "react-bootstrap";
import { FaStar, FaEye, FaTrash, FaCheck, FaBug, FaLightbulb, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import * as feedbackService from "../../services/feedbackService";
import moment from "moment";

const AdminFeedbackTab = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({ type: "", status: "", rating: "", lowStarsOnly: false });

    const [showDetail, setShowDetail] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [newPriority, setNewPriority] = useState("");

    const fetchFeedbacks = useCallback(async () => {
        setLoading(true);
        try {
            const activeFilters = {};
            if (filters.type) activeFilters.type = filters.type;
            if (filters.status) activeFilters.status = filters.status;
            if (filters.rating) activeFilters.rating = filters.rating;

            const response = await feedbackService.getAllFeedbacks(
                pagination.page,
                pagination.limit,
                activeFilters
            );

            setFeedbacks(response.data.feedbacks);
            setPagination((prev) => ({ ...prev, total: response.data.pagination.total }));
        } catch (error) {
            toast.error("Không thể tải danh sách feedback");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await feedbackService.getFeedbackStats();
            setStats(response.data.stats);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
        fetchStats();
    }, [fetchFeedbacks, fetchStats]);

    const handleViewDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setAdminNote(feedback.adminNote || "");
        setNewStatus(feedback.status);
        setNewPriority(feedback.priority || "medium");
        setShowDetail(true);
    };

    const handleUpdateFeedback = async () => {
        try {
            await feedbackService.updateFeedback(selectedFeedback._id, {
                status: newStatus,
                adminNote,
                priority: newPriority,
            });
            toast.success("Đã cập nhật feedback");
            setShowDetail(false);
            fetchFeedbacks();
            fetchStats();
        } catch (error) {
            toast.error("Không thể cập nhật feedback");
        }
    };

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa feedback này?")) return;

        try {
            await feedbackService.deleteFeedback(id);
            toast.success("Đã xóa feedback");
            fetchFeedbacks();
            fetchStats();
        } catch (error) {
            toast.error("Không thể xóa feedback");
        }
    };

    const getTypeBadge = (type) => {
        const types = {
            bug: { bg: "danger", label: "🐞 Báo lỗi" },
            improvement: { bg: "info", label: "💡 Góp ý" },
            feature: { bg: "success", label: "➕ Tính năng" },
            other: { bg: "secondary", label: "❓ Khác" },
        };
        const t = types[type] || types.other;
        return <Badge bg={t.bg}>{t.label}</Badge>;
    };

    const getStatusBadge = (status) => {
        const statuses = {
            pending: { bg: "warning", label: "Đang chờ" },
            "in-progress": { bg: "primary", label: "Đang xử lý" },
            reviewed: { bg: "info", label: "Đã xem" },
            resolved: { bg: "success", label: "Đã xử lý" },
        };
        const s = statuses[status] || statuses.pending;
        return <Badge bg={s.bg}>{s.label}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const priorities = {
            low: { bg: "secondary", label: "Thấp" },
            medium: { bg: "warning", label: "Trung bình" },
            high: { bg: "danger", label: "Cao" },
        };
        const p = priorities[priority] || priorities.medium;
        return <Badge bg={p.bg}>{p.label}</Badge>;
    };

    const featureLabels = {
        chatWriting: "Chat luyện viết",
        chatSpeaking: "Chat luyện nói",
        textToSpeech: "Đọc văn bản (TTS)",
        fileUpload: "Upload tài liệu",
    };

    return (
        <>
            <Tab.Container defaultActiveKey="ratings">
                <Nav variant="pills" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="ratings">
                            <FaStar className="me-2" /> Quản lý Đánh giá
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="feedback">
                            <FaLightbulb className="me-2" /> Quản lý Góp ý
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Tab 1: Ratings */}
                    <Tab.Pane eventKey="ratings">
                        {/* Stats Cards */}
                        <Row className="mb-4">
                            <Col md={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <h3>
                                            <FaStar className="text-warning" /> {stats?.overall?.avgRating?.toFixed(1) || "0.0"}
                                        </h3>
                                        <p className="text-muted mb-0">Đánh giá trung bình</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <h3>{stats?.overall?.totalRatings || 0}</h3>
                                        <p className="text-muted mb-0">Tổng đánh giá</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center h-100 border-danger">
                                    <Card.Body>
                                        <h3 className="text-danger">
                                            <FaExclamationTriangle /> {stats?.overall?.lowStarCount || 0}
                                        </h3>
                                        <p className="text-muted mb-0">Đánh giá 1-2 sao</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <h3 className="text-warning">{stats?.overall?.pendingCount || 0}</h3>
                                        <p className="text-muted mb-0">Chờ xử lý</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Feature Averages */}
                        {stats?.featureAverages && (
                            <Card className="mb-4">
                                <Card.Header><h6 className="mb-0">📊 Đánh giá theo tính năng</h6></Card.Header>
                                <Card.Body>
                                    <Row>
                                        {Object.entries(featureLabels).map(([key, label]) => {
                                            const avg = stats.featureAverages[key] || 0;
                                            const percent = (avg / 5) * 100;
                                            return (
                                                <Col md={6} key={key} className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span>{label}</span>
                                                        <span className={avg < 3 ? "text-danger fw-bold" : ""}>
                                                            {avg > 0 ? avg.toFixed(1) : "N/A"} / 5
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        now={percent}
                                                        variant={avg < 3 ? "danger" : avg < 4 ? "warning" : "success"}
                                                    />
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Rating Trend (simple text-based for now) */}
                        {stats?.ratingTrend && stats.ratingTrend.length > 0 && (
                            <Card className="mb-4">
                                <Card.Header><h6 className="mb-0">📈 Xu hướng đánh giá (7 ngày qua)</h6></Card.Header>
                                <Card.Body>
                                    <Row>
                                        {stats.ratingTrend.map((item) => (
                                            <Col key={item._id} className="text-center">
                                                <div className="fw-bold">{item.avgRating.toFixed(1)}</div>
                                                <small className="text-muted">{moment(item._id).format("DD/MM")}</small>
                                                <div><small>({item.count})</small></div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Filter: Low Stars Only */}
                        <Card className="mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Select
                                            value={filters.rating}
                                            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                        >
                                            <option value="">Tất cả đánh giá</option>
                                            <option value="1">1 sao</option>
                                            <option value="2">2 sao</option>
                                            <option value="3">3 sao</option>
                                            <option value="4">4 sao</option>
                                            <option value="5">5 sao</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        >
                                            <option value="">Tất cả trạng thái</option>
                                            <option value="pending">Đang chờ</option>
                                            <option value="in-progress">Đang xử lý</option>
                                            <option value="reviewed">Đã xem</option>
                                            <option value="resolved">Đã xử lý</option>
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Tab 2: Feedback (Text-based) */}
                    <Tab.Pane eventKey="feedback">
                        {/* Stats Cards */}
                        <Row className="mb-4">
                            <Col md={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <h3>{stats?.overall?.totalFeedbacks || 0}</h3>
                                        <p className="text-muted mb-0">Tổng feedback</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center h-100 border-danger">
                                    <Card.Body>
                                        <h3 className="text-danger">
                                            <FaBug /> {stats?.unresolvedBugs || 0}
                                        </h3>
                                        <p className="text-muted mb-0">Bug chưa xử lý</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <h3 className="text-success">
                                            <FaLightbulb /> {stats?.featureRequests || 0}
                                        </h3>
                                        <p className="text-muted mb-0">Đề xuất tính năng</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <h3 className="text-primary">{stats?.overall?.inProgressCount || 0}</h3>
                                        <p className="text-muted mb-0">Đang xử lý</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Type Distribution */}
                        {stats?.typeDistribution && (
                            <Card className="mb-4">
                                <Card.Header><h6 className="mb-0">📊 Phân loại Feedback</h6></Card.Header>
                                <Card.Body>
                                    <Row>
                                        {stats.typeDistribution.map((item) => (
                                            <Col key={item._id} className="text-center">
                                                {getTypeBadge(item._id)}
                                                <div className="fw-bold mt-2">{item.count}</div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Filters */}
                        <Card className="mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Select
                                            value={filters.type}
                                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        >
                                            <option value="">Tất cả loại</option>
                                            <option value="bug">Báo lỗi</option>
                                            <option value="improvement">Góp ý</option>
                                            <option value="feature">Tính năng</option>
                                            <option value="other">Khác</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        >
                                            <option value="">Tất cả trạng thái</option>
                                            <option value="pending">Đang chờ</option>
                                            <option value="in-progress">Đang xử lý</option>
                                            <option value="reviewed">Đã xem</option>
                                            <option value="resolved">Đã xử lý</option>
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Feedback Table (Shared) */}
            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center p-5">Loading...</div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Người dùng</th>
                                    <th>Loại</th>
                                    <th>Đánh giá</th>
                                    <th>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>Ưu tiên</th>
                                    <th>Ngày</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted">
                                            Không có feedback nào
                                        </td>
                                    </tr>
                                ) : (
                                    feedbacks.map((fb, index) => (
                                        <tr key={fb._id}>
                                            <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                            <td>
                                                <strong>{fb.userId?.name || "N/A"}</strong>
                                                <br />
                                                <small className="text-muted">{fb.userId?.email}</small>
                                            </td>
                                            <td>{getTypeBadge(fb.type)}</td>
                                            <td className="rating-stars">
                                                {fb.overallRating ? (
                                                    [...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            style={{ color: i < fb.overallRating ? "#ffc107" : "#ddd", fontSize: "0.9rem" }}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="feedback-message-preview" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {fb.message || <span className="text-muted">Không có nội dung</span>}
                                            </td>
                                            <td>{getStatusBadge(fb.status)}</td>
                                            <td>{getPriorityBadge(fb.priority)}</td>
                                            <td>{moment(fb.createdAt).format("DD/MM/YYYY")}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewDetail(fb)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteFeedback(fb._id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {pagination.total > pagination.limit && (
                        <div className="d-flex justify-content-center mt-3">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            >
                                Trước
                            </Button>
                            <span className="mx-3 align-self-center">
                                Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
                            </span>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Detail Modal */}
            <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết Feedback</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFeedback && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Người dùng:</strong> {selectedFeedback.userId?.name}
                                    <br />
                                    <small className="text-muted">{selectedFeedback.userId?.email}</small>
                                </Col>
                                <Col md={6}>
                                    <strong>Ngày gửi:</strong>{" "}
                                    {moment(selectedFeedback.createdAt).format("DD/MM/YYYY HH:mm")}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Loại:</strong> {getTypeBadge(selectedFeedback.type)}
                                </Col>
                                <Col md={6}>
                                    <strong>Đánh giá:</strong>{" "}
                                    {selectedFeedback.overallRating ? (
                                        [...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                style={{ color: i < selectedFeedback.overallRating ? "#ffc107" : "#ddd" }}
                                            />
                                        ))
                                    ) : (
                                        <span className="text-muted">Không có</span>
                                    )}
                                </Col>
                            </Row>

                            {selectedFeedback.featureRatings && Object.keys(selectedFeedback.featureRatings).length > 0 && (
                                <div className="mb-3">
                                    <strong>Đánh giá tính năng:</strong>
                                    <ul className="list-unstyled mt-2">
                                        {Object.entries(selectedFeedback.featureRatings).map(([key, value]) => (
                                            value > 0 && (
                                                <li key={key}>
                                                    {featureLabels[key] || key}: {[...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            style={{ color: i < value ? "#ffc107" : "#ddd", fontSize: "0.8rem" }}
                                                        />
                                                    ))}
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mb-3">
                                <strong>Nội dung:</strong>
                                <p className="border p-2 rounded bg-light">
                                    {selectedFeedback.message || "Không có nội dung"}
                                </p>
                            </div>

                            <hr />

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Trạng thái:</Form.Label>
                                        <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                            <option value="pending">Đang chờ</option>
                                            <option value="in-progress">Đang xử lý</option>
                                            <option value="reviewed">Đã xem</option>
                                            <option value="resolved">Đã xử lý</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Độ ưu tiên:</Form.Label>
                                        <Form.Select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                                            <option value="low">Thấp</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="high">Cao</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Ghi chú Admin:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Ghi chú nội bộ..."
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleUpdateFeedback}>
                        <FaCheck /> Cập nhật
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminFeedbackTab;
