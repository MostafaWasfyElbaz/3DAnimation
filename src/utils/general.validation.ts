import z from "zod";

export const generalValidation = {
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(15, "Name must be at most 15 characters long"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  _2FA: z.boolean().optional().default(false),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
};
