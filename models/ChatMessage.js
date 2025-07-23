import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sender: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "farmer", "buyer"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
