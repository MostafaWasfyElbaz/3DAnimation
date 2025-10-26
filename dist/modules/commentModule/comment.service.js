"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const utils_1 = require("../../utils");
const comment_repository_1 = __importDefault(require("../../DB/Repository/comment.repository"));
class CommentService {
    commentRepo;
    constructor(commentRepo = new comment_repository_1.default()) {
        this.commentRepo = commentRepo;
    }
    createComment = async (req, res, next) => {
        const { content, postId, tags } = req.body;
        const user = res.locals.user;
        try {
            const comment = await this.commentRepo.createComment({
                content,
                postId,
                tags,
                user,
            });
            if (!comment) {
                throw new utils_1.failedToCreateComment();
            }
            return (0, utils_1.successHandler)({
                res,
                data: comment,
                msg: "Comment created successfully",
                status: 201,
            });
        }
        catch (error) {
            throw error;
        }
    };
    getCommentById = async (req, res, next) => {
        const { commentId } = req.params;
        const user = res.locals.user;
        const comment = await this.commentRepo.findComment(commentId, user, "all");
        if (!comment) {
            throw new utils_1.notFoundError();
        }
        return (0, utils_1.successHandler)({
            res,
            data: comment,
            msg: "Comment fetched successfully",
            status: 200,
        });
    };
    freezeComment = async (req, res, next) => {
        const user = res.locals.user;
        const { commentId } = req.params;
        try {
            const comment = await this.commentRepo.findCommentAndFreezeUnfreezeDelete({
                commentId,
                user,
                data: { isDeleted: true, deletedAt: new Date(), deletedBy: user._id },
                action: "freeze",
            });
            return (0, utils_1.successHandler)({
                res,
                data: comment,
                msg: "Comment frozen successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    activateComment = async (req, res, next) => {
        const user = res.locals.user;
        const { commentId } = req.params;
        try {
            const comment = await this.commentRepo.findCommentAndFreezeUnfreezeDelete({
                commentId,
                user,
                data: {
                    isDeleted: false,
                    deletedAt: undefined,
                    deletedBy: undefined,
                },
                action: "active",
            });
            return (0, utils_1.successHandler)({
                res,
                data: comment,
                msg: "Comment activated successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    deleteComment = async (req, res, next) => {
        const user = res.locals.user;
        const { commentId } = req.params;
        try {
            const comment = await this.commentRepo.findCommentAndFreezeUnfreezeDelete({
                commentId,
                user,
                action: "delete",
                data: {}
            });
            return (0, utils_1.successHandler)({
                res,
                data: comment,
                msg: "Comment deleted successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    updateComment = async (req, res, next) => {
        const user = res.locals.user;
        const { commentId } = req.params;
        const { content, newTags, removedTags } = req.body;
        try {
            const comment = await this.commentRepo.updateComment({
                commentId,
                user,
                data: { content, newTags, removedTags },
            });
            return (0, utils_1.successHandler)({
                res,
                data: comment,
                msg: "Comment updated successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
}
exports.CommentService = CommentService;
