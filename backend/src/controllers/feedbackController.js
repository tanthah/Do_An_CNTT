import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

// @desc    Gửi phản hồi
// @route   POST /api/feedback
// @access  Riêng tư
export const submitFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, overallRating, featureRatings, message } = req.body;

        // Ngăn chặn spam: Kiểm tra xem người dùng đã gửi > 5 phản hồi hôm nay chưa
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const feedbackCountToday = await Feedback.countDocuments({
            userId,
            createdAt: { $gte: today },
        });

        if (feedbackCountToday >= 5) {
            return res.status(429).json({
                success: false,
                message: "Bạn đã gửi tối đa 5 phản hồi trong ngày. Vui lòng thử lại vào ngày mai.",
            });
        }

        // Kiểm tra dữ liệu: phải có đánh giá HOẶC tin nhắn/góp ý
        const isRatingSubmission = !!overallRating;
        const isFeedbackSubmission = !!message;

        if (!isRatingSubmission && !isFeedbackSubmission) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đánh giá hoặc nội dung góp ý",
            });
        }

        if (isRatingSubmission && (overallRating < 1 || overallRating > 5)) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng đánh giá từ 1-5 sao",
            });
        }

        // Loại bỏ các đánh giá tính năng bằng 0 (chưa đánh giá)
        const cleanFeatureRatings = {};
        if (featureRatings) {
            Object.keys(featureRatings).forEach((key) => {
                if (featureRatings[key] > 0) {
                    cleanFeatureRatings[key] = featureRatings[key];
                }
            });
        }

        const feedback = await Feedback.create({
            userId,
            type: type || "improvement",
            overallRating: overallRating || undefined,
            featureRatings: cleanFeatureRatings,
            message: message || "",
        });

        // Cập nhật số lượng phản hồi của người dùng
        await User.findByIdAndUpdate(userId, {
            $inc: { feedbackCount: 1 },
        });

        res.status(201).json({
            success: true,
            message: "Cảm ơn bạn đã gửi phản hồi! ❤️",
            feedback,
        });
    } catch (error) {
        console.error("Submit feedback error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể gửi đánh giá",
            error: error.message,
        });
    }
};

// @desc    Lấy danh sách phản hồi của tôi
// @route   GET /api/feedback/my
// @access  Riêng tư
export const getMyFeedbacks = async (req, res) => {
    try {
        const userId = req.user.id;
        const feedbacks = await Feedback.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            feedbacks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách đánh giá",
            error: error.message,
        });
    }
};

// @desc    Lấy tất cả phản hồi (Admin)
// @route   GET /api/feedback
// @access  Admin
export const getAllFeedbacks = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, rating } = req.query;

        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (rating) query.overallRating = parseInt(rating);

        const feedbacks = await Feedback.find(query)
            .populate("userId", "name email avatar")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Feedback.countDocuments(query);

        // Tính toán thống kê
        const stats = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$overallRating" },
                    totalFeedbacks: { $sum: 1 },
                    pendingCount: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                    },
                },
            },
        ]);

        res.json({
            success: true,
            feedbacks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
            stats: stats[0] || { avgRating: 0, totalFeedbacks: 0, pendingCount: 0 },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách feedback",
            error: error.message,
        });
    }
};

// @desc    Cập nhật phản hồi (Admin)
// @route   PUT /api/feedback/:id
// @access  Admin
export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy feedback",
            });
        }

        if (status) feedback.status = status;
        if (adminNote !== undefined) feedback.adminNote = adminNote;

        await feedback.save();

        res.json({
            success: true,
            message: "Đã cập nhật feedback",
            feedback,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể cập nhật feedback",
            error: error.message,
        });
    }
};

// @desc    Xóa phản hồi (Admin)
// @route   DELETE /api/feedback/:id
// @access  Admin
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy feedback",
            });
        }

        await feedback.deleteOne();

        res.json({
            success: true,
            message: "Đã xóa feedback",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể xóa feedback",
            error: error.message,
        });
    }
};

