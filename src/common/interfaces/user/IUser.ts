import { Gender, IOtp } from "../../index";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  gender?: Gender;
  password: string;
  emailOtp?: IOtp | undefined;
  passwordOtp?: IOtp | undefined;
  phone: string;
  isConfirmed: boolean;
  changedCredentialsAt: Date;
  tempEmail?: string | undefined;
  tempEmailOtp?: IOtp | undefined;
  _2FA?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId | undefined;
}
