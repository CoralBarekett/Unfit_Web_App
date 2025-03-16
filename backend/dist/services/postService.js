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
/* eslint-disable @typescript-eslint/no-explicit-any */
const apiService_1 = __importDefault(require("./apiService"));
const createPost = (postData) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiService_1.default.post('/posts', postData);
    return response.data;
});
const getPostById = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiService_1.default.get(`/posts/${postId}`);
    return response.data;
});
const updatePost = (postId, postData) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiService_1.default.put(`/posts/${postId}`, postData);
    return response.data;
});
const getAllPosts = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    const response = yield apiService_1.default.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
});
const getMyPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiService_1.default.get('/posts/my-posts');
    return response.data;
});
const toggleLike = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield apiService_1.default.post(`/posts/${postId}/like`);
    return response.data;
});
const postService = {
    createPost,
    getPostById,
    updatePost,
    getAllPosts,
    getMyPosts,
    toggleLike
};
exports.default = postService;
//# sourceMappingURL=postService.js.map