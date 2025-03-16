// aiRoutes.ts
import express from "express";
import { generatePostContent } from "../controllers/aiController";

const router = express.Router();

// Use the handler directly but with explicit typing
router.post("/generate-content", generatePostContent as express.RequestHandler);

export default router;