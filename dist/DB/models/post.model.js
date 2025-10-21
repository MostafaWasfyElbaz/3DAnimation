"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.availabilityFilter = void 0;
const common_1 = require("../../common");
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
const user_model_1 = require("./user.model");
const availabilityFilter = (user) => {
    return [
        {
            availability: common_1.PostAvailability.PUBLIC,
        },
        {
            availability: common_1.PostAvailability.PRIVATE,
            createdBy: user._id,
        },
        {
            availability: common_1.PostAvailability.PRIVATE,
            tags: { $in: [user._id] },
        },
        {
            availability: common_1.PostAvailability.FRIENDS,
            createdBy: { $in: [...user.friends, user._id] },
        },
    ];
};
exports.availabilityFilter = availabilityFilter;
const postSchema = new mongoose_1.Schema({
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
    },
    attachments: {
        type: [String],
    },
    tags: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
    },
    likes: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
    },
    allowComments: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
    },
    deletedAt: {
        type: Date,
    },
    deletedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    assetsFolderId: {
        type: String,
    },
    availability: {
        type: String,
        enum: [
            common_1.PostAvailability.FRIENDS,
            common_1.PostAvailability.PRIVATE,
            common_1.PostAvailability.PUBLIC,
        ],
        default: common_1.PostAvailability.PUBLIC,
    },
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
});
postSchema.pre("save", async function (next) {
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
postSchema.pre(["find", "findOne"], async function (next) {
    if (!this.getFilter().paranoid) {
        this.setQuery({ ...this.getQuery() });
        next();
    }
    this.setQuery({ ...this.getQuery(), isDeleted: { $exists: false } });
    next();
});
exports.Post = (0, mongoose_1.model)("Post", postSchema);
