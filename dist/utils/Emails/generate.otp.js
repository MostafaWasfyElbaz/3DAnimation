"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const nanoid_1 = require("nanoid");
const generateOTP = () => {
    return (0, nanoid_1.customAlphabet)(process.env.OTP_ALPAHBET, Number(process.env.OTP_SIZE))();
};
exports.generateOTP = generateOTP;
