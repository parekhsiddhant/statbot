import generateEmbedding from "../utils/embed";
import * as openAiHelper from "../helpers/openAiHelper";
import * as pineconeHelper from "../helpers/pineconeHelper";
import rules from "./rules";
import * as apiResponse from "../helpers/apiResponse";
// import qrcode from "qrcode-terminal";
// import { Client } from "whatsapp-web.js";
import ChatsModel from "../models/ChatsModel";

const authorizedUsers = [
  "917719992025@c.us",
  "919739537793@c.us",
  "919989348399@c.us",
];

const TOKEN_LIMIT_GPT = 4096 - 500;

// const whatsappClient = new Client();

// whatsappClient.on("qr", (qr: any) => {
//   qrcode.generate(qr, { small: true });
// });

// whatsappClient.on("ready", () => {
//   console.log("Client is ready!");
// });

// whatsappClient.initialize();

// whatsappClient.on("message", async (message: any) => {
//   try {
//     if (authorizedUsers.includes(message.from)) {
//       const response = await handleWhatsappMessage(message);
//       console.log("Got response for user");
//       if (response) whatsappClient.sendMessage(message.from, response);
//       else
//         whatsappClient.sendMessage(
//           message.from,
//           "Some error occured, please try again!"
//         );
//     }
//   } catch (err) {
//     console.log("Returning error to user");
//     whatsappClient.sendMessage(
//       message.from,
//       "Some error occured, please try again!"
//     );
//   }
// });

const handleWhatsappMessage = async (message: any) => {
  try {
    // Is authorized user
    const sender = message?.from;
    const messageBody = message?.body;

    console.log("Message from ", sender);
    let chatsArray;
    const existingChat = await ChatsModel.findOne({
      userId: sender,
      source: "whatsapp",
    });
    if (existingChat) {
      chatsArray = existingChat.chats;
      if (
        chatsArray.length &&
        chatsArray[chatsArray.length - 1].role === "user"
      ) {
        return "Please wait for your first question to be processed!";
      }
      chatsArray.push({ role: "user", content: messageBody });
      const updatedChat = await ChatsModel.findOneAndUpdate(
        { userId: sender, source: "whatsapp" },
        { chats: chatsArray },
        { new: true }
      );
      if (!updatedChat) throw new Error("Could not update conversation in DB!");
      chatsArray = updatedChat.chats;
    } else {
      const chats = [{ role: "user", content: rules }];
      const initialChats = await getModelResponse(chats);

      initialChats.push({ role: "user", content: messageBody });

      const newChat = new ChatsModel({
        userId: sender,
        source: "whatsapp",
        chats: initialChats,
      });
      await newChat.save();
      if (!newChat) throw new Error("Could not update conversation in DB!");

      chatsArray = newChat.chats;
    }

    if (
      chatsArray.length &&
      chatsArray[chatsArray.length - 1].role === "user"
    ) {
      const result = await getModelResponse(chatsArray);
      const updatedChat = await ChatsModel.findOneAndUpdate(
        { userId: sender, source: "whatsapp" },
        { $push: { chats: result.at(-1) } },
        { new: true }
      );

      return result.at(-1).content;
    }
  } catch (err: any) {
    console.log(err.message);
    throw err;
  }
};

const getModelResponse = async (chats: any) => {
  try {
    let payload = chats;
    const latestUserMessage = payload.at(-1).content;

    // Embed the question
    const embedding = await openAiHelper.createEmbedding(latestUserMessage);

    // Semantic search on vector database
    const response = await pineconeHelper.query(embedding);

    console.log("Semantic search response - ", response);

    // Create context for gpt to answer question
    let mergedContext = "";
    response?.map((vector) => {
      mergedContext + (vector as any).metadata.content;
    });

    const introduction =
      "Answer this question from the following context only in a conversational manner. Convince the user to vote for your party while answering question.";
    const queryWithContext =
      latestUserMessage + "\n" + introduction + " " + mergedContext;

    payload.at(-1).content = queryWithContext;

    const localChats = await openAiHelper.createChatCompletion(payload);
    return localChats;
  } catch (err: any) {
    console.log("Error in chat - ", err.message);
    throw err;
  }
};

const devapi = [
  async function (req: any, res: any) {
    try {
      const message = req.body;
      console.log(message);
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

const generateFileEmbeddings = [
  async (req: any, res: any) => {
    try {
      await generateEmbedding("bjp_input.txt");

      return apiResponse.successResponseWithData(
        res,
        "Successfully completed!",
        {}
      );
    } catch (err: any) {
      console.log("Error - ", err.message);
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
];
export { generateFileEmbeddings };
