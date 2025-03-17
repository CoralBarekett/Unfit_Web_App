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
    email: 'test@user.com',
    password: 'testpassword'
};
let commentId = "";
const testComment = {
    comment: 'Test Comment 1',
    postId: "zxcvlker78ityknp4567uhnkl",
    owner: 'Coral'
};
const invalidComment = {
    comment: 'Test Comment 1',
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield commentModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    yield (0, supertest_1.default)(app).post('/auth/register').send(testUser);
    const response = yield (0, supertest_1.default)(app).post('/auth/login').send(testUser);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    expect(response.statusCode).toBe(200);
}));
afterAll(() => {
    mongoose_1.default.connection.close();
});
describe("Comments test suite", () => {
    test("Comment test get all", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/comments')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    }));
    test("Test adding new comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/comments')
            .set('authorization', "JWT " + testUser.accessToken)
            .send(testComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.comment).toBe(testComment.comment);
        expect(response.body.postId).toBe(testComment.postId);
        expect(response.body.owner).toBe(testComment.owner);
        commentId = response.body._id;
    }));
    test("Test adding invalid comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/comments')
            .set('authorization', "JWT " + testUser.accessToken)
            .send(invalidComment);
        expect(response.statusCode).toBe(400);
    }));
    test("Test get all comments after adding", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/comments')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    }));
    test("Test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/comments/' + commentId)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body.comment).toBe(testComment.comment);
        expect(response.body.postId).toBe(testComment.postId);
        expect(response.body.owner).toBe(testComment.owner);
    }));
    test("Test get comment by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/comments?owner=' + testComment.owner)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].owner).toBe(testComment.owner);
    }));
    // Add these tests after "Test get comment by owner" and before "Test update comment":
    test("Test get comment with invalid commentId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/comments/zxdcui34589gbbnm9gh')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(400);
    }));
    test("Test get non-existent comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/comments/' + new mongoose_1.default.Types.ObjectId())
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(404);
    }));
    test("Test update comment with invalid postId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put('/comments/a3s4d56g8b90j9hgf6ds4')
            .set('authorization', "JWT " + testUser.accessToken)
            .send(testComment);
        expect(response.statusCode).toBe(400);
    }));
    test("Test update comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put('/comments/' + commentId)
            .set('authorization', "JWT " + testUser.accessToken)
            .send({ comment: 'Updated Comment' });
        expect(response.statusCode).toBe(200);
        expect(response.body.comment).toBe('Updated Comment');
    }));
    test('Test delete comment', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete('/comments/' + commentId)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
    }));
    test("Test delete comment with invalid commentId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete('/comments/as45xcfg89hvc6d5sd6f7g8h')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(400);
    }));
    test('Test get comments by post ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const postId = '67d827c1ce90b48f4072c500';
        const response = yield (0, supertest_1.default)(app)
            .get(`/comments/post/${postId}`)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }));
});
//# sourceMappingURL=comments.test.js.map