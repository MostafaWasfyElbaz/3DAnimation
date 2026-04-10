import mongoose from "mongoose";
import { UUIDTypes } from "uuid";

export interface IGeometry {
  isObject3D: boolean;
  projectId?: mongoose.Types.ObjectId;
  uuid: UUIDTypes;
  name: string;
  type: string;

  attributes: any;

  createdAt: Date;
  updatedAt: Date;
}
