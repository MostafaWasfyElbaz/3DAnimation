import z from "zod";
import { Images } from "../common";

export const generalValidation = {
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(15, "Name must be at most 15 characters long"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  _2FA: z.boolean().optional().default(false),
  otp: z.string().min(6, "OTP must be at least 6 characters long"),
  files: ({
    Types = Object.values(Images),
    fieldName,
  }: {
    Types?: string[];
    fieldName?: string;
  }) => {
    return z
      .array(
        z.object({
          fieldname: z.string().refine((v) => v === fieldName, {
            message: `Invalid field name. Expected "${fieldName}"`,
          }),
          originalname: z.string({
            message: "Original file name is required",
          }),
          encoding: z.string({
            message: "File encoding is required",
          }),
          mimetype: z.string().refine((v) => Types.includes(v), {
            message: `Invalid file type. Allowed types: ${Types.join(", ")}`,
          }),
          buffer: z.instanceof(Buffer, {
            message: "File buffer is missing or invalid",
          }),
          size: z.number().max(50 * 1024 * 1024, {
            message: "File size must be less than 50MB",
          }),
        }),
      )
      .min(1, `At least one file is required`);
  },
  id: z.string().length(24, "Invalid ID format"),
  ContentType: z.enum(Images),
  Originalname: z.string(),
  uuid: z.uuid(),
};
