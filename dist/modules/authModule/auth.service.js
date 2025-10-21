"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../../common");
const user_repository_1 = __importDefault(require("../../DB/Repository/user.repository"));
const utils_1 = require("../../utils");
const middleware_1 = require("../../middleware");
class AuthServices {
    userRepo;
    constructor(userRepo = new user_repository_1.default()) {
        this.userRepo = userRepo;
    }
    signup = async (req, res, next) => {
        try {
            const { firstName, lastName, email, password, gender, phone, _2FA, } = req.body;
            const user = await this.userRepo.createUser({
                user: {
                    firstName,
                    lastName,
                    email,
                    password,
                    gender: gender || common_1.Gender.male,
                    phone,
                    _2FA,
                },
            });
            if (!user) {
                throw new utils_1.failedToCreateUser();
            }
            return (0, utils_1.successHandler)({
                res,
                msg: "User created successfully",
                status: 201,
            });
        }
        catch (error) {
            throw error;
        }
    };
    confirmEmail = async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            const user = await this.userRepo.findUserByEmail(email);
            if (!user) {
                throw new utils_1.notFoundError();
            }
            if (user?.isConfirmed || !user.emailOtp) {
                throw new utils_1.userAlreadyConfirmedError();
            }
            if (user.emailOtp.attempts?.banExp &&
                user.emailOtp.attempts.banExp.getTime() <= new Date().getTime() &&
                user.emailOtp.attempts.count >= 5) {
                user.emailOtp.attempts.count = 0;
                user.emailOtp.attempts.banExp = undefined;
            }
            if (user.emailOtp.attempts && user.emailOtp.attempts.count >= 5) {
                if (!user.emailOtp.attempts.banExp) {
                    user.emailOtp.attempts.banExp = new Date(Date.now() + Number(process.env.ATTEMPTS_EXP));
                    await user.save();
                }
                throw new utils_1.tooManyRequestsError();
            }
            if (user.emailOtp.expiresAt <= new Date()) {
                throw new utils_1.otpExpiredError();
            }
            if (user.emailOtp.attempts) {
                user.emailOtp.attempts.count++;
                await user.save();
            }
            const isMatch = await (0, utils_1.compareHash)(otp, user.emailOtp.otp);
            if (!isMatch) {
                throw new utils_1.invalidCredentialsError();
            }
            user.isConfirmed = true;
            user.emailOtp = undefined;
            await user.save();
            return (0, utils_1.successHandler)({
                res,
                msg: "Email confirmed successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    resendEmailOtp = async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await this.userRepo.findUserByEmail(email);
            if (!user) {
                throw new utils_1.notFoundError();
            }
            if (user?.isConfirmed || !user.emailOtp) {
                throw new utils_1.userAlreadyConfirmedError();
            }
            if (user.emailOtp.request?.banExp &&
                user.emailOtp.request.banExp.getTime() <= new Date().getTime() &&
                user.emailOtp.request.count >= 5) {
                user.emailOtp.request.count = 0;
                user.emailOtp.request.banExp = undefined;
            }
            if (user.emailOtp.request && user.emailOtp.request.count >= 5) {
                if (!user.emailOtp.request.banExp) {
                    user.emailOtp.request.banExp = new Date(Date.now() + Number(process.env.ATTEMPTS_EXP));
                    await user.save();
                }
                throw new utils_1.tooManyRequestsError();
            }
            if (user.emailOtp.request) {
                user.emailOtp.request.count++;
                await user.save();
            }
            if (user.emailOtp.expiresAt >= new Date()) {
                throw new utils_1.otpNotExpiredError();
            }
            const confirmEmailOtp = (0, utils_1.generateOTP)();
            const subject = "Confirm Email";
            const html = (0, utils_1.template)(confirmEmailOtp, `${user.firstName} ${user.lastName}`, subject);
            user.emailOtp = {
                otp: confirmEmailOtp,
                expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
            };
            await user.save();
            utils_1.emailEmitter.publish(common_1.Events.confirmEmail, {
                to: email,
                subject,
                html,
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "Email confirmed successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await this.userRepo.findUserByEmail(email);
            if (!user) {
                throw new utils_1.invalidCredentialsError();
            }
            if (!user.isConfirmed) {
                throw new utils_1.userNotConfirmedError();
            }
            const isMatch = await (0, utils_1.compareHash)(password, user.password);
            if (!isMatch) {
                throw new utils_1.invalidCredentialsError();
            }
            if (user._2FA) {
                const accessToken = (0, utils_1.generateTempToken)({
                    payload: { id: user._id },
                });
                const otp = (0, utils_1.generateOTP)();
                user.emailOtp = {
                    otp,
                    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
                };
                await user.save();
                return (0, utils_1.successHandler)({
                    res,
                    msg: "2FA required. Please verify your OTP.",
                    data: {
                        status: "pending_2fa",
                        accessToken,
                    },
                    status: 200,
                });
            }
            const { accessToken, refreshToken } = (0, utils_1.generateToken)({
                payload: { id: user._id },
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "logged in successfully",
                data: { accessToken, refreshToken },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    _2FA = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { otp } = req.body;
            if (!user.emailOtp) {
                throw new utils_1.tryResendOtp();
            }
            if (user.emailOtp.attempts?.banExp &&
                user.emailOtp.attempts.banExp.getTime() <= new Date().getTime() &&
                user.emailOtp.attempts.count >= 5) {
                user.emailOtp.attempts.count = 0;
                user.emailOtp.attempts.banExp = undefined;
            }
            if (user.emailOtp.attempts && user.emailOtp.attempts.count >= 5) {
                if (!user.emailOtp.attempts.banExp) {
                    user.emailOtp.attempts.banExp = new Date(Date.now() + Number(process.env.ATTEMPTS_EXP));
                    await user.save();
                }
                throw new utils_1.tooManyRequestsError();
            }
            if (user.emailOtp.expiresAt <= new Date()) {
                throw new utils_1.otpExpiredError();
            }
            if (user.emailOtp.attempts) {
                user.emailOtp.attempts.count++;
                await user.save();
            }
            const isMatch = await (0, utils_1.compareHash)(otp, user.emailOtp.otp);
            if (!isMatch) {
                throw new utils_1.invalidCredentialsError();
            }
            user.emailOtp = undefined;
            await user.save();
            const { accessToken, refreshToken } = (0, utils_1.generateToken)({
                payload: { id: user._id },
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "2FA successfully",
                data: { accessToken, refreshToken },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    refreshToken = async (req, res, next) => {
        try {
            const authorization = req.headers.authorization;
            const { user, decodedToken } = await (0, middleware_1.decodeToken)({
                authorization,
                tokenType: common_1.TokenType.refresh,
            });
            const accessToken = (0, utils_1.generateAccessToken)({
                payload: { id: user._id },
                jwtid: decodedToken.jti,
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "refresh token generated successfully",
                data: { accessToken },
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await this.userRepo.findUserByEmail(email);
            if (user?.passwordOtp) {
                throw new utils_1.tryResendOtp();
            }
            if (!user) {
                throw new utils_1.notFoundError();
            }
            if (!user.isConfirmed) {
                throw new utils_1.userNotConfirmedError();
            }
            if (user.passwordOtp && user.passwordOtp.expiresAt >= new Date()) {
                throw new utils_1.otpNotExpiredError();
            }
            const forgetPasswordlOtp = (0, utils_1.generateOTP)();
            const subject = "Reset Password";
            const html = (0, utils_1.template)(forgetPasswordlOtp, `${user.firstName} ${user.lastName}`, subject);
            user.passwordOtp = {
                otp: forgetPasswordlOtp,
                expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
            };
            await user.save();
            utils_1.emailEmitter.publish(common_1.Events.resetPassword, {
                to: email,
                subject,
                html,
            });
            return (0, utils_1.successHandler)({
                res,
                msg: "Reset Password Email Sent Successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const { email, otp, password } = req.body;
            const user = await this.userRepo.findUserByEmail(email);
            if (!user) {
                throw new utils_1.notFoundError();
            }
            if (!user.passwordOtp) {
                throw new utils_1.invalidCredentialsError();
            }
            if (user.passwordOtp && user.passwordOtp.expiresAt <= new Date()) {
                throw new utils_1.otpExpiredError();
            }
            if (user.passwordOtp.attempts?.banExp &&
                user.passwordOtp.attempts.banExp.getTime() <= new Date().getTime() &&
                user.passwordOtp.attempts.count >= 5) {
                user.passwordOtp.attempts.count = 0;
                user.passwordOtp.attempts.banExp = undefined;
            }
            if (user.passwordOtp.attempts && user.passwordOtp.attempts.count >= 5) {
                if (!user.passwordOtp.attempts.banExp) {
                    user.passwordOtp.attempts.banExp = new Date(Date.now() + Number(process.env.ATTEMPTS_EXP));
                    await user.save();
                }
                throw new utils_1.tooManyRequestsError();
            }
            if (user.passwordOtp.attempts) {
                user.passwordOtp.attempts.count++;
                await user.save();
            }
            const isMatch = await (0, utils_1.compareHash)(otp, user.passwordOtp.otp);
            if (!isMatch) {
                throw new utils_1.invalidCredentialsError();
            }
            user.password = password;
            user.changedCredentialsAt = new Date();
            user.passwordOtp = undefined;
            await user.save();
            return (0, utils_1.successHandler)({
                res,
                msg: "Password Reset Successfully",
                status: 200,
            });
        }
        catch (error) {
            throw error;
        }
    };
    updateEmail = async (req, res, next) => {
        try {
            const user = res.locals.user;
            if (user.tempEmail) {
                throw new utils_1.tryResendOtp();
            }
            const { email } = req.body;
            const userExist = await this.userRepo.findUserByEmail(email);
            if (userExist) {
                throw new utils_1.userExistError();
            }
            user.tempEmail = email;
            await user.save();
            return (0, utils_1.successHandler)({ res, status: 200 });
        }
        catch (error) {
            throw error;
        }
    };
    confirmEmailChange = async (req, res, next) => {
        try {
            const user = res.locals.user;
            const { oldOtp, newOtp } = req.body;
            if (!user.emailOtp || !user.tempEmailOtp) {
                throw new utils_1.invalidCredentialsError();
            }
            if (user.emailOtp.expiresAt <= new Date()) {
                throw new utils_1.otpExpiredError();
            }
            if (user.tempEmailOtp.attempts?.banExp &&
                user.tempEmailOtp.attempts.banExp.getTime() <= new Date().getTime() &&
                user.tempEmailOtp.attempts.count >= 5) {
                user.tempEmailOtp.attempts.count = 0;
                user.tempEmailOtp.attempts.banExp = undefined;
            }
            if (user.tempEmailOtp.attempts && user.tempEmailOtp.attempts.count >= 5) {
                if (!user.tempEmailOtp.attempts.banExp) {
                    user.tempEmailOtp.attempts.banExp = new Date(Date.now() + Number(process.env.ATTEMPTS_EXP));
                    await user.save();
                }
                throw new utils_1.tooManyRequestsError();
            }
            if (user.tempEmailOtp.expiresAt <= new Date()) {
                throw new utils_1.otpExpiredError();
            }
            if (user.tempEmailOtp.attempts) {
                user.tempEmailOtp.attempts.count++;
                await user.save();
            }
            const old = await (0, utils_1.compareHash)(oldOtp, user.emailOtp?.otp);
            const neu = await (0, utils_1.compareHash)(newOtp, user.tempEmailOtp?.otp);
            if (!old || !neu) {
                throw new utils_1.invalidCredentialsError();
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
            return (0, utils_1.successHandler)({ res, status: 200 });
        }
        catch (error) {
            throw error;
        }
    };
    resendPasswordOtp = async (req, res, next) => {
        return (0, utils_1.successHandler)({
            res,
            msg: "Password Otp Resent Successfully",
            status: 200,
        });
    };
    resendUpdateEmailOtp = async (req, res, next) => {
        return (0, utils_1.successHandler)({
            res,
            msg: "Email Otp Resent Successfully",
            status: 200,
        });
    };
}
exports.default = AuthServices;
