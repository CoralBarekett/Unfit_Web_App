"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// aiRoutes.ts
const express_1 = __importDefault(require("express"));
const aiController_1 = require("../controllers/aiController");
//import { aiRateLimiter } from "../services/aiService";
const router = express_1.default.Router();
router.post("/generate-content", aiController_1.generatePostContent);
exports.default = router;
//# sourceMappingURL=aiRoutes.js.map