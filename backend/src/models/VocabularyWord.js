import mongoose from "mongoose";

const otherMeaningSchema = new mongoose.Schema(
  {
    definition: { type: String },
    vietnamese: { type: String },
    examples: [{ type: String }],
  },
  { _id: false }
);

const vocabularyWordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VocabularyList",
    required: true,
  },
  word: { type: String, required: true },
  phonetic: { type: String },
  partOfSpeech: { type: String },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  vietnamese: { type: String },
  definition: { type: String },
  examples: [{ type: String }],
  otherMeanings: [otherMeaningSchema],
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

vocabularyWordSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("VocabularyWord", vocabularyWordSchema);

