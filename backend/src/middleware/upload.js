
import multer from "multer";
import path from "path";
import fs from "fs";

// Tạo thư mục nếu chưa có
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/files";

    if (file.fieldname === "audio") {
      uploadPath = "uploads/audio";
    }

    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // File âm thanh
  if (file.fieldname === "audio") {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"), false);
    }
  }
  // File ảnh/Avatar
  else if (file.fieldname === "avatar" || file.mimetype.startsWith("image/")) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for avatar!"), false);
    }
  }
  // File tài liệu
  else {
    const allowedExts = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
    // Chỉ cần cho phép nếu đuôi file hợp lệ, và có thể kiểm tra mimetype một cách tương đối
    // Cách kiểm tra mimetype trước đây quá khắt khe đối với file tài liệu.

    if (extname) {
      cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed!"), false);
    }
  }
};

// Middleware upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});
