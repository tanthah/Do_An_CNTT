
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Loại phản hồi
    type: {
        type: String,
        enum: ["bug", "improvement", "feature", "other"],
        default: "improvement",
    },

    // Đánh giá chung (1-5 sao)
    overallRating: {
        type: Number,
        min: 1,
        max: 5,
        // Tùy chọn nếu người dùng chỉ gửi văn bản phản hồi
    },

    // Đánh giá theo tính năng (1-5, tùy chọn)
    featureRatings: {
        chatWriting: { type: Number, min: 1, max: 5 },
        chatSpeaking: { type: Number, min: 1, max: 5 },
        textToSpeech: { type: Number, min: 1, max: 5 },   // Chuyển văn bản thành giọng nói (TTS)
        fileUpload: { type: Number, min: 1, max: 5 },
    },

    // Tin nhắn của người dùng
    message: {
        type: String,
        maxlength: 2000,
    },

    // Quản lý bởi Admin
    status: {
        type: String,
        enum: ["pending", "in-progress", "reviewed", "resolved"],
        default: "pending",
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },

    adminNote: {
        type: String,
        maxlength: 1000,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

feedbackSchema.pre("save", function () {
    this.updatedAt = Date.now();
});

export default mongoose.model("Feedback", feedbackSchema);
