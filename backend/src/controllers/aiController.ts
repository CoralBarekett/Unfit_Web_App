/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import aiService from "../services/aiService";

export const generatePostContent = async (req: Request, res: Response) => {
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
      
      const generatedContent = await aiService.generateContent(prompt);
      console.log("Content generated successfully");
      
      res.status(200).json({ content: generatedContent });
    } catch (error: any) {
      console.error("Error in generatePostContent:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  };
