"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_repository_1 = __importDefault(require("../Repository/db.repository"));
const utils_1 = require("../../utils");
const user_model_1 = require("../models/user.model");
class UserRepository extends db_repository_1.default {
    model;
    constructor(model = user_model_1.User) {
        super(model);
        this.model = model;
    }
    findUserByEmail = async (email) => {
        const user = await this.findOne({ filter: { email } });
        return user;
    };
    createUser = async ({ user, }) => {
        const isExist = await this.findUserByEmail(user.email);
        if (isExist) {
            throw new utils_1.userExistError();
        }
        const [createdUser] = await this.create({ data: [user] });
        return createdUser;
    };
}
exports.default = UserRepository;
