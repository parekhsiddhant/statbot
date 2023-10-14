import APIResponse from "../helpers/apiResponse";
import * as openAiHelper from "../helpers/openAiHelper";
import * as pineconeHelper from "../helpers/pineconeHelper";
import ClientsModel from "../models/ClientsModel";

class ConversationController {
  private getModelResponse = async (
    chats: any,
    client: string,
    prompt: string
  ) => {
    try {
      let payload = chats;

      // Only embed user messages onwards
      if (payload.length > 1) {
        const latestUserMessage = payload.at(-1).content;

        // Embed the question
        const embedding = await openAiHelper.createEmbedding(latestUserMessage);

        const clientName = client;

        // Semantic search on vector database
        const response: any = await pineconeHelper.query(embedding, clientName);

        // Create context for gpt to answer question
        let mergedContext = "";
        response.map((vector: any) => {
          mergedContext += vector.metadata.content;
        });

        const introduction = prompt;

        const queryWithContext =
          latestUserMessage + "\n" + introduction + " " + mergedContext;

        payload.at(-1).content = queryWithContext;
      }

      const localChats = await openAiHelper.createChatCompletion(payload);
      return localChats;
    } catch (err: any) {
      throw err;
    }
  };

  handleUserMessage = async (req: any, res: any) => {
    try {
      const { chats, client } = req?.body;
      if (!chats || !client) {
        return APIResponse.validationErrorWithData(
          res,
          "Please check the data sent!",
          req?.body
        );
      }

      let localChats = chats;

      const clientInfo = await ClientsModel.findOne({ name: client });
      if (!clientInfo) {
        return APIResponse.validationErrorWithData(res, "Client not found!", {
          client: client,
        });
      }

      // Check whether new conversation
      if (chats?.length === 1) {
        // Initialize conversation
        const rules = clientInfo.context;
        let initialChats = [{ role: "user", content: rules }];
        initialChats = await this.getModelResponse(
          initialChats,
          clientInfo.name,
          clientInfo.prompt
        );
        initialChats.push(chats[0]);
        localChats = [...initialChats];
      }
      // Get model response for user query
      const result = await this.getModelResponse(
        localChats,
        clientInfo.name,
        clientInfo.prompt
      );

      return APIResponse.successResponseWithData(
        res,
        "Got model response",
        result
      );
    } catch (err: any) {
      console.log("Error in getting model response - ", err.message);
      return APIResponse.errorResponse(res, err.message);
    }
  };
}

export default new ConversationController();
