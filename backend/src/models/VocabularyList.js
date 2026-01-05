import mongoose from "mongoose";

const vocabularyListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  topic: { type: String },
  words: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VocabularyWord",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

vocabularyListSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("VocabularyList", vocabularyListSchema);

