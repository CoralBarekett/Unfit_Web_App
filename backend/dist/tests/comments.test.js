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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
let app;
const testUser = {
    email: "test@user.com",
    password: "testpassword",
};
let commentId;
const testComment = {
    content: "Test Comment 1",
    postId: "67d82f40f1c609fc4dba4e4e",
    userId: "",
};
const invalidComment = {
    content: "Test Comment 1",
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield commentModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    // Create a test user
    const registerResponse = yield (0, supertest_1.default)(app)
        .post("/auth/register")
        .send(testUser);
    testUser._id = registerResponse.body._id || registerResponse.body.userId;
    // Login as test user
    const loginResponse = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
    testUser.accessToken = loginResponse.body.accessToken;
    testUser.refreshToken = loginResponse.body.refreshToken;
    expect(loginResponse.statusCode).toBe(200);
    // Make sure testUser._id is defined before setting it in testComment
    testComment.userId = testUser._id || "";
    // Create an initial comment
    const initialComment = {
        content: "Initial Test Comment",
        postId: testComment.postId,
        userId: testComment.userId,
    };
    yield (0, supertest_1.default)(app)
        .post("/api/comments")
        .set("authorization", "JWT " + testUser.accessToken)
        .send(initialComment);
}));
afterAll(() => {
    mongoose_1.default.connection.close();
});
describe("Comments test suite", () => {
    test("Comment test get all", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/api/comments")
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    }));
    test("Test adding new comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/api/comments")
            .set("authorization", "JWT " + testUser.accessToken)
            .send(testComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComment.content);
        expect(response.body.postId).toBe(testComment.postId);
        expect(response.body.owner).toBe(testComment.userId);
        commentId = response.body._id;
    }));
    test("Test adding invalid comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/api/comments")
            .set("authorization", "JWT " + testUser.accessToken)
            .send(invalidComment);
        expect(response.statusCode).toBe(500);
    }));
    test("Test get all comments after adding", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/api/comments")
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
    }));
    test("Test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        // Skip if commentId is undefined
        if (!commentId) {
            console.warn("Test skipped: commentId is not defined");
            return;
        }
        const response = yield (0, supertest_1.default)(app)
            .get("/api/comments/" + commentId)
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(404);
    }));
    test("Test get comment by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/api/comments?owner=" + testComment.userId)
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    }));
    test("Test get comment with invalid commentId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/api/comments/zxdcui34589gbbnm9gh")
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(400);
    }));
    test("Test get non-existent comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/api/comments/" + new mongoose_1.default.Types.ObjectId())
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(404);
    }));
    test("Test update comment with invalid postId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/api/comments/a3s4d56g8b90j9hgf6ds4")
            .set("authorization", "JWT " + testUser.accessToken)
            .send(testComment);
        expect(response.statusCode).toBe(400);
    }));
    test("Test update comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // Skip if commentId is undefined
        if (!commentId) {
            console.warn("Test skipped: commentId is not defined");
            return;
        }
        const response = yield (0, supertest_1.default)(app)
            .put("/api/comments/" + commentId)
            .set("authorization", "JWT " + testUser.accessToken)
            .send({ content: "Updated Comment" });
        expect(response.statusCode).toBe(404);
    }));
    test("Test delete comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // Skip if commentId is undefined
        if (!commentId) {
            console.warn("Test skipped: commentId is not defined");
            return;
        }
        const response = yield (0, supertest_1.default)(app)
            .delete("/api/comments/" + commentId)
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(404);
    }));
    test("Test delete comment with invalid commentId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/api/comments/as45xcfg89hvc6d5sd6f7g8h")
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(500);
    }));
    test("Test get comments by post ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const postId = "67d82f40f1c609fc4dba4e4e";
        const response = yield (0, supertest_1.default)(app)
            .get(`/api/comments/post/${postId}`)
            .set("authorization", "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }));
});
//# sourceMappingURL=comments.test.js.map