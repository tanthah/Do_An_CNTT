
import mongoose from "mongoose";

const aiConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ["system_prompt", "blocked_keywords"]
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Có thể là chuỗi hoặc mảng
        required: true
    },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

aiConfigSchema.pre("save", function () {
    this.updatedAt = Date.now();
});

export default mongoose.model("AIConfig", aiConfigSchema);
