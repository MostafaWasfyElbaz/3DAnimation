import { NextFunction, Request, Response } from "express";
import { validationError } from "../utils/Error";
import { z } from "zod";

export const validationMiddleware = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = {
      ...req.body,
      ...req.query,
      ...req.params,
      ...req.file,
      files: req.files,
    };
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors: string[] = result.error.issues.map((error) => {
        return `${error.path} ==> ${error.message}`;
      });
      throw new validationError(errors, 400);
    }
    next();
  };
};
