import fs from "fs";
import util from "util";
const { Configuration, OpenAIApi } = require("openai");
const apiResponse = require("../helpers/apiResponse");
const textToSpeech = require("@google-cloud/text-to-speech");
const ttsClient = new textToSpeech.TextToSpeechClient();
const initialPrompt = require("./initial_prompt");
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const ChatsModel = require("../models/ChatsModel");

const authorizedUsers = ["917719992025@c.us", "919739537793@c.us"];

const whatsappClient = new Client();

whatsappClient.on("qr", (qr: any) => {
  qrcode.generate(qr, { small: true });
});

whatsappClient.on("ready", () => {
  console.log("Client is ready!");
});

whatsappClient.initialize();

whatsappClient.on("message", async (message: any) => {
  console.log(message);
  if (authorizedUsers.includes(message.from)) {
    const response = await handleWhatsappMessage(message);
    console.log("Got response for user - ", response);
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

    console.log("Message from ", sender, " - ", messageBody);
    let chatsArray;
    const existingChat = await ChatsModel.findOne({
      userId: sender,
      source: "whatsapp",
    });
    if (existingChat) {
      chatsArray = existingChat.chats;
      if (chatsArray.at(-1).role === "user") {
        return "Please wait for your first question to be processed!";
      }
      chatsArray.push({ role: "user", content: messageBody });
      const updatedChat = await ChatsModel.findOneAndUpdate(
        { userId: sender, source: "whatsapp" },
        { chats: chatsArray },
        { new: true }
      );
      chatsArray = updatedChat.chats;
    } else {
      const chats = [
        {
          role: "user",
          content:
            "Your name is Sarita and you are an assistant for Telugu Desam Party. You will answer questions related to Telugu Desam Party only. For any question which is not related, you will reply Out of Context. Do not justify your answers or reveal your real identity.",
        },
      ];
      const initialChats = await getModelResponse(chats);
      initialChats.push({ role: "user", content: messageBody });

      const newChat = new ChatsModel({
        userId: sender,
        source: "whatsapp",
        chats: initialChats,
      });
      await newChat.save();

      chatsArray = newChat.chats;
    }

    if (chatsArray.length && chatsArray.at(-1).role === "user") {
      const result = await getModelResponse(chatsArray);
      const updatedChat = await ChatsModel.findOneAndUpdate(
        { userId: sender, source: "whatsapp" },
        { $push: { chats: result.at(-1) } },
        { new: true }
      );

      return result.at(-1).content;
    }
  } catch (err: any) {
    console.log(err);
  }
};

const transcribeAudio = async (chats: any, audioFilePath: any) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env["OPENAI_API_KEY"],
    });
    const openai = new OpenAIApi(configuration);
    const res = await openai.createTranscription(
      fs.createReadStream(audioFilePath),
      "whisper-1",
      "StaTwig",
      "json",
      0,
      "en"
    );
    if (res.status === 200 && res?.data?.text) {
      let message = res.data.text;
      const chat = {
        role: "user",
        content: message,
      };
      let localChats = [...chats, chat];
      return localChats;
    }
  } catch (err) {
    console.log("Error in transcribe - ", err);
    throw err;
  }
};

const getModelResponse = async (chats: any) => {
  try {
    let payload = chats;

    if (payload.at(-1).role === "user")
      payload.at(-1).content =
        payload.at(-1).content +
        " Only answer questions related to Telugu Desam Party.";

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

const googleTTS = async (text: any) => {
  try {
    const payload = {
      input: { text: text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [res] = await ttsClient.synthesizeSpeech(payload);
    const writeFile = util.promisify(fs.writeFile);
    const fileName = Date.now() + "-output.mp3";
    await writeFile(`outputs/${fileName}`, res.audioContent, "binary");

    return fileName;
  } catch (err) {
    console.log("Error in TTS - ", err);
    throw err;
  }
};

exports.answerUserQuery = [
  async function (req: any, res: any) {
    try {
      const dir = `uploads`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const audioFilePath = req.file.path;
      const originalChats = JSON.parse(req.body.chats);
      let chats = [...originalChats];

      if (!chats?.length) {
        chats = [{ role: "user", content: initialPrompt.default }];
        const initialChats = await getModelResponse(chats);
        chats = [...initialChats];
      }

      const asrResult = await transcribeAudio(chats, audioFilePath);

      const openAiResult = await getModelResponse(asrResult);

      fs.unlink(audioFilePath, (err) => {
        if (err) throw err;
      });

      return apiResponse.successResponseWithData(res, "Success", {
        chats: openAiResult,
      });
    } catch (err: any) {
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
];

exports.getAudioFromText = [
  async function (req: any, res: any) {
    try {
      const dir = `outputs`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const text = req.body?.text || null;
      if (!text || text == "") {
        throw new Error("Text not provided!");
      }

      const ttsFilename = await googleTTS(text);
      res.set("Content-Type", "audio/mpeg");
      res.set("Content-Disposition", `attachment; filename="${ttsFilename}"`);
      res.sendFile(ttsFilename, { root: "outputs" });
    } catch (err: any) {
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
];

// exports.devapi = [
//   async function (req: any, res: any) {
//     try {
//       console.log(req.body.chats);
//       const originalChats = JSON.parse(req.body.chats);
//       let chats = [...originalChats];

//       if (chats?.length) {
//         const response = await getModelResponse(chats);
//         chats = [...response];
//       }

//       return apiResponse.successResponseWithData(res, "Success", {
//         chats: chats,
//       });
//     } catch (err: any) {
//       console.log(err);
//       return apiResponse.ErrorResponse(res, err.message);
//     }
//   },
// ];
