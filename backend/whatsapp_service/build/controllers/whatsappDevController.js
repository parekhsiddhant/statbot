"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const ChatsModel_1 = __importDefault(require("../models/ChatsModel"));
const ClientsModel_1 = __importDefault(require("../models/ClientsModel"));
const axios_1 = __importDefault(require("axios"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
dotenv_1.default.config({ path: __dirname + "/../.env" });
const updateUserConversation = async (userId, localChats) => {
    try {
        const updatedChat = await ChatsModel_1.default.findOneAndUpdate({ userId: userId, client: process.env["CLIENT"] }, { $set: { chats: localChats } }, { new: true });
        return updatedChat;
    }
    catch (err) {
        console.log("Error in updating user conversation - ", err);
        throw err;
    }
};
const checkForExcessiveMessages = (chats) => {
    try {
        // Check whether pending call exists & Check how long ago it was
        const lastMessage = chats?.chats?.at(-1);
        const updatedAt = new Date(chats?.updatedAt);
        const now = new Date();
        const timeDifferenceInMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);
        if (lastMessage.role === "user" && timeDifferenceInMinutes < 1) {
            return true;
        }
        return false;
    }
    catch (err) {
        throw err;
    }
};
const handleWhatsappMessage = async (message) => {
    try {
        // Fetch user if exists
        console.log("Got message from - ", message.from);
        let user = await UserModel_1.default.findOne({
            phone: message.from,
            source: "whatsapp",
        });
        // Create new user if does not exist
        if (!user) {
            user = new UserModel_1.default({
                phone: message.from,
                source: "whatsapp",
            });
            await user.save();
        }
        // Check whether user is authorized
        const isUserAuthorized = await ClientsModel_1.default.findOne({
            name: process.env["CLIENT"],
            authorizedUsers: message.from,
        });
        if (isUserAuthorized) {
            let chats = await ChatsModel_1.default.findOne({
                userId: user._id,
                client: process.env["CLIENT"],
            });
            if (chats) {
                // Check whether a pending message is there
                const isSpamming = checkForExcessiveMessages(chats);
                if (isSpamming) {
                    message.reply("Wait for your earlier request to be fulfiled.");
                    return;
                }
            }
            else {
                chats = new ChatsModel_1.default({
                    userId: user._id,
                    client: process.env["CLIENT"],
                    chats: [],
                });
                await chats.save();
            }
            const userMessage = {
                role: "user",
                content: message?.body,
            };
            const localChats = [...chats.chats, userMessage];
            // Update conversation in DB
            const updatedChats = await updateUserConversation(user._id, localChats);
            // Call conversation service
            const modelResponse = await axios_1.default.post("http://localhost:4000/chatCompletion", {
                chats: updatedChats?.chats,
                client: process.env["CLIENT"],
            });
            if (modelResponse.status === 200) {
                // Reply to message
                const modelChats = modelResponse.data.data;
                const latestMessage = modelChats.at(-1);
                updateUserConversation(user._id, modelChats);
                message.reply(latestMessage.content);
                return;
            }
            else {
                // Handle retry/waiting in case of overload or error
                const errorMessage = {
                    role: "system",
                    content: "We are overloaded at the moment, please try after some time.",
                };
                updateUserConversation(user._id, [...localChats, errorMessage]);
                message.reply(errorMessage.content);
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        message.reply("Some error occurred, please try again after some time.");
    }
};
exports.default = handleWhatsappMessage;
