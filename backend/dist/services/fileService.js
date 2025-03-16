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
const apiService_1 = __importDefault(require("./apiService"));
const uploadImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    try {
        // Make sure this endpoint matches your backend route for file uploads
        const response = yield apiService_1.default.post('/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.imageUrl;
    }
    catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
});
const fileService = {
    uploadImage,
};
exports.default = fileService;
//# sourceMappingURL=fileService.js.map