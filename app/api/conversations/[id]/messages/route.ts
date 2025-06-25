import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Message } from "@/models/Message"
import { Conversation } from "@/models/Conversation"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Check if user has access to this conversation
    const conversation = await Conversation.findById(params.id)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (session.user.role === "agent" && conversation.assignedAgent.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const messages = await Message.find({ conversationId: params.id }).sort({ timestamp: 1 })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Fetch messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
