"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create upload directory if it doesn't exist
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use the filename from the query parameter if provided
        const filename = req.query.file || `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});
// File filter to only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});
const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        // Create URL for the uploaded file
        const fileUrl = `/uploads/${req.file.filename}`; // Make sure this matches the static path
        // Return success response with the file URL
        res.status(200).json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size,
        });
    }
    catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=fileController.js.map