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
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    try {
        console.log('Posts get by id service');
        const post = yield postModel_1.default.findById(postId);
        if (!post) {
            res.status(404).send('Post not found');
        }
        else {
            res.status(200).send(post);
        }
    }
    catch (error) {
        res.status(400).send(error.message);
    }
});
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownerFilter = req.query.owner;
    try {
        console.log('Posts get all posts service');
        if (ownerFilter) {
            const posts = yield postModel_1.default.find({ owner: ownerFilter });
            res.status(200).send(posts);
        }
        else {
            const posts = yield postModel_1.default.find();
            res.status(200).send(posts);
        }
    }
    catch (error) {
        res.status(400).send(error.message);
    }
});
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = req.body;
    try {
        console.log('Posts create service');
        const newPost = yield postModel_1.default.create(post);
        res.status(201).send(newPost);
    }
    catch (error) {
        res.status(400).send(error.message);
    }
});
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    try {
        console.log('Posts delete service');
        const post = yield postModel_1.default.findByIdAndDelete(postId);
        if (!post) {
            res.status(404).send('Post not found');
        }
        else {
            res.status(200).send(post);
        }
    }
    catch (error) {
        res.status(400).send(error.message);
    }
});
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const post = req.body;
    try {
        console.log('Posts update service');
        const updatedPost = yield postModel_1.default.findByIdAndUpdate(postId, post, { new: true });
        if (!updatedPost) {
            res.status(404).send('Post not found');
        }
        else {
            res.status(200).send(updatedPost);
        }
    }
    catch (error) {
        res.status(400).send(error.message);
    }
});
exports.default = {
    getPostById,
    getAllPosts,
    createPost,
    deletePost,
    updatePost,
};
//# sourceMappingURL=postController.js.map