// @desc    Lấy trạng thái phản hồi của người dùng (số lượt còn lại trong ngày, ngày đánh giá cuối)
// @route   GET /api/feedback/status
// @access  Riêng tư
export const getFeedbackStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Đếm số phản hồi đã gửi hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const feedbackCountToday = await Feedback.countDocuments({
            userId,
            createdAt: { $gte: today },
        });

        // Lấy đánh giá gần nhất (phản hồi có overallRating)
        const lastRating = await Feedback.findOne({
            userId,
            overallRating: { $exists: true, $ne: null },
        }).sort({ createdAt: -1 });

        const maxDailyFeedback = 5;
        const remainingFeedback = Math.max(0, maxDailyFeedback - feedbackCountToday);
        const canSubmitFeedback = feedbackCountToday < maxDailyFeedback;

        // Kiểm tra xem người dùng có nên đánh giá lại không (5 ngày kể từ lần cuối)
        let shouldRateAgain = true;
        let daysSinceLastRating = null;

        if (lastRating) {
            const lastRatingDate = new Date(lastRating.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - lastRatingDate);
            daysSinceLastRating = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            shouldRateAgain = daysSinceLastRating >= 5;
        }

        res.json({
            success: true,
            status: {
                feedbackCountToday,
                remainingFeedback,
                canSubmitFeedback,
                maxDailyFeedback,
                lastRatingDate: lastRating?.createdAt || null,
                daysSinceLastRating,
                shouldRateAgain,
            },
        });
    } catch (error) {
        console.error("Get feedback status error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy trạng thái feedback",
            error: error.message,
        });
    }
};

// @desc    Lấy thống kê phản hồi chi tiết (Admin)
// @route   GET /api/feedback/stats
// @access  Admin
export const getFeedbackStats = async (req, res) => {
    try {
        // Thống kê tổng quan
        const overallStats = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$overallRating" },
                    totalFeedbacks: { $sum: 1 },
                    totalRatings: {
                        $sum: { $cond: [{ $gt: ["$overallRating", 0] }, 1, 0] },
                    },
                    lowStarCount: {
                        $sum: { $cond: [{ $lte: ["$overallRating", 2] }, 1, 0] },
                    },
                    pendingCount: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                    },
                    inProgressCount: {
                        $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
                    },
                },
            },
        ]);

        // Trung bình theo tính năng
        const featureStats = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    chatWriting: { $avg: "$featureRatings.chatWriting" },
                    chatSpeaking: { $avg: "$featureRatings.chatSpeaking" },
                    pronunciation: { $avg: "$featureRatings.pronunciation" },
                    textToSpeech: { $avg: "$featureRatings.textToSpeech" },
                    fileUpload: { $avg: "$featureRatings.fileUpload" },
                },
            },
        ]);

        // Số lượng lỗi (chưa giải quyết)
        const unresolvedBugs = await Feedback.countDocuments({
            type: "bug",
            status: { $ne: "resolved" },
        });

        // Số lượng yêu cầu tính năng
        const featureRequests = await Feedback.countDocuments({
            type: "feature",
        });

        // Xu hướng đánh giá (7 ngày qua)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ratingTrend = await Feedback.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    overallRating: { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    avgRating: { $avg: "$overallRating" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Phân bố theo loại
        const typeDistribution = await Feedback.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({
            success: true,
            stats: {
                overall: overallStats[0] || {
                    avgRating: 0,
                    totalFeedbacks: 0,
                    totalRatings: 0,
                    lowStarCount: 0,
                    pendingCount: 0,
                    inProgressCount: 0,
                },
                featureAverages: featureStats[0] || {},
                unresolvedBugs,
                featureRequests,
                ratingTrend,
                typeDistribution,
            },
        });
    } catch (error) {
        console.error("Get feedback stats error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy thống kê feedback",
            error: error.message,
        });
    }
};
