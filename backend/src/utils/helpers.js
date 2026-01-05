
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateSessionName = (rolePlay = null) => {
  const date = new Date().toLocaleDateString();
  if (rolePlay) {
    return `${rolePlay} practice - ${date}`;
  }
  return `Chat session - ${date}`;
};

export const calculateStudyTime = (messages) => {
  if (!messages || messages.length === 0) return 0;

  const firstMessage = new Date(messages[0].timestamp);
  const lastMessage = new Date(messages[messages.length - 1].timestamp);

  return Math.round((lastMessage - firstMessage) / 60000); // minutes
};

export const extractVocabulary = (text) => {
  // Trích xuất từ đơn giản (có thể cải thiện bằng NLP)
  const words = text.match(/\b[a-zA-Z]{4,}\b/g) || [];
  return [...new Set(words.map(w => w.toLowerCase()))];
};