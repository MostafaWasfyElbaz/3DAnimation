"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectFriendRequestSchema = exports.blockUserSchema = exports.unfriendSchema = exports.deleteFriendRequestSchema = exports.acceptFriendRequestSchema = exports.sendFriendRequestSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../utils");
exports.sendFriendRequestSchema = zod_1.z.object({
    to: utils_1.generalValidation.to,
});
exports.acceptFriendRequestSchema = zod_1.z.object({
    from: utils_1.generalValidation.from,
});
exports.deleteFriendRequestSchema = zod_1.z.object({
    to: utils_1.generalValidation.to,
});
exports.unfriendSchema = zod_1.z.object({
    friendId: utils_1.generalValidation.to,
});
exports.blockUserSchema = zod_1.z.object({
    to: utils_1.generalValidation.to,
});
exports.rejectFriendRequestSchema = zod_1.z.object({
    from: utils_1.generalValidation.from,
});
