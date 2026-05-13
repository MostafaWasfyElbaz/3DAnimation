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
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path
          .map((p) => (typeof p === "number" ? `[${p}]` : p))
          .join(".");

        formattedErrors[path] = path + ": " + issue.message;
      });
      return next(new validationError(Object.values(formattedErrors), 400));
    }
    next();
  };
};
