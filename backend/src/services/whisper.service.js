
import { pipeline } from "@xenova/transformers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let whisperPipeline = null;

/**
 * Khởi tạo whisper pipeline (tải lười - lazy loading)
 */
const getWhisperPipeline = async () => {
    if (!whisperPipeline) {
        console.log("🔄 Loading Whisper model (Xenova/whisper-small)...");
        console.log("⏳ This may take a few minutes on first run...");

        whisperPipeline = await pipeline(
            "automatic-speech-recognition",
            "Xenova/whisper-small",
            {
                quantized: true,
            }
        );
        console.log("✅ Whisper model loaded successfully!");
    }
    return whisperPipeline;
};

/**
 * Chuyển đổi file âm thanh thành văn bản dùng Whisper
 * @param {string} wavPath - Đường dẫn file audio WAV
 * @returns {Promise<string>} Văn bản đã dịch
 */
export const speechToText = async (wavPath) => {
    try {
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(wavPath)) {
            throw new Error(`Audio file not found: ${wavPath}`);
        }

        console.log("🎤 Starting speech recognition...");
        console.log("📁 Audio file:", wavPath);

        const transcriber = await getWhisperPipeline();

        // @xenova/transformers có thể nhận đường dẫn file dạng URL
        // Chuyển đổi sang URL file:// cho file cục bộ
        const fileUrl = `file:///${wavPath.replace(/\\/g, "/")}`;

        console.log("🔊 Processing audio...");

        // Dịch âm thanh sử dụng URL file
        const result = await transcriber(fileUrl, {
            language: "english",
            task: "transcribe",
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: false,
        });

        const transcribedText = result.text ? result.text.trim() : "";
        console.log("📝 Transcribed:", transcribedText);

        return transcribedText;
    } catch (error) {
        console.error("Whisper STT error:", error);
        throw new Error(`Speech-to-text failed: ${error.message}`);
    }
};

export default { speechToText };
