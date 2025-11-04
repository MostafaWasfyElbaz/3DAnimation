import express from "express";
import dotenv from "dotenv";
import path from "path";
import baseRouter from "./routes";
import { IError } from "./common/index";
import { NextFunction, Request, Response } from "express";
import { DBConnection } from "./DB/DBConnection";
import cors from "cors";

dotenv.config({
  path: path.resolve("./src/config/.env"),
});

const app = express();

export const bootstrap = async (): Promise<void> => {
  app.use(cors());
  await DBConnection();
  app.use(express.json());
  app.use("/", (req: Request, res: Response) => {
    res.json({
      message: "Welcome to the API",
    });
  });
  app.use("/api/v1", baseRouter);
  app.use("/{*dummy}", (req: Request, res: Response) => {
    res.status(404).json({
      message: "Page not found",
    });
  });
  app.use(
    (
      err: IError,
      req: Request,
      res: Response,
      next: NextFunction
    ): Response => {
      return res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.statusCode || 500,
        stack: err.stack,
      });
    }
  );
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`);
  });
};
