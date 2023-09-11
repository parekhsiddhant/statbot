"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultOptions = exports.WhatsappClient = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
Object.defineProperty(exports, "DefaultOptions", { enumerable: true, get: function () { return whatsapp_web_js_1.DefaultOptions; } });
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const whatsappDevController_1 = __importDefault(require("../controllers/whatsappDevController"));
class WhatsappClient extends whatsapp_web_js_1.Client {
    constructor(options) {
        super(options);
        this.on("ready", () => {
            console.log("Whatsapp client is ready!");
        });
        this.on("qr", (qr) => {
            qrcode_terminal_1.default.generate(qr, { small: true });
        });
        this.on("message", (message) => {
            (0, whatsappDevController_1.default)(message);
        });
    }
}
exports.WhatsappClient = WhatsappClient;
