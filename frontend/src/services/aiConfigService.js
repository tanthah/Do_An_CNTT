// frontend/src/services/aiConfigService.js
import api from "./api";

// Get all AI configs
export const getAIConfigs = () => {
    return api.get("/ai-config");
};

// Update specific config
export const updateAIConfig = (key, value) => {
    return api.put("/ai-config", { key, value });
};
