// frontend/src/App.jsx - COMPLETE VERSION
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import ChatPage from "./pages/ChatPage";
import HistoryPage from "./pages/HistoryPage";
import VocabularyPage from "./pages/VocabularyPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import FeedbackPage from "./pages/FeedbackPage";
import ListeningPage from "./pages/ListeningPage";
import OTPVerification from "./components/auth/OTPVerification";
import FeedbackPopup from "./components/feedback/FeedbackPopup";

// Redux
import { getMe } from "./redux/slices/authSlice";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <LoadingSpinner />;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return !isAuthenticated ? children : <Navigate to="/chat" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (user?.role !== "admin") {
    return <Navigate to="/chat" />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getMe());
    }
  }, [token, dispatch, isAuthenticated]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="app">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/google"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Header toggleSidebar={toggleSidebar} />
                  <div className="app-container">
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <main className="app-content">
                      <Routes>

                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/chat/:sessionId" element={<ChatPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/vocabulary" element={<VocabularyPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/feedback" element={<FeedbackPage />} />
                        <Route path="/listening" element={<ListeningPage />} />

                        {/* Admin Routes */}
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminPage />
                            </AdminRoute>
                          }
                        />

                        {/* Redirect to dashboard if no match */}
                        <Route path="*" element={<Navigate to="/chat" />} />
                      </Routes>
                      <FeedbackPopup />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
