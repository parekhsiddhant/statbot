"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ChatsSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        unique: false,
    },
    client: {
        type: String,
        required: true,
        unique: false,
    },
    chats: [
        {
            _id: false,
            role: String,
            content: String,
        },
    ],
}, {
    timestamps: true,
});
ChatsSchema.index({ userId: 1, client: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Chats", ChatsSchema);
