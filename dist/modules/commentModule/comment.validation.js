"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.checkPostIdSchema = exports.createCommentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createCommentSchema = zod_1.default.object({
    content: zod_1.default.string().min(1).max(1000),
    postId: zod_1.default.string().length(24),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
});
exports.checkPostIdSchema = zod_1.default.object({
    postId: zod_1.default.string().length(24),
});
exports.updateCommentSchema = zod_1.default.object({
    commentId: zod_1.default.string().length(24),
    content: zod_1.default.string().min(1).max(1000),
    newTags: zod_1.default.array(zod_1.default.string()).optional(),
    removedTags: zod_1.default.array(zod_1.default.string()).optional(),
});
