// frontend/src/services/feedbackService.js
import api from "./api";

export const submitFeedback = (data) => {
    return api.post("/feedback", data);
};

export const getMyFeedbacks = () => {
    return api.get("/feedback/my");
};

export const getFeedbackStatus = () => {
    return api.get("/feedback/status");
};

// Các API cho Admin
export const getAllFeedbacks = (page = 1, limit = 20, filters = {}) => {
    const params = { page, limit, ...filters };
    return api.get("/feedback", { params });
};

export const updateFeedback = (id, data) => {
    return api.put(`/feedback/${id}`, data);
};

export const deleteFeedback = (id) => {
    return api.delete(`/feedback/${id}`);
};

export const getFeedbackStats = () => {
    return api.get("/feedback/stats");
};
