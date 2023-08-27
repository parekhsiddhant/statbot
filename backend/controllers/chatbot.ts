const { Configuration, OpenAIApi } = require("openai");
const apiResponse = require("../helpers/apiResponse");
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const ChatsModel = require("../models/ChatsModel");
const ContextModel = require("../models/ContextModel");

const authorizedUsers = [
  "917719992025@c.us",
  "919739537793@c.us",
  "919989348399@c.us",
  "919160389999@c.us",
];

const whatsappClient = new Client();

whatsappClient.on("qr", (qr: any) => {
  qrcode.generate(qr, { small: true });
});

whatsappClient.on("ready", () => {
  console.log("Client is ready!");
});

whatsappClient.initialize();

whatsappClient.on("message", async (message: any) => {
  if (authorizedUsers.includes(message.from)) {
    const response = await handleWhatsappMessage(message);
    console.log("Got response for user");
    if (response) whatsappClient.sendMessage(message.from, response);
    else
      whatsappClient.sendMessage(
        message.from,
        "Some error occured, please try again!"
      );
  }
});

const handleWhatsappMessage = async (message: any) => {
  try {
    // Is authorized user
    const sender = message?.from;
    const messageBody = message?.body;

    console.log("Message from ", sender);
    let chatsArray;
    const existingChat = await ChatsModel.findOne({
      userId: sender,
      client: process.env["CLIENT"],
    });
    if (existingChat) {
      chatsArray = existingChat.chats;
      if (chatsArray.at(-1).role === "user") {
        return "Please wait for your first question to be processed!";
      }
      chatsArray.push({ role: "user", content: messageBody });
      const updatedChat = await ChatsModel.findOneAndUpdate(
        { userId: sender, client: process.env["CLIENT"] },
        { chats: chatsArray },
        { new: true }
      );
      chatsArray = updatedChat.chats;
    } else {
      const initialPrompt = await ContextModel.findOne({
        client: process.env["CLIENT"],
      });

      const chats = [{ role: "user", content: initialPrompt.context }];
      const initialChats = await getModelResponse(chats);

      initialChats.push({ role: "user", content: messageBody });

      const newChat = new ChatsModel({
        userId: sender,
        client: process.env["CLIENT"],
        chats: initialChats,
      });
      await newChat.save();

      chatsArray = newChat.chats;
    }

    if (chatsArray.length && chatsArray.at(-1).role === "user") {
      const result = await getModelResponse(chatsArray);
      const updatedChat = await ChatsModel.findOneAndUpdate(
        { userId: sender, client: process.env["CLIENT"] },
        { $push: { chats: result.at(-1) } },
        { new: true }
      );

      return result.at(-1).content;
    }
  } catch (err: any) {
    console.log(err);
  }
};

const getModelResponse = async (chats: any) => {
  try {
    let payload = chats;

    // if (payload.at(-1).role === "user")
    //   payload.at(-1).content =
    //     payload.at(-1).content +
    //     " Only answer questions related to Telugu Desam Party & its members.";

    const configuration = new Configuration({
      apiKey: process.env["OPENAI_API_KEY"],
    });
    const openai = new OpenAIApi(configuration);

    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: payload,
    });
    if (res.status === 200 && res?.data?.choices?.length) {
      const modelResponse = res.data.choices[0].message;
      let localChats: Array<any> = [...chats, modelResponse];
      return localChats;
    } else {
      console.log("Model did not respond - ", res);
      let localChats: Array<any> = [
        ...chats,
        { role: "assistant", content: "Error generating response." },
      ];
      return localChats;
    }
    return [];
  } catch (err) {
    console.log("Error in chat - ", err);
    throw err;
  }
};

const devapi = [
  async function (req: any, res: any) {
    try {
      const message = req.body;
      const response = await handleWhatsappMessage(message);

      return apiResponse.successResponseWithData(res, "Success", {
        response: response,
      });
    } catch (err: any) {
      console.log(err.message);
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
];
export { devapi };
