import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ path: __dirname + "/../.env" });

const configuration = {
  apiKey: process.env["OPENAI_API_KEY"],
};

const openAi = new OpenAI(configuration);

const createEmbedding = async (input: string) => {
  try {
    const embeddingRes = await openAi.embeddings.create({
      model: "text-embedding-ada-002",
      input: input,
    });

    const [{ embedding }] = embeddingRes.data;
    return embedding;
  } catch (err: any) {
    throw err;
  }
};
export { createEmbedding };

const createChatCompletion = async (chats: Array<any>) => {
  try {
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chats,
      temperature: 1,
      max_tokens: 256,
      top_p: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const modelResponse = response.choices[0].message;
    let localChats: Array<any> = [...chats, modelResponse];
    return localChats;
  } catch (err: any) {
    throw err;
  }
};
export { createChatCompletion };
