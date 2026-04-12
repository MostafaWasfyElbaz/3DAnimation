import express from "express";
import dotenv from "dotenv";
import path from "path";
import baseRouter from "./routes";
import { IError } from "./common/index";
import { NextFunction, Request, Response } from "express";
import { DBConnection } from "./DB/DBConnection";
import cors from "cors";
import { pageNotFoundError } from "./utils";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config({
  path: path.resolve("./src/config/.env"),
});

const app = express();
app.set("trust proxy", 1);
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bootstrap = async (): Promise<void> => {
  app.use(helmet());
  app.use(globalLimiter);
  app.use(cors());
  app.use(express.json());
  await DBConnection();
  app.use("/api/v1", baseRouter);
  app.use("/{*dummy}", (req: Request, res: Response) => {
    throw new pageNotFoundError();
  });
  app.use(
    (
      err: IError,
      req: Request,
      res: Response,
      next: NextFunction,
    ): Response => {
      return res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.statusCode || 500,
        stack: err.stack,
      });
    },
  );
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
