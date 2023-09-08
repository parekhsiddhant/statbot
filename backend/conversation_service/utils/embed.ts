import fs from "fs";
import { encode } from "gpt-3-encoder";
import { createEmbedding } from "../helpers/openAiHelper";
import * as pineconeHelper from "../helpers/pineconeHelper";

const MAX_CHUNK_SIZE = 400;
const MIN_CHUNK_SIZE = 200;

const chunkText = async (text: string) => {
  try {
    let chunks: Array<any> = [];

    if (encode(text).length > MAX_CHUNK_SIZE) {
      const split = text.split(".");
      let chunk = "";

      for (let i = 0; i < split.length; ++i) {
        const sentence = split[i];
        const sentenceTokenLength = encode(sentence).length;
        const chunkTextTokenLength = encode(chunk).length;

        const totalTokenLength = chunkTextTokenLength + sentenceTokenLength;
        if (
          totalTokenLength <= MAX_CHUNK_SIZE &&
          totalTokenLength > MIN_CHUNK_SIZE
        ) {
          if (chunk != "") chunks.push(chunk);
          chunk = "";
        }

        if (sentence && sentence !== "") {
          if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
            chunk += sentence + ". ";
          } else {
            chunk += sentence + " ";
          }
        }
      }

      chunks.push(chunk.trim());
    } else {
      chunks.push(text.trim());
    }

    const textChunks = chunks.map((chunk) => {
      const trimmedText = chunk.trim();
      const textChunk = {
        content: trimmedText,
        content_length: trimmedText.length,
        content_tokens: encode(trimmedText).length,
        embedding: [],
      };

      return textChunk;
    });

    if (textChunks.length > 1) {
      for (let i = 0; i < textChunks.length; ++i) {
        const chunk = textChunks[i];
        const prevChunk = textChunks[i - 1];

        if (prevChunk) {
          if (
            chunk.content_tokens < MIN_CHUNK_SIZE &&
            prevChunk.content_tokens + chunk.content_tokens <= MAX_CHUNK_SIZE
          ) {
            prevChunk.content += " " + chunk.content;
            prevChunk.content_length += chunk.content_length;
            prevChunk.content_tokens += chunk.content_tokens;
            textChunks.splice(i, 1);
            --i;
          }
        }
      }
    }

    const chunkedSection = [...textChunks];

    return chunkedSection;
  } catch (err: any) {
    throw err;
  }
};

const generateEmbedding = async (inputFileName: any, client: string) => {
  try {
    console.log("Reading file...");
    const inputFilePath = __dirname + "/../embeddingData/" + inputFileName;
    let text = fs.readFileSync(inputFilePath, {
      encoding: "utf-8",
      flag: "r",
    });

    console.log("File read! Chunking data...");

    const chunkedText = await chunkText(text);
    const upsertPayload: Array<any> = [];

    console.log("Chunking complete, creating embeddings...", chunkedText.length);

    let count = 0;
    for (let i = 0; i < chunkedText.length; ++i) {
      const embedding = await createEmbedding(chunkedText[i].content);
      if(i%10 === 0) console.log(i + " done");

      upsertPayload.push({
        content: chunkedText[i].content,
        content_tokens: chunkedText[i].content_tokens,
        embedding,
      });

      ++count;
    }

    console.log("Embeddings created, storing to pinecone...");

    await pineconeHelper.upsert(upsertPayload, client);

    console.log("Stored " + count + " embeddings to pinecone!");

    return "Embeddings stored successfully!";
  } catch (err: any) {
    console.log("Error in generating embeddings - ", err.message);
    throw err;
  }
};

export default generateEmbedding;
