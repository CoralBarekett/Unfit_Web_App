import { Request, Response } from "express";
import postModel, { IPost } from "../models/postModel";
import BaseController from "./baseController";

class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }

    async create(req: Request, res: Response): Promise<void> {
        const userId = req.body.userId;
        const post = {
            ...req.body,
            owner: userId,
        };
        req.body = post;
        super.create(req, res);
    }
}

export default new PostsController();