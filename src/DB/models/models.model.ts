import mongoose, { Schema } from "mongoose";
import { IModel } from "../../common";

export const modelSchema = new Schema<IModel>(
  {
    rawImagesUrls: [String],
    modelUrl: String,
    attributes: mongoose.Schema.Types.Mixed,
  
  },

  { timestamps: true },
);
