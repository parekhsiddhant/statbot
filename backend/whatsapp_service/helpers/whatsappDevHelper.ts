import { Client, DefaultOptions } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import handleWhatsappMessage from "../controllers/whatsappDevController";

class WhatsappClient extends Client {
  constructor(options: any) {
    super(options);

    this.on("ready", () => {
      console.log("Whatsapp client is ready!");
    });

    this.on("qr", (qr: any) => {
      qrcode.generate(qr, { small: true });
    });

    this.on("message", (message) => {
      handleWhatsappMessage(message);
    });
  }
}

export { WhatsappClient, DefaultOptions };
