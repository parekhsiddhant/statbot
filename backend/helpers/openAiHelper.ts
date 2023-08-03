import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config({ path: __dirname + "/../.env" });

const configuration = new Configuration({
  apiKey: process.env["OPENAI_API_KEY"],
});

const openAi = new OpenAIApi(configuration);

const createEmbedding = async (input: string) => {
  try {
    const embeddingRes = await openAi.createEmbedding({
      model: "text-embedding-ada-002",
      input: input,
    });

    const [{ embedding }] = embeddingRes.data.data;
    return embedding;
  } catch (err: any) {
    throw err;
  }
};
export { createEmbedding };

const createChatCompletion = async (chats: Array<any>) => {
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chats,
    });

    if (response.status === 200 && response?.data?.choices?.length) {
      const modelResponse = response.data.choices[0].message;
      let localChats: Array<any> = [...chats, modelResponse];
      return localChats;
    } else {
      console.log("Model did not respond - ", response);
      let localChats: Array<any> = [
        ...chats,
        { role: "assistant", content: "Error generating response." },
      ];
      return localChats;
    }
  } catch (err: any) {
    throw err;
  }
};
export { createChatCompletion };
