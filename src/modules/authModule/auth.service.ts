import { Request, Response, NextFunction } from "express";
import { IAuthServices, Events, Gender, TokenType, IUser } from "../../common";
import UserRepository from "../../DB/Repository/user.repository";
import {
  generateOTP,
  emailEmitter,
  template,
  failedToCreateUser,
  notFoundError,
  userAlreadyConfirmedError,
  otpExpiredError,
  compareHash,
  invalidCredentialsError,
  otpNotExpiredError,
  userNotConfirmedError,
  successHandler,
  generateToken,
  generateAccessToken,
  userExistError,
  tryResendOtp,
  tooManyRequestsError,
  generateTempToken,
} from "../../utils";
import {
  signupDTO,
  resendEmailOtpDTO,
  loginDTO,
  resetPasswordDTO,
  forgotPasswordDTO,
  updateEmailDTO,
  confirmEmailChangeDTO,
  _2FADTO,
} from "./auth.DTO";
import { decodeToken } from "../../middleware";
import { HydratedDocument } from "mongoose";

class AuthServices implements IAuthServices {
  constructor(private userRepo = new UserRepository()) {}

  signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        phone,
        _2FA,
      }: signupDTO = req.body;
      const user = await this.userRepo.createUser({
        user: {
          firstName,
          lastName,
          email,
          password,
          gender: gender || Gender.male,
          phone,
          _2FA,
        },
      });
      if (!user) {
        throw new failedToCreateUser();
      }
      return successHandler({
        res,
        msg: "User created successfully",
        status: 201,
      });
    } catch (error) {
      throw error;
    }
  };

  confirmEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { email, otp } = req.body;
      const user = await this.userRepo.findUserByEmail(email);
      if (!user) {
        throw new notFoundError();
      }
      if (user?.isConfirmed || !user.emailOtp) {
        throw new userAlreadyConfirmedError();
      }
      if (
        user.emailOtp.attempts?.banExp &&
        user.emailOtp.attempts.banExp.getTime() <= new Date().getTime() &&
        user.emailOtp.attempts.count >= 5
      ) {
        user.emailOtp.attempts.count = 0;
        user.emailOtp.attempts.banExp = undefined;
      }
      if (user.emailOtp.attempts && user.emailOtp.attempts.count >= 5) {
        if (!user.emailOtp.attempts.banExp) {
          user.emailOtp.attempts.banExp = new Date(
            Date.now() + Number(process.env.ATTEMPTS_EXP)
          );
          await user.save();
        }
        throw new tooManyRequestsError();
      }
      if (user.emailOtp.expiresAt <= new Date()) {
        throw new otpExpiredError();
      }
      if (user.emailOtp.attempts) {
        user.emailOtp.attempts.count++;
        await user.save();
      }
      const isMatch = await compareHash(otp, user.emailOtp.otp);
      if (!isMatch) {
        throw new invalidCredentialsError();
      }
      user.isConfirmed = true;
      user.emailOtp = undefined;
      await user.save();
      return successHandler({
        res,
        msg: "Email confirmed successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  resendEmailOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { email }: resendEmailOtpDTO = req.body;
      const user = await this.userRepo.findUserByEmail(email);
      if (!user) {
        throw new notFoundError();
      }
      if (user?.isConfirmed || !user.emailOtp) {
        throw new userAlreadyConfirmedError();
      }
      if (
        user.emailOtp.request?.banExp &&
        user.emailOtp.request.banExp.getTime() <= new Date().getTime() &&
        user.emailOtp.request.count >= 5
      ) {
        user.emailOtp.request.count = 0;
        user.emailOtp.request.banExp = undefined;
      }
      if (user.emailOtp.request && user.emailOtp.request.count >= 5) {
        if (!user.emailOtp.request.banExp) {
          user.emailOtp.request.banExp = new Date(
            Date.now() + Number(process.env.ATTEMPTS_EXP)
          );
          await user.save();
        }
        throw new tooManyRequestsError();
      }
      if (user.emailOtp.request) {
        user.emailOtp.request.count++;
        await user.save();
      }
      if (user.emailOtp.expiresAt >= new Date()) {
        throw new otpNotExpiredError();
      }
      const confirmEmailOtp = generateOTP();
      const subject: string = "Confirm Email";
      const html: string = template(
        confirmEmailOtp,
        `${user.firstName} ${user.lastName}`,
        subject
      );
      user.emailOtp = {
        otp: confirmEmailOtp,
        expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
      };
      await user.save();
      emailEmitter.publish(Events.confirmEmail, {
        to: email,
        subject,
        html,
      });
      return successHandler({
        res,
        msg: "Email confirmed successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { email, password }: loginDTO = req.body;
      const user = await this.userRepo.findUserByEmail(email);
      if (!user) {
        throw new invalidCredentialsError();
      }
      if (!user.isConfirmed) {
        throw new userNotConfirmedError();
      }
      const isMatch = await compareHash(password, user.password);
      if (!isMatch) {
        throw new invalidCredentialsError();
      }
      if (user._2FA) {
        const accessToken = generateTempToken({
          payload: { id: user._id },
        });
        const otp = generateOTP();
        user.emailOtp = {
          otp,
          expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
        };
        await user.save();
        return successHandler({
          res,
          msg: "2FA required. Please verify your OTP.",
          data: {
            status: "pending_2fa",
            accessToken,
          },
          status: 200,
        });
      }
      const { accessToken, refreshToken } = generateToken({
        payload: { id: user._id },
      });
      return successHandler({
        res,
        msg: "logged in successfully",
        data: { accessToken, refreshToken },
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  _2FA = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const user: HydratedDocument<IUser> = res.locals.user;
      const { otp }: _2FADTO = req.body;
      if (!user.emailOtp) {
        throw new tryResendOtp();
      }
      if (
        user.emailOtp.attempts?.banExp &&
        user.emailOtp.attempts.banExp.getTime() <= new Date().getTime() &&
        user.emailOtp.attempts.count >= 5
      ) {
        user.emailOtp.attempts.count = 0;
        user.emailOtp.attempts.banExp = undefined;
      }
      if (user.emailOtp.attempts && user.emailOtp.attempts.count >= 5) {
        if (!user.emailOtp.attempts.banExp) {
          user.emailOtp.attempts.banExp = new Date(
            Date.now() + Number(process.env.ATTEMPTS_EXP)
          );
          await user.save();
        }
        throw new tooManyRequestsError();
      }
      if (user.emailOtp.expiresAt <= new Date()) {
        throw new otpExpiredError();
      }
      if (user.emailOtp.attempts) {
        user.emailOtp.attempts.count++;
        await user.save();
      }
      const isMatch = await compareHash(otp, user.emailOtp.otp);
      if (!isMatch) {
        throw new invalidCredentialsError();
      }
      user.emailOtp = undefined;
      await user.save();
      const { accessToken, refreshToken } = generateToken({
        payload: { id: user._id },
      });
      return successHandler({
        res,
        msg: "2FA successfully",
        data: { accessToken, refreshToken },
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const authorization = req.headers.authorization as string;
      const { user, decodedToken } = await decodeToken({
        authorization,
        tokenType: TokenType.refresh,
      });
      const accessToken = generateAccessToken({
        payload: { id: user._id },
        jwtid: decodedToken.jti,
      });
      return successHandler({
        res,
        msg: "refresh token generated successfully",
        data: { accessToken },
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { email }: forgotPasswordDTO = req.body;
      const user = await this.userRepo.findUserByEmail(email);
      if (user?.passwordOtp) {
        throw new tryResendOtp();
      }
      if (!user) {
        throw new notFoundError();
      }
      if (!user.isConfirmed) {
        throw new userNotConfirmedError();
      }
      if (user.passwordOtp && user.passwordOtp.expiresAt >= new Date()) {
        throw new otpNotExpiredError();
      }
      const forgetPasswordlOtp = generateOTP();
      const subject: string = "Reset Password";
      const html: string = template(
        forgetPasswordlOtp,
        `${user.firstName} ${user.lastName}`,
        subject
      );
      user.passwordOtp = {
        otp: forgetPasswordlOtp,
        expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
      };
      await user.save();
      emailEmitter.publish(Events.resetPassword, {
        to: email,
        subject,
        html,
      });
      return successHandler({
        res,
        msg: "Reset Password Email Sent Successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { email, otp, password }: resetPasswordDTO = req.body;
      const user = await this.userRepo.findUserByEmail(email);
      if (!user) {
        throw new notFoundError();
      }
      if (!user.passwordOtp) {
        throw new invalidCredentialsError();
      }
      if (user.passwordOtp && user.passwordOtp.expiresAt <= new Date()) {
        throw new otpExpiredError();
      }
      if (
        user.passwordOtp.attempts?.banExp &&
        user.passwordOtp.attempts.banExp.getTime() <= new Date().getTime() &&
        user.passwordOtp.attempts.count >= 5
      ) {
        user.passwordOtp.attempts.count = 0;
        user.passwordOtp.attempts.banExp = undefined;
      }
      if (user.passwordOtp.attempts && user.passwordOtp.attempts.count >= 5) {
        if (!user.passwordOtp.attempts.banExp) {
          user.passwordOtp.attempts.banExp = new Date(
            Date.now() + Number(process.env.ATTEMPTS_EXP)
          );
          await user.save();
        }
        throw new tooManyRequestsError();
      }
      if (user.passwordOtp.attempts) {
        user.passwordOtp.attempts.count++;
        await user.save();
      }
      const isMatch = await compareHash(otp, user.passwordOtp.otp);
      if (!isMatch) {
        throw new invalidCredentialsError();
      }
      user.password = password;
      user.changedCredentialsAt = new Date();
      user.passwordOtp = undefined;
      await user.save();
      return successHandler({
        res,
        msg: "Password Reset Successfully",
        status: 200,
      });
    } catch (error) {
      throw error;
    }
  };

  updateEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const user: HydratedDocument<IUser> = res.locals.user;
      if (user.tempEmail) {
        throw new tryResendOtp();
      }
      const { email }: updateEmailDTO = req.body;
      const userExist = await this.userRepo.findUserByEmail(email);
      if (userExist) {
        throw new userExistError();
      }
      user.tempEmail = email;
      await user.save();
      return successHandler({ res, status: 200 });
    } catch (error) {
      throw error;
    }
  };

  confirmEmailChange = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const user: HydratedDocument<IUser> = res.locals.user;
      const { oldOtp, newOtp }: confirmEmailChangeDTO = req.body;
      if (!user.emailOtp || !user.tempEmailOtp) {
        throw new invalidCredentialsError();
      }
      if (user.emailOtp.expiresAt <= new Date()) {
        throw new otpExpiredError();
      }
      if (
        user.tempEmailOtp.attempts?.banExp &&
        user.tempEmailOtp.attempts.banExp.getTime() <= new Date().getTime() &&
        user.tempEmailOtp.attempts.count >= 5
      ) {
        user.tempEmailOtp.attempts.count = 0;
        user.tempEmailOtp.attempts.banExp = undefined;
      }
      if (user.tempEmailOtp.attempts && user.tempEmailOtp.attempts.count >= 5) {
        if (!user.tempEmailOtp.attempts.banExp) {
          user.tempEmailOtp.attempts.banExp = new Date(
            Date.now() + Number(process.env.ATTEMPTS_EXP)
          );
          await user.save();
        }
        throw new tooManyRequestsError();
      }
      if (user.tempEmailOtp.expiresAt <= new Date()) {
        throw new otpExpiredError();
      }
      if (user.tempEmailOtp.attempts) {
        user.tempEmailOtp.attempts.count++;
        await user.save();
      }
      const old = await compareHash(oldOtp, user.emailOtp?.otp);
      const neu = await compareHash(newOtp, user.tempEmailOtp?.otp);
      if (!old || !neu) {
        throw new invalidCredentialsError();
      }
      user.updateOne({
        $set: {
          email: user.tempEmail,
        },
        $unset: {
          tempEmail: "",
          tempEmailOtp: "",
          emailOtp: "",
        },
      });
      return successHandler({ res, status: 200 });
    } catch (error) {
      throw error;
    }
  };

  resendPasswordOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return successHandler({
      res,
      msg: "Password Otp Resent Successfully",
      status: 200,
    });
  };

  resendUpdateEmailOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return successHandler({
      res,
      msg: "Email Otp Resent Successfully",
      status: 200,
    });
  };
}

export default AuthServices;
