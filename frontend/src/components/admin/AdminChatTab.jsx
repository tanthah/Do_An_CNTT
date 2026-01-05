// frontend/src/components/admin/AdminChatTab.jsx
import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Table, Button, Badge, Modal } from "react-bootstrap";
import { FaComments, FaUsers, FaCalendarDay, FaChartLine, FaEye, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import * as chatService from "../../services/chatService";
import moment from "moment";

const AdminChatTab = () => {
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });

    const [showDetail, setShowDetail] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            const response = await chatService.getAdminChatStats();
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await chatService.getAllChatSessions(
                pagination.page,
                pagination.limit
            );
            if (response.data.success) {
                setSessions(response.data.sessions);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            }
        } catch (error) {
            toast.error("Không thể tải danh sách sessions");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    useEffect(() => {
        fetchStats();
        fetchSessions();
    }, [fetchStats, fetchSessions]);

    const handleViewDetail = (session) => {
        setSelectedSession(session);
        setShowDetail(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xoá session này?")) return;

        try {
            await chatService.deleteChatSession(id);
            toast.success("Đã xoá session");
            fetchSessions();
            fetchStats();
        } catch (error) {
            toast.error("Không thể xoá session");
        }
    };

    return (
        <>
            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <FaComments size={35} className="text-primary mb-2" />
                            <h3>{stats?.totalSessions || 0}</h3>
                            <p className="text-muted mb-0">Tổng sessions</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <FaUsers size={35} className="text-success mb-2" />
                            <h3>{stats?.uniqueUsersCount || 0}</h3>
                            <p className="text-muted mb-0">Người dùng</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <FaCalendarDay size={35} className="text-info mb-2" />
                            <h3>{stats?.sessionsToday || 0}</h3>
                            <p className="text-muted mb-0">Hôm nay</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <FaChartLine size={35} className="text-warning mb-2" />
                            <h3>{stats?.sessionsThisWeek || 0}</h3>
                            <p className="text-muted mb-0">Tuần này</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Daily Trend */}
            {stats?.dailyTrend && stats.dailyTrend.length > 0 && (
                <Card className="mb-4">
                    <Card.Header><h6 className="mb-0">📈 Xu hướng 7 ngày qua</h6></Card.Header>
                    <Card.Body>
                        <Row>
                            {stats.dailyTrend.map((item) => (
                                <Col key={item._id} className="text-center">
                                    <div className="fw-bold">{item.count}</div>
                                    <small className="text-muted">{moment(item._id).format("DD/MM")}</small>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Top Users */}
            {stats?.topUsers && stats.topUsers.length > 0 && (
                <Card className="mb-4">
                    <Card.Header><h6 className="mb-0">🏆 Top người dùng</h6></Card.Header>
                    <Card.Body>
                        <Table responsive hover size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Người dùng</th>
                                    <th>Sessions</th>
                                    <th>Messages</th>
                                    <th>Lần cuối</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topUsers.map((item, idx) => (
                                    <tr key={item._id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <strong>{item.user.name}</strong>
                                            <br />
                                            <small className="text-muted">{item.user.email}</small>
                                        </td>
                                        <td><Badge bg="primary">{item.sessionCount}</Badge></td>
                                        <td><Badge bg="info">{item.totalMessages}</Badge></td>
                                        <td>{moment(item.lastUsed).format("DD/MM/YYYY HH:mm")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Sessions Table */}
            <Card>
                <Card.Header>
                    <h6 className="mb-0">📜 Lịch sử Chat</h6>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center p-5">Loading...</div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Người dùng</th>
                                    <th>Tên Session</th>
                                    <th>Chủ đề / Role</th>
                                    <th>Messages</th>
                                    <th>Cập nhật</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session, idx) => (
                                        <tr key={session._id}>
                                            <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                            <td>
                                                <strong>{session.userId?.name || "N/A"}</strong>
                                                <br />
                                                <small className="text-muted">{session.userId?.email}</small>
                                            </td>
                                            <td>{session.sessionName}</td>
                                            <td>
                                                {session.rolePlay ? (
                                                    <Badge bg="success">{session.rolePlay}</Badge>
                                                ) : (
                                                    <Badge bg="secondary">General</Badge>
                                                )}
                                            </td>
                                            <td>{session.messages?.length || 0}</td>
                                            <td>{moment(session.updatedAt).format("DD/MM/YYYY HH:mm")}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewDetail(session)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(session._id)}
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
                    <Modal.Title>Chi tiết Session Chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSession && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Người dùng:</strong> {selectedSession.userId?.name}
                                    <br />
                                    <small className="text-muted">{selectedSession.userId?.email}</small>
                                </Col>
                                <Col md={6}>
                                    <strong>Ngày tạo:</strong> {moment(selectedSession.createdAt).format("DD/MM/YYYY HH:mm")}
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <strong>Messages Preview (Last 10):</strong>
                                <div className="border p-3 rounded bg-light" style={{ maxHeight: "400px", overflow: "auto" }}>
                                    {selectedSession.messages?.slice(-10).map((msg, idx) => (
                                        <div key={idx} className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-primary text-white ms-auto' : 'bg-white border'}`} style={{ maxWidth: "80%", width: "fit-content" }}>
                                            <small className={`fw-bold d-block ${msg.role === 'user' ? 'text-white-50' : 'text-muted'}`}>
                                                {msg.role === 'user' ? 'You' : 'AI'}
                                            </small>
                                            {msg.content}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminChatTab;
