import { z } from "zod";
import { generalValidation } from "../../utils";

export const signupSchema = z.object({
  firstName: generalValidation.name,
  lastName: generalValidation.name,
  email: generalValidation.email,
  password: generalValidation.password,
});

export const confirmEmailSchema = z.object({
  email: generalValidation.email,
  otp: generalValidation.otp,
});

export const resendEmailOtpSchema = z.object({
  email: generalValidation.email,
});

export const loginSchema = z.object({
  email: generalValidation.email,
  password: generalValidation.password,
});

export const forgotPasswordSchema = z.object({
  email: generalValidation.email,
});

export const resetPasswordSchema = z.object({
  email: generalValidation.email,
  otp: generalValidation.otp,
  password: generalValidation.password,
});

export const updateEmailSchema = z.object({
  email: generalValidation.email,
});

export const confirmEmailChangeSchema = z.object({
  oldOtp: generalValidation.otp,
  newOtp: generalValidation.otp,
});

export const resendUpdateEmailOtpSchema = z.object({});

