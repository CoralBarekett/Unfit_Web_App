"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// aiService.ts
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
//import rateLimit from "express-rate-limit";
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
class AIService {
    generateContentWithGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
                    contents: [{ parts: [{ text: prompt }] }],
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                return response.data.candidates[0].content.parts[0].text;
            }
            catch (error) {
                console.error("Error generating content with Gemini:", error);
                throw new Error("Failed to generate content");
            }
        });
    }
    generateContent(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!GEMINI_API_KEY) {
                throw new Error("Gemini API key not configured");
            }
            return this.generateContentWithGemini(prompt);
        });
    }
}
/*export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many content generation requests, please try again later",
});*/
exports.default = new AIService();
//# sourceMappingURL=aiService.js.map