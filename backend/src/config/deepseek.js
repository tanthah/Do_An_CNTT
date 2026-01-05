
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-68d2bcd6a2304cd7b0d64934bfa622da",
  baseURL: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1",
});


export default deepseek;
