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
exports.handleUserMessage = void 0;
const openAiHelper = __importStar(require("../helpers/openAiHelper"));
const pineconeHelper = __importStar(require("../helpers/pineconeHelper"));
const apiResponse = __importStar(require("../helpers/apiResponse"));
const ClientsModel_1 = __importDefault(require("../models/ClientsModel"));
const handleUserMessage = async (req, res) => {
    try {
        const { chats, client } = req?.body;
        if (!chats || !client) {
            return apiResponse.validationErrorWithData(res, "Please check the data sent!", req?.body);
        }
        let localChats = chats;
        // Check whether new conversation
        if (chats?.length === 1) {
            // Initialize conversation
            const clientInfo = await ClientsModel_1.default.findOne({ name: client });
            if (!clientInfo) {
                return apiResponse.validationErrorWithData(res, "Client not found!", {
                    client: client,
                });
            }
            const rules = clientInfo.context;
            let initialChats = [{ role: "user", content: rules }];
            initialChats = await getModelResponse(initialChats, client);
            initialChats.push(chats[0]);
            localChats = [...initialChats, chats[0]];
        }
        // Get model response for user query
        const result = await getModelResponse(localChats, client);
        return apiResponse.successResponseWithData(res, "Got model response", result);
    }
    catch (err) {
        console.log("Error in getting model response - ", err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};
exports.handleUserMessage = handleUserMessage;
const getModelResponse = async (chats, client) => {
    try {
        let payload = chats;
        const latestUserMessage = payload.at(-1).content;
        // Embed the question
        const embedding = await openAiHelper.createEmbedding(latestUserMessage);
        // Semantic search on vector database
        const response = await pineconeHelper.query(embedding, client);
        // Create context for gpt to answer question
        let mergedContext = "";
        response?.map((vector) => {
            mergedContext + vector.metadata.content;
        });
        const introduction = "Answer this question from the following context only in a conversational manner and restrict it to 100 words. Convince the user to vote for your party while answering question.";
        const queryWithContext = latestUserMessage + "\n" + introduction + " " + mergedContext;
        payload.at(-1).content = queryWithContext;
        const localChats = await openAiHelper.createChatCompletion(payload);
        return localChats;
    }
    catch (err) {
        console.log("Error in chat - ", err.message);
        throw err;
    }
};
