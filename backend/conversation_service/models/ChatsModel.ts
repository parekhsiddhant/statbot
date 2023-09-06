import mongoose from "mongoose";

const ChatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
    },
    chats: [
      {
        _id: false,
        role: String,
        content: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ChatsModel = mongoose.model("Chats", ChatsSchema);

export default ChatsModel;
