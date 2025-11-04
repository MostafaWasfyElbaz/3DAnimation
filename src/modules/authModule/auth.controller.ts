import { Router } from "express";
import AuthServices from "./auth.service";
import { validationMiddleware, auth } from "../../middleware";
import {
  confirmEmailSchema,
  resendEmailOtpSchema,
  signupSchema,
  loginSchema,
  resetPasswordSchema,
  confirmEmailChangeSchema,
  updateEmailSchema,
  forgotPasswordSchema,
  resendUpdateEmailOtpSchema,
} from "./auth.validation";
import { IAuthServices, TokenType } from "../../common";
const router = Router();

const authServices: IAuthServices = new AuthServices();
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

router.post(
  routes.signup,
  validationMiddleware(signupSchema),
  authServices.signup
);
router.post(
  routes.login,
  validationMiddleware(loginSchema),
  authServices.login
);
router.post(routes.refreshToken, authServices.refreshToken);

router.patch(
  routes.confirmEmail,
  validationMiddleware(confirmEmailSchema),
  authServices.confirmEmail
);
router.patch(
  routes.resendEmailOtp,
  validationMiddleware(resendEmailOtpSchema),
  authServices.resendEmailOtp
);
router.patch(
  routes.resendUpdateEmailOtp,
  validationMiddleware(resendUpdateEmailOtpSchema),
  authServices.resendUpdateEmailOtp
);
router.patch(
  routes.forgotPassword,
  validationMiddleware(forgotPasswordSchema),
  authServices.forgotPassword
);
router.patch(
  routes.resetPassword,
  validationMiddleware(resetPasswordSchema),
  authServices.resetPassword
);
router.patch(
  routes.updateEmail,
  auth(),
  validationMiddleware(updateEmailSchema),
  authServices.updateEmail
);
router.patch(
  routes.confirmEmailChange,
  auth(),
  validationMiddleware(confirmEmailChangeSchema),
  authServices.confirmEmailChange
);
export default router;
