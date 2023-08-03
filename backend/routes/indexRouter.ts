import express from "express";
import multer from "multer";
const ChatbotController = require("../controllers/chatbot");

const router = express.Router();

const serverStorage = multer.diskStorage({
  destination(req: any, file: any, callback: Function) {
    callback(null, "./uploads");
  },
  filename(req: any, file: any, callback: Function) {
    const originalFilename = file.originalname.split(" ").join("-");
    callback(null, `${Date.now()}-${originalFilename}`);
  },
});

const upload = multer({ storage: serverStorage });

router.get("/", function (req: any, res: any) {
  res.status(200).json({ status: "OK", message: "Chatbot up and running!" });
});

// router.post(
//   "/user-query",
//   upload.single("file"),
//   ChatbotController.answerUserQuery
// );
// router.post("/get-audio-from-text", ChatbotController.getAudioFromText);

router.post("/devapi", ChatbotController.devapi);
router.post("/generateFileEmbeddings", ChatbotController.generateFileEmbeddings);

module.exports = router;
