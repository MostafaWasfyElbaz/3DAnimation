import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IGeometry } from "../../common";
import { string } from "zod";

export const geometrySchema = new Schema<IGeometry>(
  {
    isObject3D: { type: Boolean, default: true },
    uuid: {
      type: String,
      required: true,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      default: "Unnamed 3D Object",
    },
    type: {
      type: String,
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
