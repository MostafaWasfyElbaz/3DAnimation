"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const db_repository_1 = __importDefault(require("./db.repository"));
const utils_1 = require("../../utils");
const comment_model_1 = require("../models/comment.model");
class CommentRepository extends db_repository_1.default {
    model;
    constructor(model = comment_model_1.Comment) {
        super(model);
        this.model = model;
    }
    async getPostRepo() {
        const { default: PostRepository } = await Promise.resolve().then(() => __importStar(require("./post.repository.js")));
        return new PostRepository();
    }
    createComment = async ({ content, postId, tags, user, }) => {
        const postRepo = await this.getPostRepo();
        const post = await postRepo.findPost(postId, user);
        if (!post) {
            throw new utils_1.notFoundError();
        }
        if (!post.allowComments) {
            throw new utils_1.notFoundError();
        }
        if (tags) {
            await postRepo.checkTags(tags);
        }
        return await this.create({
            data: [
                {
                    content,
                    postId,
                    tags,
                    createdBy: user._id,
                },
            ],
        });
    };
    findComment = async (commentId, user, type = "my") => {
        const postRepo = await this.getPostRepo();
        const comment = await this.findOne({
            filter: {
                _id: commentId,
                ...(type === "my" ? { createdBy: user._id } : {}),
            },
        });
        if (!comment) {
            throw new utils_1.notFoundError();
        }
        const post = await postRepo.findPost(comment.postId, user);
        if (!post) {
            throw new utils_1.notFoundError();
        }
        return comment;
    };
    findCommentAndFreezeUnfreezeDelete = async ({ commentId, user, data, action, }) => {
        const comment = await this.findComment(commentId, user);
        if (action === "freeze" || action === "active") {
            await comment.updateOne({
                $set: data,
            });
        }
        else if (action === "delete") {
            await comment.deleteOne();
        }
        else {
            throw new utils_1.notFoundError();
        }
        return comment;
    };
    updateComment = async ({ commentId, user, data, }) => {
        const postRepo = await this.getPostRepo();
        const comment = await this.findComment(commentId, user);
        if (data?.tags?.length) {
            await postRepo.checkTags(data.tags);
        }
        await comment.updateOne({
            $set: {
                content: data?.content || comment.content,
                tags: {
                    $setUnion: [
                        {
                            $setDifference: ["$tags", data?.removedTags || []],
                        },
                        data?.newTags?.map((tag) => new mongoose_1.Types.ObjectId(tag)) || [],
                    ],
                },
            },
        });
        return comment;
    };
}
exports.default = CommentRepository;
