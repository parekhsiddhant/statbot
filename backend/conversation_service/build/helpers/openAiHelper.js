"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletion = exports.createEmbedding = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = require("openai");
dotenv_1.default.config({ path: __dirname + "/../.env" });
const configuration = new openai_1.Configuration({
    apiKey: process.env["OPENAI_API_KEY"],
});
const openAi = new openai_1.OpenAIApi(configuration);
const createEmbedding = async (input) => {
    try {
        const embeddingRes = await openAi.createEmbedding({
            model: "text-embedding-ada-002",
            input: input,
        });
        const [{ embedding }] = embeddingRes.data.data;
        return embedding;
    }
    catch (err) {
        throw err;
    }
};
exports.createEmbedding = createEmbedding;
const createChatCompletion = async (chats) => {
    try {
        const response = await openAi.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: chats,
        });
        if (response.status === 200 && response?.data?.choices?.length) {
            const modelResponse = response.data.choices[0].message;
            let localChats = [...chats, modelResponse];
            return localChats;
        }
        else {
            console.log("Model did not respond - ", response);
            let localChats = [
                ...chats,
                { role: "assistant", content: "Error generating response." },
            ];
            return localChats;
        }
    }
    catch (err) {
        throw err;
    }
};
exports.createChatCompletion = createChatCompletion;
