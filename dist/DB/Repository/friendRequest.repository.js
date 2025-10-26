"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_repository_1 = __importDefault(require("./db.repository"));
const friendRequest_model_1 = require("../models/friendRequest.model");
const utils_1 = require("../../utils");
const user_repository_1 = __importDefault(require("./user.repository"));
class FriendRequestRepository extends db_repository_1.default {
    userRepository;
    constructor(userRepository = new user_repository_1.default()) {
        super(friendRequest_model_1.FriendRequestModel);
        this.userRepository = userRepository;
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
        const [createdUser] = await this.create({
            data: [
                {
                    from: user._id,
                    to: friend._id,
                    email: friend.email,
                },
            ],
        });
        return createdUser;
    };
    acceptFriendRequest = async ({ friendRequest, }) => {
        await this.updateOne({
            filter: { _id: friendRequest._id },
            data: { acceptedAt: new Date() },
        });
        await this.userRepository.updateOne({
            filter: { _id: friendRequest.to },
            data: { $addToSet: { friends: friendRequest.from } },
        });
        await this.userRepository.updateOne({
            filter: { _id: friendRequest.from },
            data: { $addToSet: { friends: friendRequest.to } },
        });
        return friendRequest;
    };
    deleteOrRejectFriendRequest = async ({ friendRequest, }) => {
        await this.deleteOne({
            filter: { _id: friendRequest._id },
        });
        return friendRequest;
    };
    blockUser = async ({ user, friend, }) => {
        try {
            await this.userRepository.updateOne({
                filter: { _id: user._id },
                data: {
                    blockList: { $addToSet: friend._id },
                },
            });
            await this.userRepository.updateOne({
                filter: { _id: friend._id },
                data: {
                    blockList: { $addToSet: user._id },
                },
            });
            await this.deleteOne({
                filter: {
                    $or: [
                        { from: user._id, to: friend._id },
                        { from: friend._id, to: user._id },
                    ],
                },
            });
        }
        catch (error) {
            throw error;
        }
    };
}
exports.default = FriendRequestRepository;
