"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../../common");
const user_model_1 = require("./user.model");
const utils_1 = require("../../utils");
const commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deletedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    tags: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    deletedAt: Date,
    isDeleted: Boolean,
}, {
    timestamps: true,
    strictQuery: true,
});
commentSchema.pre("save", async function (next) {
    if (this.isDirectModified("tags")) {
        const userIds = this.tags?.map((tag) => tag.toString());
        const users = await user_model_1.User.find({
            _id: { $in: userIds },
        }, { email: 1, _id: 0 });
        users.map((user) => utils_1.emailEmitter.publish(common_1.Events.general, {
            to: user.email,
            subject: "Taged",
            html: "",
        }));
    }
    next();
});
commentSchema.pre(["find", "findOne"], async function (next) {
    if (!this.getFilter().paranoid) {
        this.setQuery({ ...this.getQuery() });
        next();
    }
    this.setQuery({ ...this.getQuery(), isDeleted: { $exists: false } });
    next();
});
exports.Comment = (0, mongoose_1.model)("Comment", commentSchema);
