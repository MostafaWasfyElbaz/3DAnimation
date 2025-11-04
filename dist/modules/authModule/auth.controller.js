"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const middleware_1 = require("../../middleware");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
const authServices = new auth_service_1.default();
const routes = {
    signup: "/signup",
    login: "/login",
    refreshToken: "/refresh-token",
    confirmEmail: "/confirm-email",
    resendEmailOtp: "/resend-email-otp",
    resendUpdateEmailOtp: "/resend-update-email-otp",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    updateEmail: "/update-email",
    confirmEmailChange: "/confirm-email-change",
};
router.post(routes.signup, (0, middleware_1.validationMiddleware)(auth_validation_1.signupSchema), authServices.signup);
router.post(routes.login, (0, middleware_1.validationMiddleware)(auth_validation_1.loginSchema), authServices.login);
router.post(routes.refreshToken, authServices.refreshToken);
router.patch(routes.confirmEmail, (0, middleware_1.validationMiddleware)(auth_validation_1.confirmEmailSchema), authServices.confirmEmail);
router.patch(routes.resendEmailOtp, (0, middleware_1.validationMiddleware)(auth_validation_1.resendEmailOtpSchema), authServices.resendEmailOtp);
router.patch(routes.resendUpdateEmailOtp, (0, middleware_1.validationMiddleware)(auth_validation_1.resendUpdateEmailOtpSchema), authServices.resendUpdateEmailOtp);
router.patch(routes.forgotPassword, (0, middleware_1.validationMiddleware)(auth_validation_1.forgotPasswordSchema), authServices.forgotPassword);
router.patch(routes.resetPassword, (0, middleware_1.validationMiddleware)(auth_validation_1.resetPasswordSchema), authServices.resetPassword);
router.patch(routes.updateEmail, (0, middleware_1.auth)(), (0, middleware_1.validationMiddleware)(auth_validation_1.updateEmailSchema), authServices.updateEmail);
router.patch(routes.confirmEmailChange, (0, middleware_1.auth)(), (0, middleware_1.validationMiddleware)(auth_validation_1.confirmEmailChangeSchema), authServices.confirmEmailChange);
exports.default = router;
