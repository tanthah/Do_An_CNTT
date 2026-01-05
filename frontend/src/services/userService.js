// frontend/src/services/userService.js
import api from "./api";

export const getUserStats = () => {
  return api.get("/users/profile");
};

export const updateProfile = (userData) => {
  return api.put("/users/profile", userData);
};

export const getAllUsers = (page = 1, limit = 10, search = "", sortBy = "", isActive = "") => {
  return api.get("/users", { params: { page, limit, search, sortBy, isActive } });
};

export const getUserDetail = (userId) => {
  return api.get(`/users/${userId}`);
};

export const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`);
};

export const toggleUserActive = (userId) => {
  return api.put(`/users/${userId}/toggle-active`);
};

export const getUserVocabularyLists = (userId) => {
  return api.get(`/users/${userId}/vocabulary-lists`);
};

export const getUserVocabularyListDetail = (userId, listId) => {
  return api.get(`/users/${userId}/vocabulary-lists/${listId}`);
};
