import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
const indexRouter = require("./routes/indexRouter");

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

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/", indexRouter);

app.all("*", function (req: any, res: any) {
  const data = {
    success: false,
    message: "URL not found!",
  };
  res.status(404).json(data);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
