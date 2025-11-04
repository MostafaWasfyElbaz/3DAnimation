import { NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../index";

export interface IAuthServices {
  signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
  confirmEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  resendEmailOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  login(req: Request, res: Response, next: NextFunction): Promise<Response>;
  refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  updateEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  confirmEmailChange(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  resendUpdateEmailOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  rateLimit(
    model: HydratedDocument<IUser>,
    schema: any
  ): Promise<void>;
}
