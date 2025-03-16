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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
const baseController_1 = __importDefault(require("./baseController"));
class CommentsController extends baseController_1.default {
    constructor() {
        super(commentModel_1.default);
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.body.userId;
                const postId = req.body.postId;
                const comment = {
                    content: req.body.content,
                    owner: userId,
                    postId: postId
                };
                const newComment = new this.model(comment);
                yield newComment.save();
                // Increment comment count on the post
                yield postModel_1.default.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
                res.status(201).json(newComment);
            }
            catch (error) {
                res.status(500).json({ error: "Error creating comment" });
            }
        });
    }
    getByPostId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = req.params.postId;
                const comments = yield this.model.find({ postId: postId })
                    .sort({ createdAt: -1 });
                res.status(200).json(comments);
            }
            catch (error) {
                res.status(500).json({ error: "Error fetching comments" });
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commentId = req.params.id;
                const userId = req.body.userId;
                const comment = yield this.model.findById(commentId);
                if (!comment) {
                    res.status(404).json({ error: "Comment not found" });
                    return;
                }
                // Check if user is the owner of the comment
                if (comment.owner !== userId) {
                    res.status(403).json({ error: "Not authorized to delete this comment" });
                    return;
                }
                // Decrement comment count on the post
                yield postModel_1.default.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
                yield this.model.findByIdAndDelete(commentId);
                res.status(200).json({ message: "Comment deleted successfully" });
            }
            catch (error) {
                res.status(500).json({ error: "Error deleting comment" });
            }
        });
    }
}
exports.default = new CommentsController();
//# sourceMappingURL=commentController.js.map