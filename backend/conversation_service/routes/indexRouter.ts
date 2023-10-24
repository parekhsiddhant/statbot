import express from "express";
import * as ChatbotController from "../controllers/embeddingsController";
import ConversationController from "../controllers/conversationController";

const router = express.Router();

router.get("/", function (req: any, res: any) {
  res.status(200).json({ status: "OK", message: "Chatbot up and running!" });
});

router.post(
  "/generateFileEmbeddings",
  ChatbotController.generateFileEmbeddings
);
router.post("/chatCompletion", ConversationController.handleUserMessage);

// router.post("/getContext", ConversationController.getContextForText);

export default router;
