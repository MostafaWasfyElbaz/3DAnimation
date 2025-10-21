"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_repository_1 = __importDefault(require("./db.repository"));
const friendRequest_model_1 = require("../models/friendRequest.model");
const utils_1 = require("../../utils");
class FriendRequestRepository extends db_repository_1.default {
    constructor() {
        super(friendRequest_model_1.FriendRequestModel);
    }
    createFriendRequest = async ({ user, friend, }) => {
        const request = await this.findOne({
            filter: {
                $or: [
                    { from: user._id, to: friend._id },
                    { from: friend._id, to: user._id },
                ],
            },
        });
        if (request) {
            throw new utils_1.unableToSetFriendRequest();
        }
        return await this.model.create({
            from: user._id,
            to: friend._id,
            email: friend.email
        });
    };
}
exports.default = FriendRequestRepository;
