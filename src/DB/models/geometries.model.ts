import mongoose, { Schema } from "mongoose";
import { IGeometry } from "../../common";

const vector3Schema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  { _id: false },
);

export const geometrySchema = new Schema<IGeometry>(
  {
    uuid: {
      type: String,
      required: true,
      minlength: 36,
      maxlength: 36,
    },

    geometryType: { type: String, required: true },
    name: { type: String, default: "Unnamed 3D Object" },

    visible: { type: Boolean },
    isLocked: { type: Boolean },
    castShadow: { type: Boolean },
    receiveShadow: { type: Boolean },

    position: vector3Schema,
    rotation: vector3Schema,
    scale: vector3Schema,
    size: vector3Schema,

    material: {
      type: { type: String },
      color: { type: String },
      props: {
        opacity: { type: Number },
        roughness: { type: Number },
        metalness: { type: Number },
        wireframe: { type: Boolean },
        shininess: { type: Number },
        transmission: { type: Number },
        clearcoat: { type: Number },
        clearcoatRoughness: { type: Number },
        thickness: { type: Number },
        ior: { type: Number },
      },
    },
  },
  { timestamps: true, _id: false },
);
