import { Types } from "mongoose";
import { IGeometry, IModel } from "../..";

export interface IProject {
  userId: Types.ObjectId;
  name: string;
  geometries?: IGeometry[];
  models?: IModel[];
  scene: {
    backgroundColor: string;
    fog?: {
      type: string;
      color: string;
      density: number;
      near: number;
      far: number;
    };
    lights?: {
      id: string;
      type: string;
      color: string;
      intensity: number;
      position: {
        x: number;
        y: number;
        z: number;
      };
    }[];
  };
}
