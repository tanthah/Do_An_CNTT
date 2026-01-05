import api from "./api";

export const getVocabLists = () => {
  return api.get("/vocabulary/lists");
};

export const createVocabList = (data) => {
  return api.post("/vocabulary/lists", data);
};

export const getVocabListDetail = (listId) => {
  return api.get(`/vocabulary/lists/${listId}`);
};

export const deleteVocabList = (listId) => {
  return api.delete(`/vocabulary/lists/${listId}`);
};

export const addWordToListFromVietnamese = (listId, vietnamese) => {
  return api.post(`/vocabulary/lists/${listId}/words`, { vietnamese });
};

export const getRecentWords = (limit = 20) => {
  return api.get("/vocabulary/recent-words", { params: { limit } });
};
