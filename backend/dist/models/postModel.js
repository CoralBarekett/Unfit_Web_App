"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    likes: {
        type: [String],
        default: [],
    },
    commentCount: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });
const postModel = mongoose_1.default.model("Posts", postSchema);
exports.default = postModel;
//# sourceMappingURL=postModel.js.map