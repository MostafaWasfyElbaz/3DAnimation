import mongoose, { model, Schema } from "mongoose";
import { IProject } from "../../common";
import { geometrySchema } from "./geometries.model";
import { modelSchema } from "./models.model";

const vector3Schema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  { _id: false },
);

const fogSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    density: {
      type: Number,
      required: true,
    },

    near: Number,
    far: Number,
  },
  { _id: false },
);

const lightSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    intensity: {
      type: Number,
      required: true,
    },

    position: vector3Schema,
  },
  { _id: false },
);

const sceneSchema = new Schema(
  {
    backgroundColor: {
      type: String,
      required: true,
      default: "#262626",
    },
    fog: fogSchema,
    lights: [lightSchema],
  },
  { _id: false },
);

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

    scene: { type: sceneSchema, required: true },
  },
  { timestamps: true },
);

export const Project = model<IProject>("Project", ProjectSchema);
