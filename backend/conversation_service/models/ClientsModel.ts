import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    context: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    authorizedUsers: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", ClientSchema);
