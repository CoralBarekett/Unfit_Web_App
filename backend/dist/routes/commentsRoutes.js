"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const commentController_1 = __importDefault(require("../controllers/commentController"));
const authController_1 = require("../controllers/authController");
/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by its ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 content:
 *                   type: string
 *                 author:
 *                   type: string
 *       404:
 *         description: Comment not found
 */
/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags:
 *       - Comments
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author:
 *                     type: string
 */
/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 content:
 *                   type: string
 *                 author:
 *                   type: string
 */
/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */
/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     summary: Get comments by post ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to get comments for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author:
 *                     type: string
 */
router.get('/:id', commentController_1.default.getById.bind(commentController_1.default));
router.get('/', commentController_1.default.getAll.bind(commentController_1.default));
router.post('/', authController_1.authMiddleware, commentController_1.default.create.bind(commentController_1.default));
router.delete('/:id', authController_1.authMiddleware, commentController_1.default.deleteItem.bind(commentController_1.default));
router.put('/:id', authController_1.authMiddleware, commentController_1.default.update.bind(commentController_1.default));
router.get('/post/:postId', commentController_1.default.getByPostId.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentsRoutes.js.map