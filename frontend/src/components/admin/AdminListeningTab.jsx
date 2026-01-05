// frontend/src/components/admin/AdminListeningTab.jsx
import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Table, Button, Badge, Modal } from "react-bootstrap";
import { FaHeadphones, FaUsers, FaCalendarDay, FaChartLine, FaEye, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import * as listeningService from "../../services/listeningService";
import moment from "moment";

const AdminListeningTab = () => {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });

    const [showDetail, setShowDetail] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            const response = await listeningService.getAdminListeningStats();
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listeningService.getAllListeningHistory(
                pagination.page,
                pagination.limit
            );
            if (response.data.success) {
                setHistory(response.data.history);
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            }
        } catch (error) {
            toast.error("Không thể tải lịch sử");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    useEffect(() => {
        fetchStats();
        fetchHistory();
    }, [fetchStats, fetchHistory]);

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setShowDetail(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xoá record này?")) return;

        try {
            await listeningService.deleteListeningHistory(id);
            toast.success("Đã xoá");
            fetchHistory();
            fetchStats();
        } catch (error) {
            toast.error("Không thể xoá record");
        }
    };

    return (
        <>
            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <FaHeadphones size={35} className="text-primary mb-2" />
                            <h3>{stats?.totalSessions || 0}</h3>
                            <p className="text-muted mb-0">Tổng lượt sử dụng</p>
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
                                    <th>Số lần sử dụng</th>
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
                                        <td>{moment(item.lastUsed).format("DD/MM/YYYY HH:mm")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* History Table */}
            <Card>
                <Card.Header>
                    <h6 className="mb-0">📜 Lịch sử luyện nghe</h6>
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
                                    <th>Nội dung</th>
                                    <th>Yêu cầu</th>
                                    <th>Ngày</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((record, idx) => (
                                        <tr key={record._id}>
                                            <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                            <td>
                                                <strong>{record.userId?.name || "N/A"}</strong>
                                                <br />
                                                <small className="text-muted">{record.userId?.email}</small>
                                            </td>
                                            <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {record.originText?.substring(0, 50)}...
                                            </td>
                                            <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {record.userText || "-"}
                                            </td>
                                            <td>{moment(record.createdAt).format("DD/MM/YYYY HH:mm")}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewDetail(record)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(record._id)}
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
                    <Modal.Title>Chi tiết bài luyện nghe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Người dùng:</strong> {selectedRecord.userId?.name}
                                    <br />
                                    <small className="text-muted">{selectedRecord.userId?.email}</small>
                                </Col>
                                <Col md={6}>
                                    <strong>Ngày:</strong> {moment(selectedRecord.createdAt).format("DD/MM/YYYY HH:mm")}
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <strong>Yêu cầu/Prompt:</strong>
                                <p className="border p-2 rounded bg-light">
                                    {selectedRecord.userText || "Không có"}
                                </p>
                            </div>

                            <div className="mb-3">
                                <strong>Nội dung được tạo:</strong>
                                <div className="border p-3 rounded bg-light" style={{ maxHeight: "300px", overflow: "auto" }}>
                                    {selectedRecord.originText?.split('\n').map((line, idx) => (
                                        <p key={idx} className="mb-1">{line || '\u00A0'}</p>
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

export default AdminListeningTab;
