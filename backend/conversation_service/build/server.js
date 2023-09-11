"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const indexRouter_1 = __importDefault(require("./routes/indexRouter"));
dotenv_1.default.config({ path: __dirname + "/.env" });
const MONGODB_URL = process.env.MONGODB_URL || "";
mongoose_1.default
    .connect(MONGODB_URL)
    .then(() => {
    console.log("Connected to Mongo...");
})
    .catch((err) => {
    console.log("Error connecting to mongo - ", err);
    process.exit();
});
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use("/", indexRouter_1.default);
app.all("*", function (req, res) {
    const data = {
        success: false,
        message: "URL not found!",
    };
    res.status(404).json(data);
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
