"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const _3DModel_service_1 = __importDefault(require("./3DModel.service"));
const _3DModel_validation_1 = require("./3DModel.validation");
const router = (0, express_1.Router)();
const routes = {
    uploadModel: "/upload-model",
};
router.post(routes.uploadModel, (0, middleware_1.auth)({}), (0, middleware_1.validationMiddleware)(_3DModel_validation_1.uploadModelSchema), _3DModel_service_1.default.uploadModel);
exports.default = router;
