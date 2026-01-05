import deepseek from '../config/deepseek.js';

export const sendToDeepSeek = async (chunks, task) => {
    let promptPrefix = "";
    if (task === 'translate') {
        promptPrefix = "Hãy dịch văn bản sau sang tiếng Việt (chỉ trả về kết quả dịch):\n\n";
    } else if (task === 'translate_vi_to_en') {
        promptPrefix = "Please translate the following Vietnamese text to English (only return the translation result):\n\n";
    } else if (task === 'fix_grammar') {
        promptPrefix = "Hãy kiểm tra ngữ pháp và gợi ý cách diễn đạt tự nhiên hơn cho văn bản sau (giữ nguyên ngôn ngữ gốc, chỉ đưa ra nhận xét và ví dụ sửa đổi nếu cần):\n\n";
    } else {
        promptPrefix = "Xử lý văn bản sau:\n\n";
    }

    const results = [];

    for (const chunk of chunks) {
        try {
            const completion = await deepseek.chat.completions.create({
                model: "deepseek-chat",
                messages: [
                    { role: "user", content: promptPrefix + chunk }
                ],
                temperature: 0.3,
                max_tokens: 2000
            });
            const content = completion.choices[0].message.content;
            if (content) results.push(content);
        } catch (error) {
            console.error("DeepSeek chunk error:", error);
            results.push("[Lỗi khi xử lý đoạn này]");
        }
    }

    return results.join("\n\n---\n\n");
};
