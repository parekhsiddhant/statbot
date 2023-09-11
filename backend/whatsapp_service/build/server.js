"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const whatsappDevHelper_1 = require("./helpers/whatsappDevHelper");
dotenv_1.default.config({ path: __dirname + "/.env" });
const MONGODB_URL = process.env.MONGODB_URL || "";
mongoose_1.default
    .connect(MONGODB_URL, {
    keepAlive: true,
})
    .then(() => {
    console.log("Connected to Mongo...");
})
    .catch((err) => {
    console.log("Error connecting to mongo - ", err);
    process.exit();
});
const whatsappClient = new whatsappDevHelper_1.WhatsappClient(whatsappDevHelper_1.DefaultOptions);
whatsappClient.initialize();
