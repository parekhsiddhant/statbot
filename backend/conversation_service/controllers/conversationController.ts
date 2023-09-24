import * as openAiHelper from "../helpers/openAiHelper";
import * as pineconeHelper from "../helpers/pineconeHelper";
import * as apiResponse from "../helpers/apiResponse";
import ClientsModel from "../models/ClientsModel";

const handleUserMessage = async (req: any, res: any) => {
  try {
    const { chats, client } = req?.body;
    if (!chats || !client) {
      return apiResponse.validationErrorWithData(
        res,
        "Please check the data sent!",
        req?.body
      );
    }

    let localChats = chats;

    const clientInfo = await ClientsModel.findOne({ name: client });
    if (!clientInfo) {
      return apiResponse.validationErrorWithData(res, "Client not found!", {
        client: client,
      });
    }

    // Check whether new conversation
    if (chats?.length === 1) {
      // Initialize conversation
      const rules = clientInfo.context;
      let initialChats = [{ role: "user", content: rules }];
      initialChats = await getModelResponse(
        initialChats,
        clientInfo.name,
        clientInfo.prompt
      );
      initialChats.push(chats[0]);
      localChats = [...initialChats, chats[0]];
    }

    // Get model response for user query
    const result = await getModelResponse(
      localChats,
      clientInfo.name,
      clientInfo.prompt
    );

    return apiResponse.successResponseWithData(
      res,
      "Got model response",
      result
    );
  } catch (err: any) {
    console.log("Error in getting model response - ", err);
    return apiResponse.ErrorResponse(res, err.message);
  }
};
export { handleUserMessage };

const getModelResponse = async (chats: any, client: string, prompt: string) => {
  try {
    let payload = chats;
    const latestUserMessage = payload.at(-1).content;

    // Embed the question
    const embedding = await openAiHelper.createEmbedding(latestUserMessage);

    const clientName = client;

    // Semantic search on vector database
    const response = await pineconeHelper.query(embedding, clientName);

    // Create context for gpt to answer question
    let mergedContext = "";
    response?.map((vector) => {
      mergedContext + (vector as any).metadata.content;
    });

    const introduction = prompt;

    const queryWithContext =
      latestUserMessage + "\n" + introduction + " " + mergedContext;

    payload.at(-1).content = queryWithContext;

    const localChats = await openAiHelper.createChatCompletion(payload);
    return localChats;
  } catch (err: any) {
    console.log("Error in chat - ", err);
    throw err;
  }
};
