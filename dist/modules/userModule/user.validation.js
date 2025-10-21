"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFriendRequestSchema = void 0;
const zod_1 = require("zod");
exports.sendFriendRequestSchema = zod_1.z.object({
    to: zod_1.z.string().length(24),
});
