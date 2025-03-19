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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Before all tests');
    app = yield (0, server_1.default)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('After all tests');
    yield mongoose_1.default.connection.close();
}));
describe("Upload Route Tests", () => {
    test("Should return 400 if no file is uploaded", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/api/upload')
            .set('Content-Type', 'multipart/form-data');
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('No file uploaded');
    }));
    test("Should upload an image successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const testImagePath = path_1.default.join(__dirname, 'test-image.jpg');
        // Create a dummy image file for testing
        fs_1.default.writeFileSync(testImagePath, Buffer.alloc(100));
        const response = yield (0, supertest_1.default)(app)
            .post('/api/upload')
            .attach('file', testImagePath)
            .set('Content-Type', 'multipart/form-data');
        console.log('Upload response:', response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('url');
        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('mimetype');
        expect(response.body).toHaveProperty('size');
        // Cleanup test file
        fs_1.default.unlinkSync(testImagePath);
    }));
    test("Should reject invalid file types", () => __awaiter(void 0, void 0, void 0, function* () {
        const testFilePath = path_1.default.join(__dirname, 'test.txt');
        fs_1.default.writeFileSync(testFilePath, 'This is a test file');
        const response = yield (0, supertest_1.default)(app)
            .post('/api/upload')
            .attach('file', testFilePath)
            .set('Content-Type', 'multipart/form-data');
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toContain('Invalid file type');
        // Cleanup test file
        fs_1.default.unlinkSync(testFilePath);
    }));
});
//# sourceMappingURL=file.test.js.map