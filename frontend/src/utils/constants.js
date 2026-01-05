// frontend/src/utils/constants.js

export const ROLE_PLAY_OPTIONS = [
  { value: "friend", label: "🤝 Friendly Chat", description: "Casual conversation with a friend" },
  { value: "restaurant", label: "🍽️ Restaurant", description: "Order food and interact with waiter" },
  { value: "tourist", label: "✈️ Tourist Guide", description: "Ask for directions and travel tips" },
  { value: "teacher", label: "👨‍🏫 Classroom", description: "Learn in a formal academic setting" },
  { value: "interview", label: "💼 Job Interview", description: "Practice professional communication" },
];

export const MESSAGE_STATUS = {
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
};

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};
