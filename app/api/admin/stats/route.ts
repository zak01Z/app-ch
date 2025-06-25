import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Conversation } from "@/models/Conversation"
import { User } from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [totalConversations, activeAgents, pendingMessages, resolvedToday] = await Promise.all([
      Conversation.countDocuments({}),
      User.countDocuments({ role: "agent", status: "online" }),
      Conversation.countDocuments({ unreadCount: { $gt: 0 } }),
      Conversation.countDocuments({
        status: "resolved",
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ])

    return NextResponse.json({
      totalConversations,
      activeAgents,
      pendingMessages,
      resolvedToday,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
