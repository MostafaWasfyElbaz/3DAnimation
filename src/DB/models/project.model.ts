import mongoose, { model, Schema } from "mongoose";
import { IProject } from "../../common";
import { geometrySchema } from "./geometries.model";
import { modelSchema } from "./models.model";

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
    },

    geometries: [geometrySchema],
    models: [modelSchema],
  },
  { timestamps: true },
);

export const Project = model<IProject>("Project", ProjectSchema);
