"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const postController_1 = __importDefault(require("../controllers/postController"));
router.get('/:id', postController_1.default.getPostById);
router.get('/', postController_1.default.getAllPosts);
router.post('/', postController_1.default.createPost);
router.delete('/:id', postController_1.default.deletePost);
router.put('/:id', postController_1.default.updatePost);
exports.default = router;
//# sourceMappingURL=postsRoutes.js.map