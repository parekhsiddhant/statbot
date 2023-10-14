import express from "express";
import APIResponse from "../helpers/apiResponse";
import ClientsModel from "../models/ClientsModel";
import ChatsModel from "../models/ChatsModel";

class AnalyticsContoller {
  private getUsers = async (client: string) => {
    try {
      // Group by users
      const chats = await ChatsModel.find({ client: client });
    } catch (err: any) {
      throw err;
    }
  };

  getClients = async (req: express.Request, res: express.Response) => {
    try {
      const clients = await ClientsModel.find();
      return APIResponse.successResponseWithData(
        res,
        "Clients fetched!",
        clients
      );
    } catch (err: any) {
      console.log(err);
      return APIResponse.errorResponse(res, err.message);
    }
  };

  getUsersByClient = async (req: express.Request, res: express.Response) => {
    try {
      const { clientId } = req.query;
      const client = await ClientsModel.findById(clientId);
      const users = this.getUsers(client?.name || "");
      return APIResponse.successResponseWithData(res, "Users fetched!", users);
    } catch (err: any) {
      console.log(err);
      return APIResponse.errorResponse(res, err.message);
    }
  };

  getChatsByUser = async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.query;
      const chats = await ChatsModel.find({ userId: userId });
      return APIResponse.successResponseWithData(res, "Chats fetched!", chats);
    } catch (err: any) {
      console.log(err);
      return APIResponse.errorResponse(res, err.message);
    }
  };
}

export default new AnalyticsContoller();
