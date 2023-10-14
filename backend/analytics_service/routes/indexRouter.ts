import express from "express";
import AnalyticsController from "../controllers/analyticsController";

const router = express.Router();

router.get("/", function (req: any, res: any) {
  res.status(200).json({ status: "OK", message: "Chatbot up and running!" });
});

router.get("/get-clients", AnalyticsController.getClients);
router.get("/get-users-by-client", AnalyticsController.getUsersByClient);
router.get("/get-chats-by-user", AnalyticsController.getChatsByUser);

export default router;
