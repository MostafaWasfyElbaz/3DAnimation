import mongoose, { Schema } from "mongoose";
import { IModel } from "../../common";

const vector3Schema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  { _id: false },
);

export const modelSchema = new Schema<IModel>(
  {
    rawImagesUrls: [String],
    modelUrl: String,
    attributes: {
      uuid: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      visible: { type: Boolean },
      isLocked: { type: Boolean },
      castShadow: { type: Boolean },
      receiveShadow: { type: Boolean },
      position: vector3Schema,
      rotation: vector3Schema,
      scale: vector3Schema,
      size: vector3Schema,
      material: {
        type: {
          type: String,
        },
        color: { type: String },
        props: {
          opacity: { type: Number },
          transparent: { type: Boolean },
          roughness: { type: Number },
          metalness: { type: Number },
          wireframe: { type: Boolean },
          emissive: { type: String },
        },
      },
    },
  },

  { timestamps: true },
);
