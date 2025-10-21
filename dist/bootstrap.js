"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const DBConnection_1 = require("./DB/DBConnection");
dotenv_1.default.config({
    path: path_1.default.resolve("./src/config/.env"),
});
const app = (0, express_1.default)();
const bootstrap = async () => {
    await (0, DBConnection_1.DBConnection)();
    app.use(express_1.default.json());
    app.use("/api/v1", routes_1.default);
    app.use((err, req, res, next) => {
        return res.status(err.statusCode).json({
            message: err.message,
            status: err.statusCode,
            stack: err.stack,
        });
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};
exports.bootstrap = bootstrap;
