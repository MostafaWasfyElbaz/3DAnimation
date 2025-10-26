"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DBConnection = async () => {
    await mongoose_1.default
        .connect(process.env.URI)
        .then(() => {
        console.log("Database connected");
    })
        .catch((error) => {
        console.log(error);
    });
};
exports.DBConnection = DBConnection;
