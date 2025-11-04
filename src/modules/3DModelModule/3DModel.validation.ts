import z from "zod";
import { generalValidation } from "../../utils";

export const uploadModelSchema = z.object({
  ContentType: generalValidation.ContentType,
  Originalname: generalValidation.Originalname,
});
