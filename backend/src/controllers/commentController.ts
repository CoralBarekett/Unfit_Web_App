/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import commentModel, { IComment } from "../models/commentModel";
import postModel from "../models/postModel";
import BaseController from "./baseController";

class CommentsController extends BaseController<IComment> {
    constructor() {
        super(commentModel);
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.body.userId;
            const postId = req.body.postId;
            
            const comment = {
                content: req.body.content,
                owner: userId,
                postId: postId
            };
            
            const newComment = new this.model(comment);
            await newComment.save();
            
            // Increment comment count on the post
            await postModel.findByIdAndUpdate(
                postId, 
                { $inc: { commentCount: 1 } }
            );
            
            res.status(201).json(newComment);
        } catch (error) {
            res.status(500).json({ error: "Error creating comment" });
        }
    }
    
    async getByPostId(req: Request, res: Response): Promise<void> {
        try {
            const postId = req.params.postId;
            const comments = await this.model.find({ postId: postId })
                .sort({ createdAt: -1 });
                
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ error: "Error fetching comments" });
        }
    }
    
    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            const commentId = req.params.id;
            const userId = req.body.userId;
            
            const comment = await this.model.findById(commentId);
            
            if (!comment) {
                res.status(404).json({ error: "Comment not found" });
                return;
            }
            
            // Check if user is the owner of the comment
            if (comment.owner !== userId) {
                res.status(403).json({ error: "Not authorized to delete this comment" });
                return;
            }
            
            // Decrement comment count on the post
            await postModel.findByIdAndUpdate(
                comment.postId, 
                { $inc: { commentCount: -1 } }
            );
            
            await this.model.findByIdAndDelete(commentId);
            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Error deleting comment" });
        }
    }
}

export default new CommentsController();