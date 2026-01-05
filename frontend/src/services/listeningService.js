// frontend/src/services/listeningService.js
import api from "./api";

/**
 * Tạo bài nghe mẫu (tạo TTS audio)
 * @param {string} text - Văn bản cần chuyển thành giọng nói
 * @returns {Promise} API response với audioUrl
 */
export const createListening = (text) => {
    return api.post("/listening/create", { text });
};

/**
 * Tạo nội dung AI (đoạn văn hoặc hội thoại)
 * @param {string} prompt - Yêu cầu/chủ đề của người dùng
 * @returns {Promise} API response với nội dung và audioUrl
 */
export const generateAIContent = (prompt) => {
    return api.post("/listening/generate", { prompt });
};

/**
 * Lấy lịch sử luyện nghe
 * @param {number} limit - Số item mỗi trang
 * @param {number} page - Số trang
 * @returns {Promise} API response với danh sách lịch sử và thống kê
 */
export const getListeningHistory = (limit = 20, page = 1) => {
    return api.get("/listening/history", { params: { limit, page } });
};

// ============ CHỨC NĂNG ADMIN ============

/**
 * Lấy thống kê luyện nghe của admin
 * @returns {Promise} API response với thống kê
 */
export const getAdminListeningStats = () => {
    return api.get("/listening/admin/stats");
};

/**
 * Lấy tất cả lịch sử luyện nghe (admin)
 * @param {number} page - Số trang
 * @param {number} limit - Số item mỗi trang
 * @returns {Promise} API response với tất cả lịch sử
 */
export const getAllListeningHistory = (page = 1, limit = 20) => {
    return api.get("/listening/admin/history", { params: { page, limit } });
};

/**
 * Xóa bản ghi lịch sử luyện nghe (admin)
 * @param {string} id - ID bản ghi
 * @returns {Promise} API response
 */
export const deleteListeningHistory = (id) => {
    return api.delete(`/listening/admin/history/${id}`);
};

/**
 * Cleanup TTS files
 * @returns {Promise} API response
 */
export const cleanupTTS = () => {
    return api.delete("/listening/cleanup");
};
