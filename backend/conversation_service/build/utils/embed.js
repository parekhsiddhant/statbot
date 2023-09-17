"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const gpt_3_encoder_1 = require("gpt-3-encoder");
const openAiHelper_1 = require("../helpers/openAiHelper");
const pineconeHelper = __importStar(require("../helpers/pineconeHelper"));
const MAX_CHUNK_SIZE = 400;
const MIN_CHUNK_SIZE = 200;
const getFileExtension = (filename) => {
    try {
        return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
    }
    catch (err) {
        throw err;
    }
};
const chunkText = async (text) => {
    try {
        let chunks = [];
        if ((0, gpt_3_encoder_1.encode)(text).length > MAX_CHUNK_SIZE) {
            const split = text.split(".");
            let chunk = "";
            for (let i = 0; i < split.length; ++i) {
                const sentence = split[i];
                const sentenceTokenLength = (0, gpt_3_encoder_1.encode)(sentence).length;
                const chunkTextTokenLength = (0, gpt_3_encoder_1.encode)(chunk).length;
                const totalTokenLength = chunkTextTokenLength + sentenceTokenLength;
                if (totalTokenLength <= MAX_CHUNK_SIZE &&
                    totalTokenLength > MIN_CHUNK_SIZE) {
                    if (chunk != "")
                        chunks.push(chunk);
                    chunk = "";
                }
                if (sentence && sentence !== "") {
                    if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
                        chunk += sentence + ". ";
                    }
                    else {
                        chunk += sentence + " ";
                    }
                }
            }
            chunks.push(chunk.trim());
        }
        else {
            chunks.push(text.trim());
        }
        const textChunks = chunks.map((chunk) => {
            const trimmedText = chunk.trim();
            const textChunk = {
                content: trimmedText,
                content_length: trimmedText.length,
                content_tokens: (0, gpt_3_encoder_1.encode)(trimmedText).length,
                embedding: [],
            };
            return textChunk;
        });
        if (textChunks.length > 1) {
            for (let i = 0; i < textChunks.length; ++i) {
                const chunk = textChunks[i];
                const prevChunk = textChunks[i - 1];
                if (prevChunk) {
                    if (chunk.content_tokens < MIN_CHUNK_SIZE &&
                        prevChunk.content_tokens + chunk.content_tokens <= MAX_CHUNK_SIZE) {
                        prevChunk.content += " " + chunk.content;
                        prevChunk.content_length += chunk.content_length;
                        prevChunk.content_tokens += chunk.content_tokens;
                        textChunks.splice(i, 1);
                        --i;
                    }
                }
            }
        }
        const chunkedSection = [...textChunks];
        return chunkedSection;
    }
    catch (err) {
        throw err;
    }
};
const generateEmbedding = async (inputFileName, client) => {
    try {
        console.log("Reading file...");
        const fileExtension = getFileExtension(inputFileName);
        console.log(fileExtension);
        const inputFilePath = __dirname + "/../embeddingData/" + inputFileName;
        let text = "";
        switch (fileExtension) {
            case "pdf": {
                // Read pdf
                let dataBuffer = fs_1.default.readFileSync(inputFilePath);
                await (0, pdf_parse_1.default)(dataBuffer).then((data) => {
                    text = data.text;
                });
                break;
            }
            case "txt": {
                // Read txt
                text = fs_1.default.readFileSync(inputFilePath, {
                    encoding: "utf-8",
                    flag: "r",
                });
                break;
            }
            default: {
                throw new Error("File extension invalid!");
            }
        }
        console.log("File read! Chunking data...");
        const chunkedText = await chunkText(text);
        const upsertPayload = [];
        console.log("Chunking complete, creating embeddings...", chunkedText.length);
        let count = 0;
        for (let i = 0; i < chunkedText.length; ++i) {
            const embedding = await (0, openAiHelper_1.createEmbedding)(chunkedText[i].content);
            if (i % 10 === 0)
                console.log(i + " done");
            upsertPayload.push({
                content: chunkedText[i].content,
                content_tokens: chunkedText[i].content_tokens,
                embedding,
            });
            ++count;
        }
        console.log("Embeddings created, storing to pinecone...");
        await pineconeHelper.upsert(upsertPayload, client);
        console.log("Stored " + count + " embeddings to pinecone!");
        return "Embeddings stored successfully!";
    }
    catch (err) {
        console.log("Error in generating embeddings - ", err.message);
        throw err;
    }
};
exports.default = generateEmbedding;
