import mongoose, { Schema } from "mongoose";
import { IGeometry } from "../../common";

export const geometrySchema = new Schema<IGeometry>(
  {
    isObject3D: { type: Boolean, required: true, default: true },
    uuid: {
      type: String,
      required: true,
      minlength: 36,
      maxlength: 36,
    },

    name: {
      type: String,
      required: true,
      default: "Unnamed 3D Object",
    },
    type: {
      type: String,
      required: true,
      default: "Mesh",
    },

    attributes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  { timestamps: true, _id: false },
);
