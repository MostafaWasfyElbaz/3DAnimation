import { z } from "zod";
import { Gender } from "../../common";

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(15, "Name must be at most 15 characters long"),
    lastName: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(15, "Name must be at most 15 characters long"),
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    phone: z
      .string()
      .min(11, "Phone number must be at least 11 characters long")
      .regex(
        /^01[0-9]{9}$/,
        "Phone number must be at least 11 characters long"
      ),
    gender: z.enum(Gender).optional(),
    _2FA: z.boolean().optional().default(false),
  })
  .superRefine((arg, ctx) => {
    if (arg.password !== arg.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword", "password"],
        message: "Passwords do not match",
      });
    }
  });

export const confirmEmailSchema = z.object({
  email: z.email("Invalid email"),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
});

export const resendEmailOtpSchema = z.object({
  email: z.email("Invalid email"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email"),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const updateEmailSchema = z.object({
  email: z.email("Invalid email"),
});

export const confirmEmailChangeSchema = z.object({
  oldOtp: z.string().min(6, "OTP must be at least 6 characters long"),
  newOtp: z.string().min(6, "OTP must be at least 6 characters long"),
});

export const _2FASchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
});