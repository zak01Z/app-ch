import mongoose from "mongoose"

const ConversationSchema = new mongoose.Schema(
  {
    customerPhone: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "pending"],
      default: "active",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema)
