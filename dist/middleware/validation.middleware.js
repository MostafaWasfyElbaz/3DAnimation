"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const Error_1 = require("../utils/Error");
const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const data = {
            ...req.body,
            ...req.query,
            ...req.params,
            ...req.file,
            files: req.files,
        };
        const result = schema.safeParse(data);
        if (!result.success) {
            const errors = result.error.issues.map((error) => {
                return `${error.path} ==> ${error.message}`;
            });
            throw new Error_1.validationError(errors, 400);
        }
        next();
    };
};
exports.validationMiddleware = validationMiddleware;
