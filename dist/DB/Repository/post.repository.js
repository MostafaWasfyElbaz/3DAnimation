"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_repository_1 = __importDefault(require("./db.repository"));
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
const post_model_1 = require("../models/post.model");
const user_repository_1 = __importDefault(require("./user.repository"));
const comment_repository_1 = __importDefault(require("./comment.repository"));
const post_model_2 = require("../models/post.model");
class PostRepository extends db_repository_1.default {
    model;
    userRepository;
    commentRepository;
    constructor(model = post_model_1.Post, userRepository = new user_repository_1.default(), commentRepository = new comment_repository_1.default()) {
        super(model);
        this.model = model;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }
    checkTags = async (tags) => {
        const users = await this.userRepository.find({
            filter: {
                _id: { $in: tags },
                paranoid: true,
            },
            projection: { _id: 1 },
        });
        if (!users) {
            throw new utils_1.notFoundError();
        }
        if (users.length !== tags.length) {
            const tags = users.map((tag) => tag._id.toString());
            const invalidTags = tags.filter((tag) => !tags.includes(tag));
            throw new utils_1.invalidTagsError(invalidTags);
        }
    };
    findPost = async (postId, user) => {
        const post = await this.findOne({
            filter: {
                _id: postId,
                $or: (0, post_model_2.availabilityFilter)(user),
                paranoid: true,
            },
        }).then((post) => {
            if (!post) {
                throw new utils_1.notFoundError();
            }
            post.populate("comments");
            return post;
        });
        const createdBy = await this.userRepository.findOne({
            filter: {
                paranoid: true,
                _id: post.createdBy,
            },
        });
        if (!createdBy) {
            throw new utils_1.notFoundError();
        }
        if (createdBy.blockList && createdBy.blockList.includes(user._id)) {
            throw new utils_1.notFoundError();
        }
        return post;
    };
    findMyPost = async (postId, user, paranoid = true) => {
        const post = await this.findOne({
            filter: {
                _id: postId,
                createdBy: user._id,
                paranoid,
            },
        }).then((post) => {
            if (!post) {
                throw new utils_1.notFoundError();
            }
            post.populate("comments");
            return post;
        });
        return post;
    };
    likeUnlikePost = async ({ postId, action, user, }) => {
        const post = await this.findPost(postId, user);
        if (!post) {
            throw new utils_1.notFoundError();
        }
        if (action === "like") {
            await post.updateOne({
                $addToSet: {
                    likes: user._id,
                },
            });
        }
        else if (action === "unlike") {
            await post.updateOne({
                $pull: {
                    likes: user._id,
                },
            });
        }
        else {
            throw new utils_1.notFoundError();
        }
        return post;
    };
    findMyPostAndFreezeUnfreezeDelete = async ({ postId, user, data, paranoid = false, action, }) => {
        const post = await this.findMyPost(postId, user, paranoid);
        if (action === "freeze" || action === "active") {
            if (data) {
                await post.updateOne({
                    $set: data,
                });
            }
            await this.commentRepository.updateMany({
                filter: {
                    postId,
                    createdBy: user._id,
                },
                data: data,
            });
        }
        else if (action === "delete") {
            await post.deleteOne();
            await this.commentRepository.deleteMany({
                filter: {
                    postId,
                    createdBy: user._id,
                },
            });
        }
        else {
            throw new utils_1.notFoundError();
        }
        return post;
    };
    updatePost = async ({ post, data, }) => {
        if (data.newTags?.length) {
            try {
                await this.checkTags(data.newTags);
            }
            catch (error) {
                throw error;
            }
        }
        post.updateOne({
            $set: {
                content: data.content || post.content,
                availability: data.availability || post.availability,
                allowComments: data.allowComments || post.allowComments,
                attachments: {
                    $setUnion: [
                        {
                            $setDifference: ["$attachments", data.removedAttachments || []],
                        },
                        data.attachmentsLink || [],
                    ],
                },
                tags: {
                    $setUnion: [
                        {
                            $setDifference: ["$tags", data.removedTags || []],
                        },
                        data.newTags?.map((tag) => {
                            return new mongoose_1.Types.ObjectId(tag);
                        }) || [],
                    ],
                },
            },
        });
        return post;
    };
}
exports.default = PostRepository;
