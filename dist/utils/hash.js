"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.createHash = void 0;
const bcrypt_1 = require("bcrypt");
const createHash = async (text) => {
    return await (0, bcrypt_1.hash)(text, Number(process.env.SALT_ROUNDS));
};
exports.createHash = createHash;
const compareHash = async (text, hash) => {
    return await (0, bcrypt_1.compare)(text, hash);
};
exports.compareHash = compareHash;
