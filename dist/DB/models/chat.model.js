"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Message Created By is required"],
    },
    content: { type: String, required: [true, "Message Content is required"] },
}, { timestamps: true });
const chatSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Chat Participants is required"],
        },
    ],
    messages: [messageSchema],
    groupName: String,
    groupImage: String,
    groupId: String,
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Chat Created By is required"],
    },
}, { timestamps: true });
const Chat = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", chatSchema);
