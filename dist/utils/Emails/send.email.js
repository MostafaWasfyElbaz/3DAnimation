"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (email, subject, html) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const main = async () => {
        await transporter.sendMail({
            from: `Social App <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: html,
        });
    };
    main().catch((err) => {
        console.log("Error sending email: ", err);
    });
};
exports.sendEmail = sendEmail;
