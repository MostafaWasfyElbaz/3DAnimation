import { Type } from "@aws-sdk/client-s3";
import mongoose from "mongoose";

export interface IModel {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  rawImagesUrls: string[];
  modelUrl: string;
  attributes: any;
}
