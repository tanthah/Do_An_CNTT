import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { extractTextFromImage } from '../services/ocr.service.js';
import { extractTextFromPDF } from '../services/pdf.service.js';
import { extractTextFromDocx } from '../services/docx.service.js';
import { chunkText } from '../services/textChunk.service.js';
import { sendToDeepSeek } from '../services/deepseek.service.js';
import { protect } from '../middleware/auth.js';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';

const router = express.Router();

// Cấu hình Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đảm bảo thư mục uploads tồn tại
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    // Kiểm tra thêm mimetype nếu cần an toàn hơn, nhưng extension là bắt buộc theo yêu cầu user
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file .png, .jpg, .jpeg, .pdf, .docx'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Route: POST /api/chat/upload
// Vì router này được gắn tại /api/chat/upload, nên xử lý '/'
router.post('/', protect, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng upload file' });
    }

    const filePath = req.file.path;
    const task = req.body.task || 'translate'; // Mặc định là dịch
    const sessionId = req.body.sessionId;
    const userId = req.user.id;

    try {
        let text = "";
        const ext = path.extname(req.file.originalname).toLowerCase();

        // Chọn service dựa trên đuôi file
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            text = await extractTextFromImage(filePath);
        } else if (ext === '.pdf') {
            text = await extractTextFromPDF(filePath);
        } else if (ext === '.docx') {
            text = await extractTextFromDocx(filePath);
        }

        if (!text || text.trim().length === 0) {
            throw new Error("Không thể đọc được nội dung từ file.");
        }

        // Chia nhỏ văn bản
        const chunks = chunkText(text); // default 2000 chars

        // Gửi đến DeepSeek
        const processedText = await sendToDeepSeek(chunks, task);

        // Dọn dẹp file
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        // Lấy nhãn task cho tin nhắn
        const taskLabel = task === 'translate' ? 'Dịch Anh → Việt' :
            task === 'translate_vi_to_en' ? 'Dịch Việt → Anh' : 'Sửa ngữ pháp';

        // Lưu vào lịch sử chat
        let chatSession;
        if (sessionId) {
            chatSession = await ChatHistory.findById(sessionId);
        }

        if (!chatSession) {
            chatSession = await ChatHistory.create({
                userId,
                sessionName: `File: ${req.file.originalname}`,
            });
        }

        // Thêm tin nhắn user (thông tin file upload)
        chatSession.messages.push({
            role: "user",
            content: `📎 [File Upload] ${req.file.originalname}\n🔧 Task: ${taskLabel}`,
        });

        // Thêm phản hồi của assistant
        chatSession.messages.push({
            role: "assistant",
            content: processedText,
        });

        await chatSession.save();

        // Cập nhật thống kê user (tính là một lần tương tác chat)
        await User.findByIdAndUpdate(userId, {
            $inc: { totalChats: 1 },
        });

        // Trả về kết quả
        res.json({
            success: true,
            sessionId: chatSession._id,
            data: {
                fileName: req.file.originalname,
                originalText: text.substring(0, 500) + "...", // Preview
                result: processedText
            }
        });

    } catch (error) {
        // Dọn dẹp khi có lỗi
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => { });
        }
        console.error("Upload processing error:", error);
        res.status(500).json({ success: false, message: "Lỗi xử lý file: " + error.message });
    }
});

export default router;
