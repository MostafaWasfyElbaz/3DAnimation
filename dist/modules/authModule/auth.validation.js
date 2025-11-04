"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendUpdateEmailOtpSchema = exports.confirmEmailChangeSchema = exports.updateEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.resendEmailOtpSchema = exports.confirmEmailSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../utils");
exports.signupSchema = zod_1.z.object({
    firstName: utils_1.generalValidation.name,
    lastName: utils_1.generalValidation.name,
    email: utils_1.generalValidation.email,
    password: utils_1.generalValidation.password,
});
exports.confirmEmailSchema = zod_1.z.object({
    email: utils_1.generalValidation.email,
    otp: utils_1.generalValidation.otp,
});
exports.resendEmailOtpSchema = zod_1.z.object({
    email: utils_1.generalValidation.email,
});
exports.loginSchema = zod_1.z.object({
    email: utils_1.generalValidation.email,
    password: utils_1.generalValidation.password,
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: utils_1.generalValidation.email,
});
exports.resetPasswordSchema = zod_1.z.object({
    email: utils_1.generalValidation.email,
    otp: utils_1.generalValidation.otp,
    password: utils_1.generalValidation.password,
});
exports.updateEmailSchema = zod_1.z.object({
    email: utils_1.generalValidation.email,
});
exports.confirmEmailChangeSchema = zod_1.z.object({
    oldOtp: utils_1.generalValidation.otp,
    newOtp: utils_1.generalValidation.otp,
});
exports.resendUpdateEmailOtpSchema = zod_1.z.object({});
