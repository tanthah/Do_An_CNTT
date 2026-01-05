// frontend/src/components/common/Header.jsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { FaBars, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../../redux/slices/authSlice";
import { getInitials } from "../../utils/helpers";
import { toast } from "react-toastify";

const Header = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <Navbar bg="white" className="shadow-sm main-header" fixed="top">
      <Container fluid className="position-relative">
        <div className="d-flex align-items-center">
          <button className="btn btn-link d-md-none" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>

        <Navbar.Brand
          href="/dashboard"
          className="fw-bold text-primary header-title"
        >
          🎓 English Learning
        </Navbar.Brand>

        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" id="user-dropdown" className="text-decoration-none">
              <div className="d-flex align-items-center">
                <div
                  className="avatar"
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    marginRight: "10px",
                  }}
                >
                  {getInitials(user?.name || "U")}
                </div>
                <span className="d-none d-md-inline text-dark">{user?.name}</span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate("/profile")}>
                <FaUser className="me-2" />
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("/profile")}>
                <FaCog className="me-2" />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FaSignOutAlt className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
