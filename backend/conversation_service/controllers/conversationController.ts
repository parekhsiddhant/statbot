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
          latestUserMessage +
          " " +
          introduction +
          "\n\n" +
          `"${mergedContext}"`;

        payload.at(-1).content = queryWithContext;
      }

      const modelChats = await openAiHelper.createChatCompletion(payload);
      return modelChats;
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

      const modelInput = localChats.map((elem: any) => {
        return { ...elem };
      });
      // Get model response for user query
      const modelChats = await this.getModelResponse(
        modelInput,
        clientInfo.name,
        clientInfo.prompt
      );

      localChats.push(modelChats.at(-1));

      return APIResponse.successResponseWithData(
        res,
        "Got model response",
        localChats
      );
    } catch (err: any) {
      console.log("Error in getting model response - ", err.message);
      return APIResponse.errorResponse(res, err.message);
    }
  };

  getContextForText = async (req: any, res: any) => {
    try {
      const { text } = req.body;

      const embedding = await openAiHelper.createEmbedding(text);

      const clientName = "unfpa";

      // Semantic search on vector database
      const response: any = await pineconeHelper.query(embedding, clientName);

      // Create context for gpt to answer question
      let mergedContext = "";
      response.map((vector: any) => {
        mergedContext += vector.metadata.content;
      });

      return APIResponse.successResponseWithData(
        res,
        "Got context",
        mergedContext
      );
    } catch (err: any) {
      console.log(err);
      return APIResponse.errorResponse(res, err.message);
    }
  };
}

export default new ConversationController();
