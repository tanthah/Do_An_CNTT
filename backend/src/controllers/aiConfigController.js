
import AIConfig from "../models/AIConfig.js";

const DEFAULT_CONFIGS = [
    {
        key: "system_prompt",
        value: "You are a helpful English learning assistant. Correct user's grammar, explain vocabulary, and help them practice English. Do not solve math, physics, or chemistry problems. If asked about these, politely refuse in English stating that you are an English learning assistant.",
        description: "AI System Prompt / Persona"
    },
    {
        key: "blocked_keywords",
        value: ["giải toán", "vật lý", "hóa học", "code python", "viết code", "làm bài tập toán"],
        description: "List of keywords to block"
    }
];

// Khởi tạo mặc định nếu chưa tồn tại
export const initializeDefaults = async () => {
    try {
        for (const config of DEFAULT_CONFIGS) {
            const exists = await AIConfig.findOne({ key: config.key });
            if (!exists) {
                await AIConfig.create(config);
                console.log(`Initialized AI Config: ${config.key}`);
            }
        }
    } catch (error) {
        console.error("AI Config Init Error:", error);
    }
};

// @desc    Lấy tất cả cấu hình AI
// @route   GET /api/ai-config
export const getAIConfigs = async (req, res) => {
    try {
        const configs = await AIConfig.find({});

        // Kiểm tra nếu thiếu mặc định thì khởi tạo lại
        if (configs.length === 0) {
            await initializeDefaults();
            const newConfigs = await AIConfig.find({});
            return res.json({ success: true, configs: newConfigs });
        }

        res.json({ success: true, configs });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get AI configs",
            error: error.message
        });
    }
};

// @desc    Cập nhật cấu hình AI
// @route   PUT /api/ai-config
export const updateAIConfig = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({
                success: false,
                message: "Key and value are required"
            });
        }

        const config = await AIConfig.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true } // Tạo mới nếu chưa tồn tại
        );

        res.json({
            success: true,
            message: "Config updated successfully",
            config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update AI config",
            error: error.message
        });
    }
};

// Hàm hỗ trợ lấy giá trị cấu hình
export const getConfigValue = async (key) => {
    try {
        const config = await AIConfig.findOne({ key });
        if (config) return config.value;

        // Fallback về mặc định
        const defaultValue = DEFAULT_CONFIGS.find(c => c.key === key)?.value;
        return defaultValue;
    } catch (error) {
        console.error(`Get config ${key} error:`, error);
        return null;
    }
};
