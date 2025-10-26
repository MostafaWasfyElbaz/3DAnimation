"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successHandler = void 0;
const successHandler = ({ res, msg = "done", data, status = 200 }) => {
    return res.status(status).json({
        status,
        message: msg,
        data,
    });
};
exports.successHandler = successHandler;
