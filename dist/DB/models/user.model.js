"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../../common");
const utils_1 = require("../../utils");
const otpSchema = new mongoose_1.Schema({
    otp: { type: String },
    expiresAt: { type: Date },
    attempts: { count: { type: Number, default: 0 }, banExp: { type: Date } },
    request: { count: { type: Number, default: 0 }, banExp: { type: Date } },
});
const usersSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, "Name is required"],
    },
    lastName: {
        type: String,
        required: [true, "Name is required"],
    },
    gender: {
        type: String,
        enum: common_1.Gender,
        default: common_1.Gender.male,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
    },
    tempEmail: {
        type: String,
        unique: [true, "Temp email already exists"],
        sparse: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    _2FA: {
        type: Boolean,
        default: false,
    },
    emailOtp: otpSchema,
    passwordOtp: otpSchema,
    tempEmailOtp: otpSchema,
    phone: {
        type: String,
        unique: [true, "Phone number already exists"],
        required: [true, "Phone number is required"],
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    changedCredentialsAt: Date,
    isDeleted: {
        type: Boolean,
        default: undefined,
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
});
usersSchema.pre("save", async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, utils_1.createHash)(this.password);
    }
    if (this.isDirectModified("passwordOtp.otp")) {
        if (this.passwordOtp) {
            this.passwordOtp.otp = await (0, utils_1.createHash)(this.passwordOtp.otp);
        }
    }
    if (this.isDirectModified("emailOtp.otp")) {
        if (this.emailOtp) {
            utils_1.emailEmitter.publish(common_1.Events.confirmEmail, {
                to: this.email,
                subject: "2FA OTP",
                html: (0, utils_1.template)(this.emailOtp.otp, `${this.firstName} ${this.lastName}`, "2FA OTP"),
            });
            this.emailOtp.otp = await (0, utils_1.createHash)(this.emailOtp.otp);
        }
    }
    if (this.isModified("tempEmail") && this.tempEmail) {
        const tempOtp = (0, utils_1.generateOTP)();
        const otp = (0, utils_1.generateOTP)();
        this.tempEmailOtp = {
            otp: await (0, utils_1.createHash)(tempOtp),
            expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
        };
        this.emailOtp = {
            otp: await (0, utils_1.createHash)(otp),
            expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
        };
        utils_1.emailEmitter.publish(common_1.Events.confirmEmail, {
            to: this.tempEmail,
            subject: "Confirm Email Change",
            html: (0, utils_1.template)(tempOtp, `${this.firstName} ${this.lastName}`, "Confirm Email Change"),
        });
        utils_1.emailEmitter.publish(common_1.Events.confirmEmail, {
            to: this.email,
            subject: "Confirm Email Change",
            html: (0, utils_1.template)(otp, `${this.firstName} ${this.lastName}`, "Confirm Email Change"),
        });
    }
});
usersSchema.pre(["find", "findOne"], async function (next) {
    if (!this.getFilter().paranoid) {
        this.setQuery({ ...this.getQuery() });
        next();
    }
    this.setQuery({ ...this.getQuery(), isDeleted: { $exists: false } });
    next();
});
usersSchema.post("save", async function (doc, next) {
    const that = this;
    if (that.wasNew) {
        const otp = (0, utils_1.generateOTP)();
        utils_1.emailEmitter.publish(common_1.Events.confirmEmail, {
            to: that.email,
            subject: "Confirm Email",
            html: (0, utils_1.template)(otp, `${that.firstName} ${that.lastName}`, "Confirm Email"),
        });
        that.emailOtp = {
            otp: await (0, utils_1.createHash)(otp),
            expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
        };
        await that.save();
    }
});
exports.userModel = (0, mongoose_1.model)("users", usersSchema);
