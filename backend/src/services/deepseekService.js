// backend/src/services/deepseekService.js
import deepseek from "../config/deepseek.js";

const SYSTEM_PROMPT = `You are "English Tutor AI", an AI assistant specialized in helping Vietnamese speakers learn English.

Your responsibilities:
- Help with English grammar, vocabulary, pronunciation, conversation practice, and writing
- Always respond in English (with Vietnamese explanations when needed for clarity)
- If asked about Math, Physics, Chemistry, Programming, or unrelated topics, politely decline and redirect to English learning
- Provide examples, corrections, and constructive feedback
- Be encouraging and patient

Response format:
- Keep answers clear and concise
- Use simple English for beginners
- Provide Vietnamese translations for difficult words
- Give practical examples

IMPORTANT: Only assist with English language learning. For off-topic questions, respond like:
"I'm here to help you learn English! That's an interesting topic, but let's focus on English. Would you like to know how to say [related term] in English?"`;

export const chatWithDeepSeek = async (messages, rolePlay = null, systemPromptOverride = null) => {
  try {
    let systemPrompt = systemPromptOverride || SYSTEM_PROMPT;

    // Thêm bối cảnh nhập vai (role play)
    if (rolePlay) {
      const rolePlayPrompts = {
        restaurant: "You are a restaurant waiter/waitress. Help the user practice ordering food, asking about menu items, and restaurant conversations.",
        tourist: "You are a tour guide or local helping a tourist. Practice directions, recommendations, and travel-related conversations.",
        teacher: "You are an English teacher in a classroom setting. Help with academic English, explanations, and formal language.",
        friend: "You are a friendly native English speaker. Practice casual conversation, slang, and everyday English.",
        interview: "You are conducting a job interview. Practice professional English, answering questions, and business communication.",
      };

      systemPrompt += `\n\nROLE PLAY MODE: ${rolePlayPrompts[rolePlay] || rolePlayPrompts.friend}`;
    }

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      success: true,
      message: completion.choices[0].message.content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error. Please try again.",
      error: error.message,
    };
  }
};

export const explainWord = async (word) => {
  try {
    const prompt = `Explain the English word "${word}" in detail:
1. Definition (in English)
2. Vietnamese translation
3. Pronunciation guide
4. Part of speech
5. 2-3 example sentences
6. Common phrases or idioms using this word

Format your response clearly.`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    return {
      success: true,
      explanation: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("DeepSeek Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Sửa lỗi tiếng Anh nói và giải thích ngữ pháp
 * Được sử dụng cho tính năng Luyện nói (Speaking Practice)
 */
export const correctSpeaking = async (userText) => {
  try {
    const prompt = `Người học nói: "${userText}"

Hãy trả lời CHÍNH XÁC theo format JSON sau (không thêm text nào khác):
{
  "correctText": "Câu tiếng Anh đúng (sửa lỗi ngữ pháp, giữ ý nghĩa gốc)",
  "explanation": "Giải thích ngắn gọn bằng tiếng Việt về lỗi và cách sửa"
}

Nếu câu đã đúng, correctText giữ nguyên và explanation ghi "Câu của bạn đã đúng!"`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a grammar correction assistant. Always respond in valid JSON format only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const raw = completion.choices[0].message.content.trim();

    // Trích xuất JSON từ phản hồi
    let jsonText = raw;
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = raw.slice(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonText);

    return {
      success: true,
      correctText: data.correctText || userText,
      explanation: data.explanation || "",
    };
  } catch (error) {
    console.error("DeepSeek Correct Speaking Error:", error);
    return {
      success: false,
      correctText: userText,
      explanation: "Không thể phân tích câu. Vui lòng thử lại.",
      error: error.message,
    };
  }
};

export const generateVocabFromVietnamese = async (vietnameseWord) => {
  try {
    const prompt = `The user provides a Vietnamese word or short phrase that represents a vocabulary concept they want to learn in English.

Vietnamese input: "${vietnameseWord}"

Your task:
- Choose the most natural and common English word that matches this Vietnamese meaning.
- Provide clear information for learning vocabulary.

Return the result as pure JSON with this exact structure (no extra text, no Markdown):
{
  "word": "main English word in lowercase",
  "phonetic": "IPA transcription between slashes",
  "partOfSpeech": "noun | verb | adjective | adverb | phrase | other",
  "level": "beginner | intermediate | advanced",
  "vietnamese": "short Vietnamese meaning",
  "definition": "clear English definition for the main meaning",
  "examples": [
    "Example sentence 1 using the word in English.",
    "Example sentence 2 using the word in English."
  ],
  "otherMeanings": [
    {
      "definition": "another English meaning of the same word (if any)",
      "vietnamese": "short Vietnamese meaning",
      "examples": [
        "Example sentence for this other meaning."
      ]
    }
  ]
}

If there are no other meanings, return an empty array for "otherMeanings".`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    });

    const raw = completion.choices[0].message.content.trim();
    let jsonText = raw;
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = raw.slice(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonText);

    return {
      success: true,
      vocab: data,
    };
  } catch (error) {
    console.error("DeepSeek Vocab Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const analyzePronunciation = async (transcript, expectedText = null) => {
  try {
    const prompt = expectedText
      ? `Analyze this pronunciation attempt:
Expected: "${expectedText}"
Spoken: "${transcript}"

Provide:
1. Pronunciation accuracy (0-100)
2. Grammar correctness (0-100)
3. Fluency assessment (0-100)
4. Specific corrections needed
5. Helpful tips

Be encouraging but honest.`
      : `Analyze this spoken English:
"${transcript}"

Provide:
1. Grammar check
2. Pronunciation feedback
3. Suggestions for improvement
4. Overall rating (1-5 stars)`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    return {
      success: true,
      analysis: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("DeepSeek Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
