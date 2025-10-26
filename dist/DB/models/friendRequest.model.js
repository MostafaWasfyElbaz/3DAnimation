"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../../common");
const utils_1 = require("../../utils");
const friendRequestSchema = new mongoose_1.Schema({
    from: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    email: String,
    acceptedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
friendRequestSchema.pre("save", async function (next) {
    if (this.isNew && this.isDirectModified("to")) {
        utils_1.emailEmitter.publish(common_1.Events.general, {
            to: this.email,
            subject: "Taged",
            html: "",
        });
        this.email = undefined;
    }
});
exports.FriendRequestModel = (0, mongoose_1.model)("FriendRequest", friendRequestSchema);
