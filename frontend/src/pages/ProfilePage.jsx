// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, Form, Button, Tab, Tabs } from "react-bootstrap";
import { FaUser, FaLock, FaSave } from "react-icons/fa";
import { updateProfile } from "../redux/slices/userSlice";
import { changePassword } from "../services/authService";
import { toast } from "react-toastify";
import { getInitials } from "../utils/helpers";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
      });
    }
  }, [user]);



  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(profileData));
    if (result.type === "user/updateProfile/fulfilled") {
      toast.success("Profile updated successfully");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <Container fluid className="profile-page py-4">
      <Row className="mb-4">
        <Col>
          <h2>Profile Settings ⚙️</h2>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body className="p-4">
              <div
                className="avatar-large mx-auto mb-3"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {getInitials(profileData.name || "User")}
              </div>
              <h4>{profileData.name}</h4>
              <p className="text-muted">{user?.email}</p>
              <div className="mt-3">
                <span className="badge bg-primary me-2">{user?.role}</span>
                {user?.isVerified && (
                  <span className="badge bg-success">✓ Verified</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="profile" className="mb-3">
                <Tab
                  eventKey="profile"
                  title={
                    <>
                      <FaUser className="me-2" />
                      Profile Info
                    </>
                  }
                >
                  <Form onSubmit={handleProfileUpdate}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={user?.email} disabled />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Button type="submit" variant="primary">
                      <FaSave className="me-2" />
                      Save Changes
                    </Button>
                  </Form>
                </Tab>

                <Tab
                  eventKey="password"
                  title={
                    <>
                      <FaLock className="me-2" />
                      Change Password
                    </>
                  }
                >
                  <Form onSubmit={handlePasswordChange}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary">
                      <FaLock className="me-2" />
                      Change Password
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;