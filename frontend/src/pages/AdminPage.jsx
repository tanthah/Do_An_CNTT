// frontend/src/pages/AdminPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal, Nav, Tab, Dropdown } from "react-bootstrap";
import { FaUsers, FaComments, FaSearch, FaTrash, FaStar, FaBug, FaExclamationTriangle, FaEye, FaLock, FaUnlock, FaRobot, FaHeadphones } from "react-icons/fa";
import { getAllUsers, deleteUser, toggleUserActive, getUserDetail } from "../services/userService";
import { getFeedbackStats } from "../services/feedbackService";
import { toast } from "react-toastify";
import moment from "moment";
import AdminFeedbackTab from "../components/admin/AdminFeedbackTab";
import UserDetailModal from "../components/admin/UserDetailModal";
import AdminAIControlTab from "../components/admin/AdminAIControlTab";
import AdminListeningTab from "../components/admin/AdminListeningTab";
import AdminChatTab from "../components/admin/AdminChatTab";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
  });
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Bộ lọc & Sắp xếp
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterActive, setFilterActive] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(
        pagination.page,
        pagination.limit,
        searchTerm,
        sortBy,
        filterActive
      );
      setUsers(response.data.users);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));

      // Tính toán thống kê (ước tính sơ bộ từ trang hiện tại, backend nên cung cấp thống kê thực nếu cần)
      // Lưu ý: totalChats/totalVoice trong mảng users chỉ phản ánh trang hiện tại.
      // Lý tưởng nhất là backend trả về thống kê toàn cục. Việc triển khai ban đầu đã thực hiện tính tổng thủ công.
      // Chúng ta sẽ giữ tính tổng thủ công hoặc dựa vào API thống kê riêng nếu được triển khai.
      // Vì getAllUsers ở backend kiểm soát thống kê riêng biệt hoặc chúng ta sử dụng getUserStats cho user hiện tại??
      // Phản hồi getAllUsers của backend chỉ đưa ra tổng số lượng users.
      // Chúng ta sẽ tin tưởng số lượng totalUsers. Thống kê hoạt động có thể bị thấp hơn thực tế nếu chỉ tính tổng các users hiển thị.

      setStats((prev) => ({
        ...prev,
        totalUsers: response.data.pagination.total
      }));

    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, sortBy, filterActive]);

  const fetchFeedbackStats = useCallback(async () => {
    try {
      const response = await getFeedbackStats();
      setFeedbackStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch feedback stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchFeedbackStats();
  }, [fetchUsers, fetchFeedbackStats]);

  const handleDeleteUserClick = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) {
      setShowConfirm(false);
      return;
    }

    try {
      await deleteUser(userToDelete._id);
      toast.success("Đã xóa người dùng");
      setShowConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch {
      toast.error("Xóa người dùng thất bại");
      setShowConfirm(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await toggleUserActive(user._id);
      toast.success(`User ${user.isActive ? "locked" : "unlocked"} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleViewDetail = async (userId) => {
    setLoadingDetail(true);
    try {
      const response = await getUserDetail(userId);
      setSelectedUserDetail(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Failed to load user details");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <Container fluid className="admin-page py-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard 👨‍💼</h2>
          <p className="text-muted">Manage users and monitor platform activity</p>
        </Col>
      </Row>

      {/* Dashboard Overview Widgets */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <FaUsers size={35} className="text-primary mb-2" />
              <h3>{stats.totalUsers}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <FaStar size={35} className="text-warning mb-2" />
              <h3>{feedbackStats?.overall?.avgRating?.toFixed(1) || "0.0"}</h3>
              <p className="text-muted mb-0">Avg Rating</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card h-100 border-danger">
            <Card.Body className="text-center">
              <FaExclamationTriangle size={35} className="text-danger mb-2" />
              <h3 className="text-danger">{feedbackStats?.overall?.lowStarCount || 0}</h3>
              <p className="text-muted mb-0">Low Ratings (1-2⭐)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card h-100 border-warning">
            <Card.Body className="text-center">
              <FaBug size={35} className="text-warning mb-2" />
              <h3 className="text-warning">{feedbackStats?.unresolvedBugs || 0}</h3>
              <p className="text-muted mb-0">Unresolved Bugs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="users">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="users">
              <FaUsers className="me-2" /> Quản lý Users
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="feedbacks">
              <FaStar className="me-2" /> Quản lý Feedback
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="ai-control">
              <FaRobot className="me-2" /> AI Control
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="listening">
              <FaHeadphones className="me-2" /> Luyện Nghe
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="chat">
              <FaComments className="me-2" /> Luyện Chat
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="users">
            {/* Bảng Users */}
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <Row className="align-items-center">
                      <Col md={4}>
                        <h5 className="mb-0">Users Management</h5>
                      </Col>
                      <Col md={8}>
                        <div className="d-flex gap-2 justify-content-end">
                          {/* Tìm kiếm */}
                          <InputGroup style={{ maxWidth: "250px" }}>
                            <InputGroup.Text><FaSearch /></InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </InputGroup>

                          {/* Lọc theo trạng thái */}
                          <Form.Select
                            style={{ width: "150px" }}
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value)}
                          >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Locked</option>
                          </Form.Select>

                          {/* Sắp xếp */}
                          <Form.Select
                            style={{ width: "180px" }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                          >
                            <option value="createdAt">Newest Joined</option>
                            <option value="totalChats">Most Chats</option>
                            <option value="vocabLearned">Most Vocab Learned</option>
                          </Form.Select>
                        </div>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    {loading ? (
                      <div className="text-center p-5">Loading...</div>
                    ) : (
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Vocab</th>
                            <th>Activity</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="text-center text-muted">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map((user, index) => (
                              <tr key={user._id}>
                                <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {user.avatar && (
                                      <img src={user.avatar} alt="" className="rounded-circle me-2" width="30" height="30" />
                                    )}
                                    <strong>{user.name}</strong>
                                  </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                  <Badge bg={user.role === "admin" ? "danger" : "primary"}>
                                    {user.role}
                                  </Badge>
                                </td>
                                <td>
                                  {user.isActive ? (
                                    <Badge bg="success">Active</Badge>
                                  ) : (
                                    <Badge bg="secondary">Locked</Badge>
                                  )}
                                </td>
                                <td>{user.vocabLearned}</td>
                                <td>
                                  <small className="d-block">Chats: {user.totalChats}</small>
                                </td>
                                <td>{moment(user.createdAt).format("MMM DD, YYYY")}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      title="View Details"
                                      onClick={() => handleViewDetail(user._id)}
                                    >
                                      <FaEye />
                                    </Button>

                                    {user.role !== "admin" && (
                                      <Button
                                        variant={user.isActive ? "outline-warning" : "outline-success"}
                                        size="sm"
                                        title={user.isActive ? "Lock Account" : "Unlock Account"}
                                        onClick={() => handleToggleActive(user)}
                                      >
                                        {user.isActive ? <FaLock /> : <FaUnlock />}
                                      </Button>
                                    )}

                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      title="Delete"
                                      onClick={() => handleDeleteUserClick(user)}
                                      disabled={user.role === "admin"}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    )}

                    {/* Phân trang */}
                    {pagination.total > pagination.limit && (
                      <div className="d-flex justify-content-center mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={pagination.page === 1}
                          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        >
                          Previous
                        </Button>
                        <span className="mx-3 align-self-center">
                          Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                        </span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Modal
              show={showConfirm}
              onHide={() => setShowConfirm(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Xóa người dùng</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {userToDelete ? (
                  <>
                    Bạn có chắc chắn muốn xóa tài khoản{" "}
                    <strong>{userToDelete.email}</strong>? Hành động này không thể hoàn tác.
                  </>
                ) : null}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                  Hủy
                </Button>
                <Button variant="danger" onClick={handleConfirmDeleteUser}>
                  Xóa
                </Button>
              </Modal.Footer>
            </Modal>

            {/* User Detail Modal */}
            <UserDetailModal
              show={showDetailModal}
              onHide={() => setShowDetailModal(false)}
              user={selectedUserDetail?.user}
              chatHistory={selectedUserDetail?.chatHistory}
              listeningHistory={selectedUserDetail?.listeningHistory}
              vocabStats={selectedUserDetail?.vocabStats}
              files={selectedUserDetail?.files}
            />

          </Tab.Pane>

          <Tab.Pane eventKey="feedbacks">
            <AdminFeedbackTab />
          </Tab.Pane>

          <Tab.Pane eventKey="ai-control">
            <AdminAIControlTab />
          </Tab.Pane>

          <Tab.Pane eventKey="listening">
            <AdminListeningTab />
          </Tab.Pane>

          <Tab.Pane eventKey="chat">
            <AdminChatTab />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default AdminPage;
