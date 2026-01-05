
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

// Đảm bảo thư mục uploads/tts tồn tại
const TTS_DIR = path.join(process.cwd(), "uploads", "tts");
if (!fs.existsSync(TTS_DIR)) {
    fs.mkdirSync(TTS_DIR, { recursive: true });
}

/**
 * Chuyển văn bản thành giọng nói dùng Python edge-tts
 * Yêu cầu: pip install edge-tts
 * @param {string} text - Văn bản cần chuyển đổi
 * @param {string} outPath - Đường dẫn file đầu ra (tùy chọn)
 * @param {string} voice - Giọng đọc (mặc định: en-US-AriaNeural)
 * @returns {Promise<string>} Đường dẫn file audio đã tạo
 */
export const textToSpeech = async (text, outPath = null, voice = "en-US-AriaNeural") => {
    try {
        // Tạo đường dẫn đầu ra nếu chưa có
        if (!outPath) {
            const filename = `tts_${Date.now()}.mp3`;
            outPath = path.join(TTS_DIR, filename);
        }

        // Đảm bảo thư mục tồn tại
        const dir = path.dirname(outPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Làm sạch và escape văn bản cho dòng lệnh
        // Thay thế xuống dòng bằng khoảng trắng, loại bỏ ký tự gây lỗi
        const cleanedText = text
            .replace(/[\r\n]+/g, ' ')  // Thay thế xuống dòng bằng khoảng trắng
            .replace(/\s+/g, ' ')       // Gộp nhiều khoảng trắng
            .replace(/"/g, "'")         // Thay ngoặc kép bằng ngoặc đơn
            .replace(/`/g, "'")         // Thay backtick bằng ngoặc đơn
            .replace(/\$/g, "")         // Loại bỏ ký tự $
            .replace(/[<>|&;]/g, "")    // Loại bỏ ký tự đặc biệt shell
            .trim();

        if (!cleanedText) {
            throw new Error("Text is empty after cleaning");
        }

        // Sử dụng CLI Python edge-tts
        // Người dùng cần cài đặt: pip install edge-tts
        const command = `python -m edge_tts --voice "${voice}" --text "${cleanedText}" --write-media "${outPath}"`;

        console.log("🔊 Running TTS command...");

        await execAsync(command, {
            timeout: 60000,
            shell: true,
        });

        // Kiểm tra file đã được tạo chưa
        if (!fs.existsSync(outPath)) {
            throw new Error("TTS file was not created. Make sure edge-tts is installed: pip install edge-tts");
        }

        console.log(`✅ TTS generated: ${outPath}`);
        return outPath;
    } catch (error) {
        console.error("TTS error:", error);

        // Cung cấp thông báo lỗi hữu ích
        if (error.message.includes("not recognized") || error.message.includes("not found")) {
            throw new Error("edge-tts not installed. Please run: pip install edge-tts");
        }

        throw new Error(`Text-to-speech failed: ${error.message}`);
    }
};

/**
 * Lấy URL tương đối cho file audio
 * @param {string} absolutePath - Đường dẫn tuyệt đối của file
 * @returns {string} URL tương đối cho client
 */
export const getAudioUrl = (absolutePath) => {
    const uploadsIndex = absolutePath.indexOf("uploads");
    if (uploadsIndex === -1) {
        return absolutePath;
    }
    return "/" + absolutePath.substring(uploadsIndex).replace(/\\/g, "/");
};

export default { textToSpeech, getAudioUrl };
