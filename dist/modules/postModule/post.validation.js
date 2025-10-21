"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.checkPostIdSchema = exports.likeUnlikePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
const general_validation_1 = require("../../utils/general.validation");
exports.createPostSchema = zod_1.z
    .object({
    content: general_validation_1.generalValidation.content,
    files: general_validation_1.generalValidation.files({}),
    tags: general_validation_1.generalValidation.tags,
    allowComments: general_validation_1.generalValidation.allowComments,
    availability: general_validation_1.generalValidation.availability,
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
    content: general_validation_1.generalValidation.content,
    files: general_validation_1.generalValidation.files({}),
    tags: general_validation_1.generalValidation.tags,
    allowComments: general_validation_1.generalValidation.allowComments,
    availability: general_validation_1.generalValidation.availability,
    removedAttachments: zod_1.z.array(zod_1.z.string().length(24)),
    removedTags: zod_1.z.array(zod_1.z.string().length(24)),
    newTags: zod_1.z.array(zod_1.z.string().length(24)),
});
