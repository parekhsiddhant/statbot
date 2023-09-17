import dotenv from "dotenv";
import ChatsModel from "../models/ChatsModel";
import ClientsModel from "../models/ClientsModel";
import axios from "axios";
import UserModel from "../models/UserModel";

dotenv.config({ path: __dirname + "/../.env" });

const updateUserConversation = async (userId: any, localChats: any) => {
  try {
    const updatedChat = await ChatsModel.findOneAndUpdate(
      { userId: userId, client: process.env["CLIENT"] },
      { $set: { chats: localChats } },
      { new: true }
    );
    return updatedChat;
  } catch (err) {
    console.log("Error in updating user conversation - ", err);
    throw err;
  }
};

const checkForExcessiveMessages = (chats: any) => {
  try {
    // Check whether pending call exists & Check how long ago it was
    const lastMessage = chats?.chats?.at(-1);
    const updatedAt = new Date(chats?.updatedAt);
    const now = new Date();
    const timeDifferenceInMinutes =
      (now.getTime() - updatedAt.getTime()) / (1000 * 60);

    if (lastMessage.role === "user" && timeDifferenceInMinutes < 1) {
      return true;
    }

    return false;
  } catch (err) {
    throw err;
  }
};

const handleWhatsappMessage = async (message: any) => {
  try {
    // Check whether user is authorized
    const isUserAuthorized = await ClientsModel.findOne({
      name: process.env["CLIENT"],
      authorizedUsers: message.from,
    });

    if (isUserAuthorized) {
      // Fetch user if exists
      console.log("Got message from - ", message.from);
      let user = await UserModel.findOne({
        phone: message.from,
        source: "whatsapp",
      });

      // Create new user if does not exist
      if (!user) {
        user = new UserModel({
          phone: message.from,
          source: "whatsapp",
        });
        await user.save();
      }

      let chats = await ChatsModel.findOne({
        userId: user._id,
        client: process.env["CLIENT"],
      });

      if (chats) {
        // Check whether a pending message is there
        const isSpamming = checkForExcessiveMessages(chats);
        if (isSpamming) {
          message.reply("Wait for your earlier request to be fulfiled.");
          return;
        }
      } else {
        chats = new ChatsModel({
          userId: user._id,
          client: process.env["CLIENT"],
          chats: [],
        });
        await chats.save();
      }

      const userMessage = {
        role: "user",
        content: message?.body,
      };
      const localChats = [...chats.chats, userMessage];

      // Update conversation in DB
      const updatedChats = await updateUserConversation(user._id, localChats);

      // Call conversation service
      const modelResponse = await axios.post(
        "http://localhost:4000/chatCompletion",
        {
          chats: updatedChats?.chats,
          client: process.env["CLIENT"],
        }
      );

      if (modelResponse.status === 200) {
        // Reply to message
        const modelChats = modelResponse.data.data;
        const latestMessage = modelChats.at(-1);
        updateUserConversation(user._id, modelChats);
        message.reply(latestMessage.content);
        return;
      } else {
        // Handle retry/waiting in case of overload or error
        const errorMessage = {
          role: "system",
          content:
            "We are overloaded at the moment, please try after some time.",
        };
        updateUserConversation(user._id, [...localChats, errorMessage]);
        message.reply(errorMessage.content);
        return;
      }
    }
  } catch (err) {
    console.log(err);
    message.reply("Some error occurred, please try again after some time.");
  }
};

export default handleWhatsappMessage;
