// frontend/src/components/common/Sidebar.jsx - UPDATED VERSION
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Nav } from "react-bootstrap";
import {
  FaHome,
  FaComments,
  FaHistory,
  FaBook,
  FaUser,
  FaTimes,
  FaUserShield,
  FaStar,
  FaHeadphones,
} from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { path: "/chat", icon: <FaComments />, label: "Chat Practice" },
    { path: "/listening", icon: <FaHeadphones />, label: "Luyện Nghe" },
    { path: "/vocabulary", icon: <FaBook />, label: "Vocabulary" },
    { path: "/history", icon: <FaHistory />, label: "History" },
    { path: "/profile", icon: <FaUser />, label: "Profile" },
    { path: "/feedback", icon: <FaStar />, label: "Đánh giá" },
  ];

  // Thêm menu admin nếu user là admin
  if (user?.role === "admin") {
    menuItems.push({
      path: "/admin",
      icon: <FaUserShield />,
      label: "Admin Panel",
    });
  }

  return (
    <>
      {/* Lớp phủ cho mobile */}
      {isOpen && (
        <div className="sidebar-overlay d-md-none" onClick={toggleSidebar} />
      )}

      {/* Thanh bên */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header d-md-none">
          <h5 className="mb-0">Menu</h5>
          <button className="btn btn-link" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <Nav className="flex-column sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </Nav>
      </aside>
    </>
  );
};

export default Sidebar;