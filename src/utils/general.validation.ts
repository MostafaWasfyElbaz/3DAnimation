import z from "zod";
import { MimeType } from "./";
import { ModelMimeType } from "../common";

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
    Types = MimeType.model,
    fieldName = "models",
  }: {
    Types?: string[];
    fieldName?: string;
  }) => {
    return z
      .array(
        z.object({
          fieldname: z.enum([fieldName]),
          originalname: z.string(),
          encoding: z.string(),
          mimetype: z.enum(Types),
          buffer: z.any().optional(),
          path: z.string().optional(),
          size: z.number(),
        })
      )
      .optional();
  },
  ContentType: z.enum(ModelMimeType),
  Originalname: z.string(),
};
