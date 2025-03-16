// aiRoutes.ts
import express from "express";
import { generatePostContent } from "../controllers/aiController";
//import { aiRateLimiter } from "../services/aiService";

const router = express.Router();

router.post("/generate-content", generatePostContent);

export default router;
