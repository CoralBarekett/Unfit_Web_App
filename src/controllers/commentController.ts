import commentsModel, { IComment } from "../models/commentModel";
import BaseController from "./baseController";

const commentsController = new BaseController<IComment>(commentsModel);


export default commentsController