export const chunkText = (text, maxLength = 2000) => {
    if (!text) return [];

    const chunks = [];
    // Tách theo câu (xấp xỉ)
    // Tìm các câu hoặc đoạn
    const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];

    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
            // Nếu một câu quá dài, có thể cần cắt cứng, 
            // nhưng hiện tại giả định các câu có độ dài hợp lý.
            // Nếu câu dài hơn maxLength, ép buộc cắt (tùy chọn nhưng tốt cho an toàn)
            if (currentChunk.length > maxLength) {
                // Logic cắt cứng nếu cần, hoặc cứ đẩy vào.
            }
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};
