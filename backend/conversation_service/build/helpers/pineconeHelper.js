"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.upsert = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pinecone_1 = require("@pinecone-database/pinecone");
const uuid_1 = require("uuid");
dotenv_1.default.config({ path: __dirname + "/../.env" });
const pineconeKey = process.env["PINECONE_API_KEY"] || "";
const pineconeEnv = process.env["PINECONE_ENV"] || "";
const pineconeClient = new pinecone_1.PineconeClient();
pineconeClient.init({
    environment: pineconeEnv,
    apiKey: pineconeKey,
});
const upsert = async (data, client) => {
    try {
        const index = pineconeClient.Index(client);
        const vectors = data.map((chunk) => {
            return {
                id: (0, uuid_1.v4)().toString(),
                values: chunk.embedding,
                metadata: {
                    content: chunk.content,
                    content_tokens: chunk.content_tokens,
                },
            };
        });
        const upsertRequest = {
            vectors: vectors,
        };
        const upsertResponse = await index.upsert({ upsertRequest });
        return upsertResponse;
    }
    catch (err) {
        throw err;
    }
};
exports.upsert = upsert;
const query = async (embed, client) => {
    try {
        const index = pineconeClient.Index(client);
        const queryRequest = {
            vector: embed,
            topK: 3,
            includeValues: false,
            includeMetadata: true,
        };
        const response = await index.query({ queryRequest });
        return response.matches;
    }
    catch (err) {
        throw err;
    }
};
exports.query = query;
