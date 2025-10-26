"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const post_repository_1 = __importDefault(require("../../DB/Repository/post.repository"));
const comment_repository_1 = __importDefault(require("../../DB/Repository/comment.repository"));
const utils_1 = require("../../utils");
const nanoid_1 = require("nanoid");
class PostServices {
    postRepository;
    commentRepository;
    s3Services;
    constructor(postRepository = new post_repository_1.default(), commentRepository = new comment_repository_1.default(), s3Services = new utils_1.S3Services()) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.s3Services = s3Services;
    }
    createPost = async (req, res, next) => {
        const files = req.files;
        const assetsFolderId = (0, nanoid_1.nanoid)(15);
        const path = `${res.locals.user._id}/posts/${assetsFolderId}`;
        let uploadedFiles = [];
        if (req.body.tags?.length) {
            if (req.body.tags.includes(res.locals.user._id.toString())) {
                throw new utils_1.invalidTagsError([
                    `${res.locals.user._id.toString()} yourself`,
                ]);
            }
            try {
                await this.postRepository.checkTags(req.body.tags);
            }
            catch (error) {
                throw error;
            }
        }
        if (files?.length > 0) {
            try {
                uploadedFiles = await this.s3Services.uploadMultiFiles({
                    files,
                    Path: path,
                });
            }
            catch (error) {
                throw error;
            }
            if (uploadedFiles?.length != files.length) {
                throw new utils_1.failedToUpload();
            }
        }
        try {
            const post = await this.postRepository.create({
                data: {
                    ...req.body,
                    attachments: uploadedFiles,
                    assetsFolderId,
                    createdBy: res.locals.user._id,
                },
            });
            if (!post) {
                throw new utils_1.faildToCreatePost();
            }
            return (0, utils_1.successHandler)({
                res,
                msg: "Post created successfully",
                status: 201,
            });
        }
        catch (error) {
            throw error;
        }
    };
    likeUnlikePost = async (req, res, next) => {
        const { postId, action } = req.body;
        const user = res.locals.user;
        try {
            const post = await this.postRepository.likeUnlikePost({
                postId,
                action,
                user,
            });
            return (0, utils_1.successHandler)({
                res,
                data: post,
                msg: action === "like"
                    ? "Post liked successfully"
                    : "Post unliked successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    getPostById = async (req, res, next) => {
        const { postId } = req.params;
        try {
            const post = await this.postRepository.findPost(postId, res.locals.user);
            return (0, utils_1.successHandler)({
                res,
                data: post,
                msg: "Post fetched successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    freezePost = async (req, res, next) => {
        const { postId } = req.params;
        const user = res.locals.user;
        try {
            await this.postRepository.findMyPostAndFreezeUnfreezeDelete({
                postId: postId,
                user,
                data: { isDeleted: true, deletedAt: new Date(), deletedBy: user._id },
                action: "freeze",
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "Post frozen successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    activatePost = async (req, res, next) => {
        const { postId } = req.params;
        const user = res.locals.user;
        try {
            await this.postRepository.findMyPostAndFreezeUnfreezeDelete({
                postId: postId,
                user,
                data: {
                    isDeleted: false,
                    deletedAt: undefined,
                    deletedBy: undefined,
                },
                paranoid: false,
                action: "active",
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "Post activated successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    deletePost = async (req, res, next) => {
        const { postId } = req.params;
        const user = res.locals.user;
        let post;
        try {
            post = await this.postRepository.findMyPostAndFreezeUnfreezeDelete({
                postId: postId,
                user,
                action: "delete",
            });
        }
        catch (error) {
            throw error;
        }
        if (post.attachments?.length) {
            try {
                this.s3Services.deleteAssets({ urls: post.attachments });
            }
            catch (error) {
                throw error;
            }
        }
        return (0, utils_1.successHandler)({
            res,
            data: post,
            msg: "Post deleted successfully",
            status: 200,
        });
    };
    updatePost = async (req, res, next) => {
        const user = res.locals.user;
        const { content, availability, allowComments, removedAttachments = [], removedTags = [], newTags = [], } = req.body;
        const postId = req.params.postId;
        const newAttachments = req.files || [];
        let attachmentsLink = [];
        let post;
        let updatedPost;
        try {
            post = await this.postRepository.findMyPost(postId, user);
        }
        catch (error) {
            throw error;
        }
        if (!post) {
            throw new utils_1.notFoundError();
        }
        if (newAttachments?.length) {
            try {
                attachmentsLink = await this.s3Services.uploadMultiFiles({
                    files: newAttachments,
                    Path: `${user._id}/posts/${post.assetsFolderId}`,
                });
            }
            catch (error) {
                throw error;
            }
        }
        if (attachmentsLink?.length !== newAttachments?.length) {
            throw new utils_1.failedToUpload();
        }
        try {
            updatedPost = await this.postRepository.updatePost({
                post,
                data: {
                    ...(content !== undefined && { content }),
                    ...(availability !== undefined && { availability }),
                    ...(allowComments !== undefined && { allowComments }),
                    removedAttachments,
                    removedTags,
                    newTags,
                    attachmentsLink,
                },
            });
        }
        catch (error) {
            throw error;
        }
        if (removedAttachments?.length) {
            try {
                this.s3Services.deleteAssets({ urls: removedAttachments });
            }
            catch (error) {
                throw error;
            }
        }
        return (0, utils_1.successHandler)({
            res,
            data: updatedPost,
            msg: "Post updated successfully",
            status: 200,
        });
    };
}
exports.PostServices = PostServices;
