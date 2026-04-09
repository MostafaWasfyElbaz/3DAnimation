import mongoose from "mongoose";

export interface IGeometry {
  isObject3D: boolean;
  projectId?: mongoose.Types.ObjectId;
  uuid: string;
  name: string;
  type: string;

  attributes: any;

  createdAt: Date;
  updatedAt: Date;
}
