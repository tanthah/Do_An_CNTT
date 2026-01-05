
import mongoose from "mongoose";

const listeningHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    originText: {
        type: String,
        required: true,
    },
    userText: {
        type: String,
        default: "",
    },
    score: {
        type: Number,
        default: 0,
    },
    feedback: {
        type: String,
    },
    details: {
        wordAccuracy: { type: Number },
        missingWords: [{ type: String }],
        extraWords: [{ type: String }],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("ListeningHistory", listeningHistorySchema);
