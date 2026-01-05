
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionName: { type: String, default: "Chat session" },
  topic: { type: String, default: "General" },
  rolePlay: { type: String }, // nhà hàng, du lịch, giáo viên, v.v.
  isEnglishRelated: { type: Boolean, default: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

chatHistorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  return;
});

export default mongoose.model("ChatHistory", chatHistorySchema);
