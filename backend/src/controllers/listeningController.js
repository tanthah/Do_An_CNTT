
import path from "path";
import fs from "fs";
import { textToSpeech, getAudioUrl } from "../services/tts.service.js";
import deepseek from "../config/deepseek.js";
import ListeningHistory from "../models/ListeningHistory.js";

// Các thư mục
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const TTS_DIR = path.join(UPLOADS_DIR, "tts");

// Đảm bảo thư mục tồn tại
[TTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * @desc    Tạo bài nghe mẫu (tạo audio TTS)
 * @route   POST /api/listening/create
 * @access  Riêng tư
 */
export const createListening = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập văn bản",
            });
        }

        // Tạo audio TTS
        const filename = `sample_${Date.now()}.mp3`;
        const outPath = path.join(TTS_DIR, filename);

        await textToSpeech(text.trim(), outPath);

        const audioUrl = getAudioUrl(outPath);

        res.json({
            success: true,
            message: "Đã tạo bài nghe mẫu",
            audioUrl,
            text: text.trim(),
        });
    } catch (error) {
        console.error("Create listening error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tạo bài nghe",
            error: error.message,
        });
    }
};

/**
 * @desc    Tạo nội dung AI (đoạn văn hoặc hội thoại)
 * @route   POST /api/listening/generate
 * @access  Riêng tư
 */
export const generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập yêu cầu",
            });
        }

        const aiPrompt = `Hãy thực hiện yêu cầu sau đây bằng tiếng Anh:
"${prompt.trim()}"

Quy tắc:
- Nếu yêu cầu tạo hội thoại, hãy viết mỗi lượt nói trên dòng riêng. Format: tên nhân vật ở dòng riêng, câu nói ở dòng tiếp theo.
- Nếu yêu cầu tạo đoạn văn, hãy viết đoạn văn ngắn gọn (80-120 từ)
- Sử dụng ngôn ngữ tự nhiên, dễ hiểu, phù hợp cho người học tiếng Anh
- CHỈ trả về nội dung được yêu cầu, KHÔNG giải thích hay dịch`;

        // Gọi DeepSeek AI
        const completion = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: aiPrompt }],
            temperature: 0.7,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content?.trim();

        if (!content) {
            throw new Error("AI không thể tạo nội dung");
        }

        // Tạo audio TTS cho nội dung
        const timestamp = Date.now();
        const filename = `ai_content_${timestamp}.mp3`;
        const outPath = path.join(TTS_DIR, filename);

        // Với hội thoại, tạo audio cho toàn bộ nội dung
        await textToSpeech(content, outPath);
        const audioUrl = getAudioUrl(outPath);

        // Lưu vào lịch sử
        try {
            await ListeningHistory.create({
                userId: req.user.id,
                originText: content,
                userText: prompt.trim(),
                score: 100, // No scoring for listening-only
                feedback: `AI generated content: ${prompt.trim()}`,
                details: {
                    prompt: prompt.trim(),
                },
            });
        } catch (historyError) {
            console.error("Save history error:", historyError);
        }

        res.json({
            success: true,
            message: "Đã tạo nội dung thành công",
            content,
            audioUrl,
        });
    } catch (error) {
        console.error("Generate content error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tạo nội dung",
            error: error.message,
        });
    }
};

/**
 * @desc    Lấy lịch sử luyện nghe
 * @route   GET /api/listening/history
 * @access  Riêng tư
 */
export const getListeningHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, page = 1 } = req.query;

        const history = await ListeningHistory.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ListeningHistory.countDocuments({ userId });

        // Tính toán thống kê
        const stats = await ListeningHistory.aggregate([
            { $match: { userId: req.user._id || userId } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$score" },
                    totalPractices: { $sum: 1 },
                    bestScore: { $max: "$score" },
                },
            },
        ]);

        res.json({
            success: true,
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
            stats: stats[0] || { avgScore: 0, totalPractices: 0, bestScore: 0 },
        });
    } catch (error) {
        console.error("Get listening history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy lịch sử luyện nghe",
            error: error.message,
        });
    }
};

/**
 * @desc    Lấy thống kê luyện nghe cho admin
 * @route   GET /api/listening/admin/stats
 * @access  Admin
 */
export const getAdminListeningStats = async (req, res) => {
    try {
        const totalSessions = await ListeningHistory.countDocuments();

        // Lấy số người dùng duy nhất đã luyện nghe
        const uniqueUsers = await ListeningHistory.distinct("userId");

        // Các phiên hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessionsToday = await ListeningHistory.countDocuments({
            createdAt: { $gte: today }
        });

        // Các phiên tuần này
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const sessionsThisWeek = await ListeningHistory.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Xu hướng sử dụng hàng ngày (7 ngày qua)
        const dailyTrend = await ListeningHistory.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top người dùng theo mức sử dụng
        const topUsers = await ListeningHistory.aggregate([
            {
                $group: {
                    _id: "$userId",
                    sessionCount: { $sum: 1 },
                    lastUsed: { $max: "$createdAt" },
                },
            },
            { $sort: { sessionCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    sessionCount: 1,
                    lastUsed: 1,
                    "user.name": 1,
                    "user.email": 1,
                },
            },
        ]);

        res.json({
            success: true,
            stats: {
                totalSessions,
                uniqueUsersCount: uniqueUsers.length,
                sessionsToday,
                sessionsThisWeek,
                dailyTrend,
                topUsers,
            },
        });
    } catch (error) {
        console.error("Get admin listening stats error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy thống kê",
            error: error.message,
        });
    }
};

/**
 * @desc    Lấy tất cả lịch sử luyện nghe (admin)
 * @route   GET /api/listening/admin/history
 * @access  Admin
 */
export const getAllListeningHistory = async (req, res) => {
    try {
        const { limit = 20, page = 1, search = "" } = req.query;

        let query = {};

        const history = await ListeningHistory.find(query)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await ListeningHistory.countDocuments(query);

        res.json({
            success: true,
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Get all listening history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy lịch sử",
            error: error.message,
        });
    }
};

/**
 * @desc    Xóa bản ghi lịch sử luyện nghe
 * @route   DELETE /api/listening/admin/history/:id
 * @access  Admin
 */
export const deleteListeningHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await ListeningHistory.findById(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy record",
            });
        }

        await ListeningHistory.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Đã xoá record",
        });
    } catch (error) {
        console.error("Delete listening history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể xoá record",
            error: error.message,
        });
    }
};

/**
 * @desc    Xóa tất cả file trong thư mục TTS (dọn dẹp khi thoát session)
 * @route   DELETE /api/listening/cleanup
 * @access  Riêng tư
 */
export const cleanupTTS = async (req, res) => {
    try {
        if (fs.existsSync(TTS_DIR)) {
            const files = fs.readdirSync(TTS_DIR);

            for (const file of files) {
                const filePath = path.join(TTS_DIR, file);
                // Chỉ xoá file, không xoá thư mục con (nếu có)
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        res.json({
            success: true,
            message: "Đã dọn dẹp thư mục TTS",
        });
    } catch (error) {
        console.error("Cleanup TTS error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể dọn dẹp TTS",
            error: error.message,
        });
    }
};
