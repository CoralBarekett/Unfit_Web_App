"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image file
 *     tags:
 *       - Upload
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 originalname:
 *                   type: string
 *                 mimetype:
 *                   type: string
 *                 size:
 *                   type: number
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: File upload failed
 */
// Ensure uploads directory exists
const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
console.log('Upload directory path:', uploadDir);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Get the filename from query parameter if provided
        const queryFilename = req.query.file;
        if (queryFilename) {
            cb(null, queryFilename);
        }
        else {
            // Extract extension from original filename
            const ext = file.originalname.split('.').pop() || 'jpg';
            const timestamp = Date.now();
            cb(null, `${timestamp}.${ext}`);
        }
    }
});
// Initialize multer with storage configuration
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'));
        }
    }
});
// File upload endpoint
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const baseUrl = process.env.DOMAIN_BASE || req.get('host') || 'localhost:3001';
        const protocol = req.protocol || 'http';
        const relativePath = `uploads/${req.file.filename}`;
        const fileUrl = `${protocol}://${baseUrl}/${relativePath}`;
        console.log(`File uploaded: ${fileUrl}`);
        res.status(200).json({
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map