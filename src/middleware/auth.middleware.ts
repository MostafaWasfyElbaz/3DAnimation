import {
  verifyToken,
  invalidCredentialsError,
  notFoundError,
  userNotConfirmedError,
} from "../utils/index";
import { IUser, TokenType, IPayload } from "../common/index";
import  UserRepository from "../DB/Repository/user.repository";
import { Request, Response, NextFunction } from "express";
import { HydratedDocument } from "mongoose";

const userModel = new UserRepository();

export const decodeToken = async ({
  authorization,
  tokenType = TokenType.access,
}: {
  authorization: string;
  tokenType?: TokenType;
}): Promise<{ user: HydratedDocument<IUser>; decodedToken: IPayload }> => {
  try {
    if (!authorization) {
      throw new invalidCredentialsError();
    }
    if (!authorization.startsWith(`${process.env.BEARER_KEY}`)) {
      throw new invalidCredentialsError();
    }
    const token = authorization.split(` `)[1];
    if (!token) {
      throw new invalidCredentialsError();
    }
    let secret;
    if(tokenType == TokenType.access){
      secret = process.env.ACCESS_SIGNITURE as string;
    }else if(tokenType == TokenType.refresh){
      secret = process.env.REFRESH_SIGNITURE as string;
    }else if(tokenType == TokenType.temp){
      secret = process.env.TEMP_SIGNITURE as string;
    }else{
      throw new invalidCredentialsError();
    }
    const decodedToken = verifyToken({
      token,
      secret
    });
    if (!decodedToken) {
      throw new invalidCredentialsError();
    }
    const user = await userModel.findById({ id: decodedToken.id });
    if (!user) {
      throw new invalidCredentialsError();
    }
    if (!user.isConfirmed) {
      throw new userNotConfirmedError();
    }
    if (
      user.changedCredentialsAt &&
      user.changedCredentialsAt.getTime() >= decodedToken.iat * 1000
    ) {
      throw new invalidCredentialsError();
    }
    return { user, decodedToken };
  } catch (error) {
    throw error;
  }
};

export const auth = ({
  tokenType = TokenType.access,
}: { tokenType?: TokenType } = {}) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { user }: { user: HydratedDocument<IUser> } = await decodeToken({
        authorization: req.headers.authorization as string,
        tokenType,
      });
      res.locals.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
