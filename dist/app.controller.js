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
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({
    path: path_1.default.resolve("./src/config/.env"),
});
const app = (0, express_1.default)();
const bootstrap = async () => {
    app.use((0, cors_1.default)());
    await (0, DBConnection_1.DBConnection)();
    app.use(express_1.default.json());
    app.use("/api/v1", routes_1.default);
    app.use("/{*dummy}", (req, res) => {
        res.status(404).json({
            message: "Page not found",
        });
    });
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({
            message: err.message,
            status: err.statusCode || 500,
            stack: err.stack,
        });
    });
    app.listen(process.env.SERVER_PORT, () => {
        console.log(`Server is running on port ${process.env.SERVER_PORT}`);
    });
};
exports.bootstrap = bootstrap;
