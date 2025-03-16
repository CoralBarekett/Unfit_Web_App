/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import postModel, { IPost } from "../models/postModel";
import BaseController from "./baseController";

class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }

    async create(req: Request, res: Response): Promise<void> {
        const userId = req.body.userId;
        
        // Map imageUrl to image if needed
        const imageField = req.body.imageUrl ? { image: req.body.imageUrl } : {};
        
        const post = {
            ...req.body,
            owner: userId,
            likes: [],
            commentCount: 0,
            ...imageField // Add the image field if imageUrl exists
        };
        
        req.body = post;
        try {
            await super.create(req, res);
        } catch (error) {
            res.status(500).json({ error: "Error creating post" });
        }
    }
    
    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.body.userId;
            const postId = req.params.id;
            
            // Find post to verify ownership
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            
            // Check if user owns this post
            if (post.owner !== userId) {
                res.status(403).json({ error: "Not authorized to update this post" });
                return;
            }
            
            // Map imageUrl to image if needed
            if (req.body.imageUrl) {
                req.body.image = req.body.imageUrl;
                delete req.body.imageUrl;
            }
            
            await super.update(req, res);
        } catch (error) {
            res.status(500).json({ error: "Error updating post" });
        }
    }
    
    // Get posts by current user
    async getMyPosts(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.body.userId;
            const posts = await this.model.find({ owner: userId });
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: "Error fetching posts" });
        }
    }

    // Get all posts with pagination
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;
            
            const posts = await this.model.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
                
            const total = await this.model.countDocuments();
            const totalPages = Math.ceil(total / limit);
            
            res.status(200).json({
                posts,
                totalPages,
                currentPage: page,
                totalPosts: total
            });
        } catch (error) {
            res.status(500).json({ error: "Error fetching posts" });
        }
    }

    // Like/Unlike a post
    async toggleLike(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.body.userId;
            const postId = req.params.id;
            
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            
            const likeIndex = post.likes.indexOf(userId);
            
            if (likeIndex === -1) {
                // Add like
                post.likes.push(userId);
            } else {
                // Remove like
                post.likes.splice(likeIndex, 1);
            }
            
            await post.save();
            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({ error: "Error toggling like" });
        }
    }}

export default new PostsController();