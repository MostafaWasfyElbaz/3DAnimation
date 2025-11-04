"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.decodeToken = void 0;
const index_1 = require("../utils/index");
const index_2 = require("../common/index");
const user_repository_1 = __importDefault(require("../DB/Repository/user.repository"));
const userModel = new user_repository_1.default();
const decodeToken = async ({ authorization, tokenType = index_2.TokenType.access, }) => {
    try {
        if (!authorization) {
            throw new index_1.invalidCredentialsError();
        }
        if (!authorization.startsWith(`${process.env.BEARER_KEY}`)) {
            throw new index_1.invalidCredentialsError();
        }
        const token = authorization.split(` `)[1];
        if (!token) {
            throw new index_1.invalidCredentialsError();
        }
        let secret;
        if (tokenType == index_2.TokenType.access) {
            secret = process.env.ACCESS_SIGNITURE;
        }
        else if (tokenType == index_2.TokenType.refresh) {
            secret = process.env.REFRESH_SIGNITURE;
        }
        else if (tokenType == index_2.TokenType.temp) {
            secret = process.env.TEMP_SIGNITURE;
        }
        else {
            throw new index_1.invalidCredentialsError();
        }
        const decodedToken = (0, index_1.verifyToken)({
            token,
            secret
        });
        if (!decodedToken) {
            throw new index_1.invalidCredentialsError();
        }
        const user = await userModel.findById({ id: decodedToken.id });
        if (!user) {
            throw new index_1.invalidCredentialsError();
        }
        if (!user.isConfirmed) {
            throw new index_1.userNotConfirmedError();
        }
        if (user.changedCredentialsAt &&
            user.changedCredentialsAt.getTime() >= decodedToken.iat * 1000) {
            throw new index_1.invalidCredentialsError();
        }
        return { user, decodedToken };
    }
    catch (error) {
        throw error;
    }
};
exports.decodeToken = decodeToken;
const auth = ({ tokenType = index_2.TokenType.access, } = {}) => {
    return async (req, res, next) => {
        try {
            const { user } = await (0, exports.decodeToken)({
                authorization: req.headers.authorization,
                tokenType,
            });
            res.locals.user = user;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.auth = auth;
