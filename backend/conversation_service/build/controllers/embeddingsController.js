"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileEmbeddings = void 0;
const embed_1 = __importDefault(require("../utils/embed"));
const apiResponse_1 = __importDefault(require("../helpers/apiResponse"));
const generateFileEmbeddings = [
    async (req, res) => {
        try {
            const { inputFileName, client } = req.body;
            await (0, embed_1.default)(inputFileName, client);
            return apiResponse_1.default.successResponseWithData(res, "Successfully completed!", {});
        }
        catch (err) {
            console.log("Error - ", err.message);
        }
    },
];
exports.generateFileEmbeddings = generateFileEmbeddings;
