import VocabularyList from "../models/VocabularyList.js";
import VocabularyWord from "../models/VocabularyWord.js";
import User from "../models/User.js";
import { generateVocabFromVietnamese } from "../services/deepseekService.js";

export const createList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, topic } = req.body;

    const trimmedName = (name || "").trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "List name is required",
      });
    }

    const existing = await VocabularyList.findOne({
      userId,
      name: trimmedName,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "List name already exists",
      });
    }

    const list = await VocabularyList.create({
      userId,
      name: trimmedName,
      description,
      topic,
    });

    res.status(201).json({
      success: true,
      list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create vocabulary list",
      error: error.message,
    });
  }
};

export const getLists = async (req, res) => {
  try {
    const userId = req.user.id;

    const lists = await VocabularyList.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      lists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get vocabulary lists",
      error: error.message,
    });
  }
};

export const getListDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const list = await VocabularyList.findOne({
      _id: id,
      userId,
    }).populate({
      path: "words",
      options: { sort: { createdAt: -1 } },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Vocabulary list not found",
      });
    }

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get vocabulary list",
      error: error.message,
    });
  }
};

export const deleteList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const list = await VocabularyList.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Vocabulary list not found",
      });
    }

    await VocabularyWord.deleteMany({ listId: list._id });

    res.json({
      success: true,
      message: "Vocabulary list deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete vocabulary list",
      error: error.message,
    });
  }
};

export const addWordFromVietnamese = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { vietnamese } = req.body;

    const input = (vietnamese || "").trim();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Vietnamese word is required",
      });
    }

    const list = await VocabularyList.findOne({
      _id: id,
      userId,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Vocabulary list not found",
      });
    }

    const result = await generateVocabFromVietnamese(input);

    if (!result.success || !result.vocab) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate vocabulary from AI",
        error: result.error,
      });
    }

    const data = result.vocab;

    if (!data.word) {
      return res.status(500).json({
        success: false,
        message: "AI response does not contain a valid word",
      });
    }

    const examples = Array.isArray(data.examples)
      ? data.examples.filter((x) => typeof x === "string")
      : [];

    const otherMeanings = Array.isArray(data.otherMeanings)
      ? data.otherMeanings.map((m) => ({
        definition: m.definition || "",
        vietnamese: m.vietnamese || "",
        examples: Array.isArray(m.examples)
          ? m.examples.filter((x) => typeof x === "string")
          : [],
      }))
      : [];

    const word = await VocabularyWord.create({
      userId,
      listId: list._id,
      word: data.word,
      phonetic: data.phonetic || "",
      partOfSpeech: data.partOfSpeech || "",
      level: data.level || "beginner",
      vietnamese: data.vietnamese || input,
      definition: data.definition || "",
      examples,
      otherMeanings,
    });

    list.words.unshift(word._id);
    await list.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { vocabLearned: 1 },
    });

    res.status(201).json({
      success: true,
      word,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add word to list",
      error: error.message,
    });
  }
};

/**
 * @desc    Lấy các từ vừa thêm gần đây
 * @route   GET /api/vocabulary/recent-words
 * @access  Riêng tư
 */
export const getRecentWords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const words = await VocabularyWord.find({ userId })
      .populate("listId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalWords = await VocabularyWord.countDocuments({ userId });
    const totalLists = await VocabularyList.countDocuments({ userId });

    res.json({
      success: true,
      words,
      stats: {
        totalWords,
        totalLists,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get recent words",
      error: error.message,
    });
  }
};
