"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ClientSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    context: {
        type: String,
        required: true,
    },
    authorizedUsers: [{ type: String }],
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Client", ClientSchema);
