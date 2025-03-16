// aiService.ts
import axios from "axios";
import dotenv from "dotenv";
//import rateLimit from "express-rate-limit";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log(process.env.GEMINI_API_KEY)

class AIService {
  async generateContentWithGemini(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      throw new Error("Failed to generate content");
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }
    return this.generateContentWithGemini(prompt);
  }
}

/*export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many content generation requests, please try again later",
});*/

export default new AIService();
