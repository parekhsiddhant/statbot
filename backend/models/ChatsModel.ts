import mongoose from "mongoose";

const ChatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Chats", ChatsSchema);
