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
const apiResponse_1 = __importDefault(require("../helpers/apiResponse"));
const openAiHelper = __importStar(require("../helpers/openAiHelper"));
const pineconeHelper = __importStar(require("../helpers/pineconeHelper"));
const ClientsModel_1 = __importDefault(require("../models/ClientsModel"));
class ConversationController {
    getModelResponse = async (chats, client, prompt) => {
        try {
            let payload = chats;
            // Only embed user messages onwards
            if (payload.length > 1) {
                const latestUserMessage = payload.at(-1).content;
                // Embed the question
                const embedding = await openAiHelper.createEmbedding(latestUserMessage);
                const clientName = client;
                // Semantic search on vector database
                const response = await pineconeHelper.query(embedding, clientName);
                // Create context for gpt to answer question
                let mergedContext = "";
                response.map((vector) => {
                    mergedContext += vector.metadata.content;
                });
                const introduction = prompt;
                const queryWithContext = latestUserMessage +
                    " " +
                    introduction +
                    "\n\n" +
                    `"${mergedContext}"`;
                console.log(queryWithContext);
                payload.at(-1).content = queryWithContext;
            }
            const modelChats = await openAiHelper.createChatCompletion(payload);
            return modelChats;
        }
        catch (err) {
            throw err;
        }
    };
    handleUserMessage = async (req, res) => {
        try {
            const { chats, client } = req?.body;
            if (!chats || !client) {
                return apiResponse_1.default.validationErrorWithData(res, "Please check the data sent!", req?.body);
            }
            let localChats = chats;
            const clientInfo = await ClientsModel_1.default.findOne({ name: client });
            if (!clientInfo) {
                return apiResponse_1.default.validationErrorWithData(res, "Client not found!", {
                    client: client,
                });
            }
            // Check whether new conversation
            if (chats?.length === 1) {
                // Initialize conversation
                const rules = clientInfo.context;
                let initialChats = [{ role: "user", content: rules }];
                initialChats = await this.getModelResponse(initialChats, clientInfo.name, clientInfo.prompt);
                initialChats.push(chats[0]);
                localChats = [...initialChats];
            }
            const modelInput = localChats.map((elem) => {
                return { ...elem };
            });
            // Get model response for user query
            const modelChats = await this.getModelResponse(modelInput, clientInfo.name, clientInfo.prompt);
            localChats.push(modelChats.at(-1));
            return apiResponse_1.default.successResponseWithData(res, "Got model response", localChats);
        }
        catch (err) {
            console.log("Error in getting model response - ", err.message);
            return apiResponse_1.default.errorResponse(res, err.message);
        }
    };
    getContextForText = async (req, res) => {
        try {
            const { text } = req.body;
            const embedding = await openAiHelper.createEmbedding(text);
            const clientName = "unfpa";
            // Semantic search on vector database
            const response = await pineconeHelper.query(embedding, clientName);
            // Create context for gpt to answer question
            let mergedContext = "";
            response.map((vector) => {
                mergedContext += vector.metadata.content;
            });
            return apiResponse_1.default.successResponseWithData(res, "Got context", mergedContext);
        }
        catch (err) {
            console.log(err);
            return apiResponse_1.default.errorResponse(res, err.message);
        }
    };
}
exports.default = new ConversationController();
