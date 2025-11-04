"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateTempToken = exports.generateAccessToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const generateToken = ({ payload, }) => {
    const jti = (0, nanoid_1.nanoid)();
    const accessToken = (0, exports.generateAccessToken)({ payload, jwtid: jti });
    const refreshToken = (0, exports.generateRefreshToken)({ payload, jwtid: jti });
    return { accessToken, refreshToken };
};
exports.generateToken = generateToken;
const generateAccessToken = ({ payload, jwtid, }) => {
    return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_SIGNITURE, {
        expiresIn: "120 S",
        jwtid,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateTempToken = ({ payload, }) => {
    return jsonwebtoken_1.default.sign(payload, process.env.TEMP_SIGNITURE, {
        expiresIn: "300 S",
    });
};
exports.generateTempToken = generateTempToken;
const generateRefreshToken = ({ payload, jwtid, }) => {
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_SIGNITURE, {
        expiresIn: "7 D",
        jwtid,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = ({ token, secret, }) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
