import dotenv from "dotenv";
import mongoose from "mongoose";
import { WhatsappClient, DefaultOptions } from "./helpers/whatsappDevHelper";

dotenv.config({ path: __dirname + "/.env" });

const MONGODB_URL = process.env.MONGODB_URL || "";
mongoose
  .connect(MONGODB_URL, {
    keepAlive: true,
  })
  .then(() => {
    console.log("Connected to Mongo...");
  })
  .catch((err) => {
    console.log("Error connecting to mongo - ", err);
    process.exit();
  });

const whatsappClient = new WhatsappClient(DefaultOptions);
whatsappClient.initialize();
