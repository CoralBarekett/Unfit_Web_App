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
const postModel_1 = __importDefault(require("../models/postModel"));
const baseController_1 = __importDefault(require("./baseController"));
class PostsController extends baseController_1.default {
    constructor() {
        super(postModel_1.default);
    }
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.body.userId;
            // Map imageUrl to image if needed
            const imageField = req.body.imageUrl ? { image: req.body.imageUrl } : {};
            const post = Object.assign(Object.assign(Object.assign({}, req.body), { owner: userId, likes: [], commentCount: 0 }), imageField // Add the image field if imageUrl exists
            );
            req.body = post;
            try {
                yield _super.create.call(this, req, res);
            }
            catch (error) {
                res.status(500).json({ error: "Error creating post" });
            }
        });
    }
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.body.userId;
                const postId = req.params.id;
                // Find post to verify ownership
                const post = yield this.model.findById(postId);
                if (!post) {
                    res.status(404).json({ error: "Post not found" });
                    return;
                }
                // Check if user owns this post
                if (post.owner !== userId) {
                    res.status(403).json({ error: "Not authorized to update this post" });
                    return;
                }
                // Map imageUrl to image if needed
                if (req.body.imageUrl) {
                    req.body.image = req.body.imageUrl;
                    delete req.body.imageUrl;
                }
                yield _super.update.call(this, req, res);
            }
            catch (error) {
                res.status(500).json({ error: "Error updating post" });
            }
        });
    }
    // Get posts by current user
    getMyPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.body.userId;
                const posts = yield this.model.find({ owner: userId });
                res.status(200).json(posts);
            }
            catch (error) {
                res.status(500).json({ error: "Error fetching posts" });
            }
        });
    }
    // Get all posts with pagination
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const posts = yield this.model.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);
                const total = yield this.model.countDocuments();
                const totalPages = Math.ceil(total / limit);
                res.status(200).json({
                    posts,
                    totalPages,
                    currentPage: page,
                    totalPosts: total
                });
            }
            catch (error) {
                res.status(500).json({ error: "Error fetching posts" });
            }
        });
    }
    // Like/Unlike a post
    toggleLike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.body.userId;
                const postId = req.params.id;
                const post = yield this.model.findById(postId);
                if (!post) {
                    res.status(404).json({ error: "Post not found" });
                    return;
                }
                const likeIndex = post.likes.indexOf(userId);
                if (likeIndex === -1) {
                    // Add like
                    post.likes.push(userId);
                }
                else {
                    // Remove like
                    post.likes.splice(likeIndex, 1);
                }
                yield post.save();
                res.status(200).json(post);
            }
            catch (error) {
                res.status(500).json({ error: "Error toggling like" });
            }
        });
    }
}
exports.default = new PostsController();
//# sourceMappingURL=postController.js.map