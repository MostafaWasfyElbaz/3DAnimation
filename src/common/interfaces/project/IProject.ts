import { Types } from "mongoose";
import { IGeometry, IModel } from "../..";

export interface IProject {
  userId: Types.ObjectId;
  name: string;
  geometries?: IGeometry[];
  models?: IModel[];
}
