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
        unique: true,
    },
    source: {
        type: String,
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
const ChatsModel = mongoose_1.default.model("Chats", ChatsSchema);
exports.default = ChatsModel;
