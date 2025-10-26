"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.checkPostIdSchema = exports.likeUnlikePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../utils");
exports.createPostSchema = zod_1.z
    .object({
    content: utils_1.generalValidation.content,
    files: utils_1.generalValidation.files({}),
    tags: utils_1.generalValidation.tags,
    allowComments: utils_1.generalValidation.allowComments,
    availability: utils_1.generalValidation.availability,
})
    .superRefine((data, ctx) => {
    if (!data.content && (!data.files || data.files.length <= 0)) {
        ctx.addIssue({
            code: "custom",
            message: "Content is required",
            path: ["content", "files"],
        });
    }
});
exports.likeUnlikePostSchema = zod_1.z.object({
    postId: zod_1.z.string().length(24),
    action: zod_1.z.enum(["like", "unlike"]),
});
exports.checkPostIdSchema = zod_1.z.object({
    postId: zod_1.z.string().length(24),
});
exports.updatePostSchema = zod_1.z.object({
    postId: zod_1.z.string().length(24),
    content: utils_1.generalValidation.content,
    files: utils_1.generalValidation.files({}),
    tags: utils_1.generalValidation.tags,
    allowComments: utils_1.generalValidation.allowComments,
    availability: utils_1.generalValidation.availability,
    removedAttachments: zod_1.z.array(zod_1.z.string().length(24)),
    removedTags: zod_1.z.array(zod_1.z.string().length(24)),
    newTags: zod_1.z.array(zod_1.z.string().length(24)),
});
