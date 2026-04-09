import mongoose, { Schema } from "mongoose";
import { IModel } from "../../common";

export const modelSchema = new Schema<IModel>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    rawImagesUrls: [String],
    modelUrl: String,
    attributes: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
