import mongoose from "mongoose";

const ContextSchema = new mongoose.Schema(
  {
    client: {
      type: String,
      required: true,
      unique: true,
    },
    context: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Context", ContextSchema);
