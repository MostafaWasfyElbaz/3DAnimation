import { HydratedDocument } from "mongoose";
import { IUser } from "../../index";

export interface IUserRepo {
  findUserByEmail(email: string): Promise<HydratedDocument<IUser> | null>;
  createUser(user: {user:Partial<IUser>}): Promise<HydratedDocument<IUser>>;
}
