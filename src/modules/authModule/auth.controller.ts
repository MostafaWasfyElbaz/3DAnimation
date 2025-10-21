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
  resendPasswordOtpSchema,
  _2FASchema,
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
  resendPasswordOtp: "/resend-password-otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  updateEmail: "/update-email",
  confirmEmailChange: "/confirm-email-change",
  _2FA: "/2fa",
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

router.post(
  routes._2FA,
  auth({ tokenType: TokenType.temp }),
  validationMiddleware(_2FASchema),
  authServices._2FA
);

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
  routes.resendPasswordOtp,
  validationMiddleware(resendPasswordOtpSchema),
  authServices.resendPasswordOtp
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
