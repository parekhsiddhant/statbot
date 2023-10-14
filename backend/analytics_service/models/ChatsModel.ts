import mongoose from "mongoose";

const ChatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: false,
    },
    client: {
      type: String,
      required: true,
      unique: false,
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

ChatsSchema.index({ userId: 1, client: 1 }, { unique: true });

export default mongoose.model("Chats", ChatsSchema);
