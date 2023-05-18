import fs from "fs";
import util from "util";
const { Configuration, OpenAIApi } = require("openai");
const apiResponse = require("../helpers/apiResponse");
const textToSpeech = require("@google-cloud/text-to-speech");
const ttsClient = new textToSpeech.TextToSpeechClient();
const initialPrompt = require("./initial_prompt");

/**
 ***************** OPEN AI config START *******************************
 */
const configuration = new Configuration({
  apiKey: process.env["OPENAI_API_KEY"],
});
const openai = new OpenAIApi(configuration);
/**
 ***************** OPEN AI config END ********************************
 */

const transcribeAudio = async (chats: any, audioFilePath: any) => {
  try {
    console.log(audioFilePath);
    const res = await openai.createTranscription(
      fs.createReadStream(audioFilePath),
      "whisper-1",
      "StaTwig",
      "json",
      0,
      "en"
    );
    console.log(res?.status.res?.data);
    if (res.status === 200 && res?.data?.text) {
      console.log("Transcription - ", res.data);
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
    let payload = chats.map((chat: any) => JSON.parse(JSON.stringify(chat)));
    console.log("Chats before - ", chats);

    for (let i = 1; i < payload.length; ++i) {
      if (payload[i].role === "user") {
        payload[i].content =
          payload[i].content +
          " Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION.";
      }
    }

    console.log("Chats after - ", chats);

    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: payload,
    });
    if (res.status === 200 && res?.data?.choices?.length) {
      const modelResponse = res.data.choices[0].message;
      let localChats: Array<any> = [...chats, modelResponse];
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
    console.log("In here!", text);
    const payload = {
      input: { text: text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [res] = await ttsClient.synthesizeSpeech(payload);
    const writeFile = util.promisify(fs.writeFile);
    const fileName = Date.now() + "-output.mp3";
    await writeFile(`outputs/${fileName}`, res.audioContent, "binary");
    console.log("File written!");

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
        console.log("File deleted");
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
      console.log(err);
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
];
