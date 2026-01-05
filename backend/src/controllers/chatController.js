
import ChatHistory from "../models/ChatHistory.js";
import User from "../models/User.js";
import { chatWithDeepSeek, explainWord } from "../services/deepseekService.js";
import { sendToDeepSeek } from "../services/deepseek.service.js";
import { chunkText } from "../services/textChunk.service.js";
import { getConfigValue } from "./aiConfigController.js";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

// @desc    Gửi tin nhắn đến AI và nhận phản hồi
// @route   POST /api/chat
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, rolePlay } = req.body;
    const userId = req.user.id;

    // 1. Tải danh sách từ khóa bị chặn từ cấu hình hệ thống
    const blockedKeywords = await getConfigValue("blocked_keywords");

    // 2. Kiểm tra nội dung tin nhắn có chứa từ khóa bị chặn không
    if (blockedKeywords && Array.isArray(blockedKeywords)) {
      const lowerMsg = message.toLowerCase();
      const isBlocked = blockedKeywords.some(keyword => lowerMsg.includes(keyword.toLowerCase()));

      if (isBlocked) {
        return res.json({
          success: true,
          message: "Xin lỗi, tôi chỉ có thể hỗ trợ các chủ đề liên quan đến việc học tiếng Anh.",
          isBlocked: true,
        });
      }
    }

    // 3. Tải System Prompt từ cấu hình (để định hình tính cách AI)
    const systemPromptConfig = await getConfigValue("system_prompt");

    // Tìm phiên chat hiện tại hoặc tạo mới
    let chatSession;
    if (sessionId) {
      chatSession = await ChatHistory.findById(sessionId);
    }

    if (!chatSession) {
      chatSession = await ChatHistory.create({
        userId,
        sessionName: rolePlay ? `Luyện tập: ${rolePlay}` : "Phiên trò chuyện",
        rolePlay,
      });
    }

    // Lưu tin nhắn của người dùng vào lịch sử
    chatSession.messages.push({
      role: "user",
      content: message,
    });

    // Chuẩn bị danh sách tin nhắn để gửi đến API AI
    const apiMessages = chatSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Gọi DeepSeek AI với System Prompt tùy chỉnh
    const aiResponse = await chatWithDeepSeek(apiMessages, rolePlay, systemPromptConfig);

    if (aiResponse.success) {
      // Lưu phản hồi của AI vào lịch sử
      chatSession.messages.push({
        role: "assistant",
        content: aiResponse.message,
      });

      await chatSession.save();

      // Cập nhật thống kê số lần chat của người dùng
      await User.findByIdAndUpdate(userId, {
        $inc: { totalChats: 1 },
      });

      res.json({
        success: true,
        message: aiResponse.message,
        sessionId: chatSession._id,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Lỗi dịch vụ AI",
        error: aiResponse.error,
      });
    }
  } catch (error) {
    console.error("Lỗi chat:", error);
    res.status(500).json({
      success: false,
      message: "Gửi tin nhắn thất bại",
      error: error.message,
    });
  }
};

// @desc    Lấy lịch sử các phiên chat
// @route   GET /api/chat/history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const sessions = await ChatHistory.find({ userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ChatHistory.countDocuments({ userId });

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử chat",
      error: error.message,
    });
  }
};

// @desc    Lấy chi tiết một phiên chat cụ thể
// @route   GET /api/chat/session/:id
export const getSession = async (req, res) => {
  try {
    const session = await ChatHistory.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiên chat",
      });
    }

    // Kiểm tra quyền sở hữu (chỉ chủ sở hữu mới được xem)
    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy chi tiết phiên chat",
      error: error.message,
    });
  }
};

// @desc    Xóa một phiên chat
// @route   DELETE /api/chat/session/:id
export const deleteSession = async (req, res) => {
  try {
    const session = await ChatHistory.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiên chat",
      });
    }

    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    await session.deleteOne();

    res.json({
      success: true,
      message: "Đã xóa phiên chat",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi xóa phiên chat",
      error: error.message,
    });
  }
};

