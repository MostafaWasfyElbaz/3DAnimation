"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidation = void 0;
const zod_1 = __importDefault(require("zod"));
exports.generalValidation = {
    name: zod_1.default
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(15, "Name must be at most 15 characters long"),
    email: zod_1.default.email("Invalid email"),
    password: zod_1.default.string().min(8, "Password must be at least 8 characters long"),
    _2FA: zod_1.default.boolean().optional().default(false),
    otp: zod_1.default.string().min(6, "OTP must be at least 6 characters long"),
};
