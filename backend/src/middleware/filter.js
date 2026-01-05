
import { getConfigValue } from "../controllers/aiConfigController.js";

// Danh sách từ khóa mặc định (fallback nếu database chưa có dữ liệu)
const DEFAULT_BLOCKED_KEYWORDS = [
  // Toán học
  "toán", "toan", "phương trình", "phuong trinh", "giải toán",
  "equation", "calculus", "algebra", "geometry",

  // Vật lý
  "vật lý", "vat ly", "định luật", "dinh luat", "lực", "luc",
  "physics", "force", "momentum",

  // Hóa học
  "hóa học", "hoa hoc", "phản ứng", "phan ung", "nguyên tố", "nguyen to",
  "chemistry", "chemical", "molecule",

  // Lập trình
  "code", "lập trình", "lap trinh", "python", "javascript", "java",
  "programming", "function", "algorithm", "debug",

  // Khác
  "sinh học", "sinh hoc", "lịch sử", "lich su", "địa lý", "dia ly"
];

export const checkEnglishRelated = async (req, res, next) => {
  try {
    // Lấy từ khóa bị cấm từ database, fallback về danh sách mặc định
    const blockedKeywords = await getConfigValue("blocked_keywords") || DEFAULT_BLOCKED_KEYWORDS;

    const input = req.body.message?.toLowerCase() || "";

    // Kiểm tra từ khóa bị chặn
    const foundBlocked = blockedKeywords.some(keyword =>
      input.includes(keyword.toLowerCase())
    );

    if (foundBlocked) {
      return res.json({
        success: true,
        isBlocked: true,
        message: " I can only help with English learning! Let's focus on grammar, vocabulary, or conversation practice. What would you like to learn today?",
        suggestion: "Try asking about English words, phrases, or practice conversation with me! "
      });
    }

    // Kiểm tra câu hỏi có liên quan đến học tiếng Anh không
    const englishKeywords = [
      "english", "grammar", "vocabulary", "pronunciation", "speaking",
      "tiếng anh", "tieng anh", "ngữ pháp", "ngu phap", "từ vựng", "tu vung",
      "phát âm", "phat am", "how to say", "what does", "mean", "translate"
    ];

    const hasEnglishContext = englishKeywords.some(keyword =>
      input.includes(keyword.toLowerCase())
    );

    // Nếu input quá ngắn hoặc không có context, cho qua
    if (input.length < 10 || hasEnglishContext) {
      return next();
    }

    // Đánh dấu để AI xử lý
    req.body.needsContextCheck = true;
    next();
  } catch (error) {
    console.error("Filter middleware error:", error);
    // Nếu có lỗi, cho phép request tiếp tục
    next();
  }
};
