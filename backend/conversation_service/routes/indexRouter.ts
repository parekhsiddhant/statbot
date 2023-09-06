import express from "express";
import multer from "multer";
import * as ChatbotController from "../controllers/chatbot";
import * as ConversationController from "../controllers/conversationController";

const router = express.Router();

router.get("/", function (req: any, res: any) {
  res.status(200).json({ status: "OK", message: "Chatbot up and running!" });
});

router.post("/devapi", ChatbotController.devapi);
router.post(
  "/generateFileEmbeddings",
  ChatbotController.generateFileEmbeddings
);
router.post("/chatCompletion", ConversationController.handleUserMessage);

export default router;
