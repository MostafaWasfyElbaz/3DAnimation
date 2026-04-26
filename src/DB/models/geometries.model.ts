import mongoose, { Schema } from "mongoose";
import { IGeometry } from "../../common";

export const geometrySchema = new Schema<IGeometry>(
  {
    uuid: {
      type: String,
      required: true,
      minlength: 36,
      maxlength: 36,
    },

    name: {
      type: String,
      default: "Unnamed 3D Object",
    },
    type: {
      type: String,
      required: true,
    },

    parameters: { type: mongoose.Schema.Types.Mixed, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 },
    },
    color: {
      r: { type: Number, default: 1 },
      g: { type: Number, default: 1 },
      b: { type: Number, default: 1 },
    },
    opacity: { type: Number, default: 1 },
  },
  { timestamps: true, _id: false },
);
