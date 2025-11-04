"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.MimeType = void 0;
const multer_1 = __importDefault(require("multer"));
const index_1 = require("../index");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.MimeType = {
    model: ["model/gltf", "model/gltf-binary", "model/obj"],
};
const uploadFile = ({ mimeType = exports.MimeType.model, Path = "models", }) => {
    let storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            fs_1.default.mkdir(path_1.default.join(process.cwd(), "tmp", `${Path}`), { recursive: true }, (err) => {
                if (err) {
                    cb(err, "error creating directory");
                }
                cb(null, path_1.default.join(process.cwd(), "tmp", "uploads"));
            });
        },
        filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
        },
    });
    const fileFilter = (req, file, cb) => {
        if (!exports.MimeType.model.includes(file.mimetype)) {
            cb(new index_1.invalidFileTypeError());
        }
        cb(null, true);
    };
    return (0, multer_1.default)({ storage, fileFilter });
};
exports.uploadFile = uploadFile;
