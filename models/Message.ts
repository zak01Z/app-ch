import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "audio"],
      required: true,
    },
    sender: {
      type: String,
      enum: ["customer", "agent"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    mediaUrl: {
      type: String,
    },
    whatsappMessageId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema)
