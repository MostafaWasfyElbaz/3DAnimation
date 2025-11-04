import multer from "multer";
import { Request } from "express";
import { invalidFileTypeError } from "../index";
import fs from "fs";
import path from "path";

export const MimeType = {
  model: ["model/gltf", "model/gltf-binary", "model/obj"],
};

export const uploadFile = ({
  mimeType = MimeType.model,
  Path = "models",
}: {
  mimeType?: string[];
  Path?: string;
}): multer.Multer => {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdir(
        path.join(process.cwd(), "tmp", `${Path}`),
        { recursive: true },
        (err) => {
          if (err) {
            cb(err, "error creating directory");
          }
          cb(null, path.join(process.cwd(), "tmp", "uploads"));
        }
      );
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    },
  });
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: CallableFunction
  ): void => {
    if (!MimeType.model.includes(file.mimetype)) {
      cb(new invalidFileTypeError());
    }
    cb(null, true);
  };
  return multer({ storage, fileFilter });
};
