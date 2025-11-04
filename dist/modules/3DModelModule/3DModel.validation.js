"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadModelSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const utils_1 = require("../../utils");
exports.uploadModelSchema = zod_1.default.object({
    ContentType: utils_1.generalValidation.ContentType,
    Originalname: utils_1.generalValidation.Originalname,
});