// @desc    Giải thích từ vựng hoặc cụm từ
// @route   POST /api/chat/explain
export const explainWordPhrase = async (req, res) => {
  try {
    const { word } = req.body;

    const result = await explainWord(word);

    if (result.success) {
      res.json({
        success: true,
        explanation: result.explanation,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Không thể giải thích",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi giải thích từ vựng",
      error: error.message,
    });
  }
};

// @desc    Xử lý file chat (đọc nội dung file/ảnh, trả về văn bản để điền vào tin nhắn)
// @route   POST /api/chat/upload
export const uploadChatFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Không có file nào được gửi lên",
      });
    }

    // 1. Đọc nội dung file
    let extractedText = "";
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    try {
      // Xử lý file ảnh bằng OCR
      if (mimeType.startsWith("image/")) {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("eng+vie");
        const { data: { text } } = await worker.recognize(file.path);
        await worker.terminate();
        extractedText = text.trim();
      }
      // Xử lý file PDF
      else if (ext === ".pdf") {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdf(dataBuffer);
        extractedText = data.text;
      }
      // Xử lý file Word (.docx)
      else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: file.path });
        extractedText = result.value;
      }
      // Xử lý file text
      else if (ext === ".txt") {
        extractedText = fs.readFileSync(file.path, "utf8");
      }
      // Định dạng không hỗ trợ
      else {
        extractedText = "";
      }
    } catch (err) {
      console.error("Lỗi đọc file:", err);
      extractedText = "";
    }

    // 2. Xóa file tạm ngay sau khi đọc xong
    if (file.path) {
      fs.unlink(file.path, () => { });
    }

    // 3. Trả về nội dung đã trích xuất để frontend điền vào ô tin nhắn
    res.json({
      success: true,
      fileName: file.originalname,
      fileType: mimeType,
      extractedText: extractedText,
      message: extractedText
        ? "Đã trích xuất nội dung file thành công."
        : "Không thể trích xuất văn bản từ file này.",
    });

  } catch (error) {
    console.error("Lỗi xử lý file chat:", error);
    res.status(500).json({
      success: false,
      message: "Xử lý file thất bại",
      error: error.message,
    });
  }
};

// ============ CÁC CHỨC NĂNG CỦA ADMIN ============

/**
 * @desc    Lấy thống kê chat cho Admin
 * @route   GET /api/chat/admin/stats
 * @access  Admin
 */
export const getAdminChatStats = async (req, res) => {
  try {
    const totalSessions = await ChatHistory.countDocuments();

    // Lấy số lượng user duy nhất đã chat
    const uniqueUsers = await ChatHistory.distinct("userId");

    // Tổng số tin nhắn trong tất cả các phiên
    const messageStats = await ChatHistory.aggregate([
      { $project: { messageCount: { $size: "$messages" } } },
      { $group: { _id: null, totalMessages: { $sum: "$messageCount" } } }
    ]);

    // Số phiên chat hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionsToday = await ChatHistory.countDocuments({
      createdAt: { $gte: today }
    });

    // Số phiên chat trong tuần này
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const sessionsThisWeek = await ChatHistory.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Xu hướng hàng ngày (7 ngày qua)
    const dailyTrend = await ChatHistory.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top người dùng hoạt động nhiều nhất (tính theo số phiên)
    const topUsers = await ChatHistory.aggregate([
      {
        $group: {
          _id: "$userId",
          sessionCount: { $sum: 1 },
          totalMessages: { $sum: { $size: "$messages" } },
          lastUsed: { $max: "$updatedAt" },
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
          totalMessages: 1,
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
        totalMessages: messageStats[0]?.totalMessages || 0,
        sessionsToday,
        sessionsThisWeek,
        dailyTrend,
        topUsers,
      },
    });
  } catch (error) {
    console.error("Lỗi thống kê chat:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
      error: error.message,
    });
  }
};

/**
 * @desc    Lấy tất cả các phiên chat (Admin)
 * @route   GET /api/chat/admin/sessions
 * @access  Admin
 */
export const getAllChatSessions = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const sessions = await ChatHistory.find()
      .populate("userId", "name email")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await ChatHistory.countDocuments();

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách phiên chat:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách phiên chat",
      error: error.message,
    });
  }
};

/**
 * @desc    Xóa phiên chat (Quyền Admin)
 * @route   DELETE /api/chat/admin/session/:id
 * @access  Admin
 */
export const adminDeleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await ChatHistory.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy session",
      });
    }

    await ChatHistory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Đã xoá phiên chat",
    });
  } catch (error) {
    console.error("Lỗi xóa phiên chat (Admin):", error);
    res.status(500).json({
      success: false,
      message: "Không thể xoá session",
      error: error.message,
    });
  }
};
