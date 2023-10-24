"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletion = exports.createEmbedding = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config({ path: __dirname + "/../.env" });
const configuration = {
    apiKey: process.env["OPENAI_API_KEY"],
};
const openAi = new openai_1.default(configuration);
const createEmbedding = async (input) => {
    try {
        const embeddingRes = await openAi.embeddings.create({
            model: "text-embedding-ada-002",
            input: input,
        });
        const [{ embedding }] = embeddingRes.data;
        return embedding;
    }
    catch (err) {
        throw err;
    }
};
exports.createEmbedding = createEmbedding;
const createChatCompletion = async (chats) => {
    try {
        const response = await openAi.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: chats,
            temperature: 1,
            max_tokens: 256,
            top_p: 0.2,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const modelResponse = response.choices[0].message;
        let localChats = [...chats, modelResponse];
        return localChats;
    }
    catch (err) {
        throw err;
    }
};
exports.createChatCompletion = createChatCompletion;
