import express from "express";
const ChatbotController = require("../controllers/chatbot");

const router = express.Router();

router.get("/", function (req: any, res: any) {
  res.status(200).json({ status: "OK", message: "Chatbot up and running!" });
});

// router.post("/devapi", ChatbotController.devapi);

module.exports = router;
