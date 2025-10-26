"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.MimeType = void 0;
const multer_1 = __importDefault(require("multer"));
const index_1 = require("../index");
const index_2 = require("../../common/index");
exports.MimeType = {
    images: ["image/jpeg", "image/jpg", "image/png"],
};
const uploadFile = ({ storeIn = index_2.StoreIn.memory, mimeType = exports.MimeType.images }) => {
    const storage = storeIn === index_2.StoreIn.memory ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({});
    const fileFilter = (req, file, cb) => {
        if (req.file && req.file.size >= 1024 * 1024 * 200 && storeIn === index_2.StoreIn.memory) {
            cb(new index_1.fileSizeError());
        }
        if (!exports.MimeType.images.includes(file.mimetype)) {
            cb(new index_1.invalidFileTypeError());
        }
        cb(null, true);
    };
    return (0, multer_1.default)({ storage, fileFilter });
};
exports.uploadFile = uploadFile;
