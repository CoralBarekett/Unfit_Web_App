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
exports.generatePostContent = void 0;
const aiService_1 = __importDefault(require("../services/aiService"));
const generatePostContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Received request body:", req.body);
        const { title, topic } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        // Create a prompt based on the post title and topic
        let prompt = `Write an engaging blog post about "${title}".`;
        if (topic && topic.trim()) {
            prompt += ` Focus on ${topic}.`;
        }
        prompt += " The content should be informative and well-structured.";
        console.log("Generated prompt:", prompt);
        const generatedContent = yield aiService_1.default.generateContent(prompt);
        console.log("Content generated successfully");
        res.status(200).json({ content: generatedContent });
    }
    catch (error) {
        console.error("Error in generatePostContent:", error);
        res.status(500).json({ error: error.message || "Failed to generate content" });
    }
});
exports.generatePostContent = generatePostContent;
//# sourceMappingURL=aiController.js.map