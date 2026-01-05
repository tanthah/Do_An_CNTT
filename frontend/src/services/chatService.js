// frontend/src/services/chatService.js
import api from "./api";

export const sendMessage = (message, sessionId = null) => {
  return api.post("/chat", { message, sessionId });
};

export const getChatHistory = (page = 1, limit = 10) => {
  return api.get("/chat/history", { params: { page, limit } });
};

export const getSession = (sessionId) => {
  return api.get(`/chat/session/${sessionId}`);
};

export const deleteSession = (sessionId) => {
  return api.delete(`/chat/session/${sessionId}`);
};

export const explainWord = (word) => {
  return api.post("/chat/explain", { word });
};

export const uploadChatFile = (file, sessionId = null, task = "translate") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("task", task);
  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  return api.post("/chat/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============ ADMIN FUNCTIONS ============

/**
 * Get admin chat statistics
 * @returns {Promise} API response with stats
 */
export const getAdminChatStats = () => {
  return api.get("/chat/admin/stats");
};

/**
 * Get all chat sessions (admin)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response with sessions list
 */
export const getAllChatSessions = (page = 1, limit = 20) => {
  return api.get("/chat/admin/sessions", { params: { page, limit } });
};

/**
 * Delete chat session (admin)
 * @param {string} id - Session ID
 * @returns {Promise} API response
 */
export const deleteChatSession = (id) => {
  return api.delete(`/chat/admin/session/${id}`);
};
