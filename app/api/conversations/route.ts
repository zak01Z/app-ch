import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Conversation } from "@/models/Conversation"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let conversations
    if (session.user.role === "admin") {
      // Admin can see all conversations
      conversations = await Conversation.find({}).populate("assignedAgent", "name email").sort({ lastMessageTime: -1 })
    } else {
      // Agent can only see assigned conversations
      conversations = await Conversation.find({ assignedAgent: session.user.id }).sort({ lastMessageTime: -1 })
    }

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Fetch conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
