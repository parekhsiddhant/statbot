import dotenv from "dotenv";
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 } from "uuid";

dotenv.config({ path: __dirname + "/../.env" });
const pineconeKey = process.env["PINECONE_API_KEY"] || "";
const pineconeEnv = process.env["PINECONE_ENV"] || "";

const pineconeClient = new PineconeClient();
pineconeClient.init({
  environment: pineconeEnv,
  apiKey: pineconeKey,
});

interface UpsertData {
  content: string;
  content_tokens: number;
  embedding: Array<number>;
}

const upsert = async (data: Array<UpsertData>, client: string) => {
  try {
    const index = pineconeClient.Index(client);

    const vectors: Array<any> = data.map((chunk) => {
      return {
        id: v4().toString(),
        values: chunk.embedding,
        metadata: {
          content: chunk.content,
          content_tokens: chunk.content_tokens,
        },
      };
    });

    const upsertRequest = {
      vectors: vectors,
    };

    const upsertResponse = await index.upsert({ upsertRequest });
    return upsertResponse;
  } catch (err: any) {
    throw err;
  }
};
export { upsert };

const query = async (embed: Array<number>, client: string) => {
  try {
    const index = pineconeClient.Index(client);
    const queryRequest = {
      vector: embed,
      topK: 3,
      includeValues: false,
      includeMetadata: true,
    };

    const response = await index.query({ queryRequest });

    return response.matches;
  } catch (err: any) {
    throw err;
  }
};
export { query };
