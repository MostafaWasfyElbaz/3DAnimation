import { HydratedDocument, Schema, model } from "mongoose";
import { IUser, Events, IOtp } from "../../common";
import { createHash, emailEmitter, generateOTP, template } from "../../utils";

const otpSchema = new Schema<IOtp>({
  otp: { type: String },
  expiresAt: { type: Date },
  attempts: { count: { type: Number, default: 0 }, banExp: { type: Date } },
  request: { count: { type: Number, default: 0 }, banExp: { type: Date } },
});

const usersSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, "Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  tempEmail: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  emailOtp: otpSchema,
  passwordOtp: otpSchema,
  tempEmailOtp: otpSchema,
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  models: [{
    type: String,
  }],
  changedCredentialsAt: Date,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

usersSchema.pre(
  "save",
  async function (this: HydratedDocument<IUser> & { wasNew: boolean }, next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
      this.password = await createHash(this.password);
    }
    if (this.isDirectModified("passwordOtp.otp")) {
      if (this.passwordOtp) {
        this.passwordOtp.otp = await createHash(this.passwordOtp.otp);
      }
    }
    if (this.isModified("tempEmail") && this.tempEmail) {
      const tempOtp = generateOTP();
      const otp = generateOTP();

      this.tempEmailOtp = {
        otp: await createHash(tempOtp),
        expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
      };
      this.emailOtp = {
        otp: await createHash(otp),
        expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
      };
      emailEmitter.publish(Events.confirmEmail, {
        to: this.tempEmail,
        subject: "Confirm Email Change",
        html: template(
          tempOtp,
          `${this.firstName} ${this.lastName}`,
          "Confirm Email Change"
        ),
      });
      emailEmitter.publish(Events.confirmEmail, {
        to: this.email,
        subject: "Confirm Email Change",
        html: template(
          otp,
          `${this.firstName} ${this.lastName}`,
          "Confirm Email Change"
        ),
      });
    }
  }
);

usersSchema.pre(["find", "findOne"], async function (next) {
  if (!this.getFilter().paranoid) {
    this.setQuery({ ...this.getQuery() });
    next();
  }
  this.setQuery({ ...this.getQuery(), isDeleted: { $ne: true } });
  next();
});

usersSchema.post("save", async function (doc, next) {
  const that = this as HydratedDocument<IUser> & { wasNew: boolean };
  if (that.wasNew) {
    const otp = generateOTP();
    emailEmitter.publish(Events.confirmEmail, {
      to: that.email,
      subject: "Confirm Email",
      html: template(
        otp,
        `${that.firstName} ${that.lastName}`,
        "Confirm Email"
      ),
    });
    that.emailOtp = {
      otp: await createHash(otp),
      expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRATION)),
    };
    await that.save();
  }
});

export const User = model<IUser>("User", usersSchema);

