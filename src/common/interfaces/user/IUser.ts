import { IOtp } from "../../index";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  emailOtp?: IOtp | undefined;
  passwordOtp?: IOtp | undefined;
  isConfirmed: boolean;
  changedCredentialsAt: Date;
  tempEmail?: string | undefined;
  tempEmailOtp?: IOtp | undefined;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId | undefined;
  models?: string[];
}
