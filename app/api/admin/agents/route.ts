import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { Conversation } from "@/models/Conversation"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const agents = await User.find({ role: "agent" }).select("name email status")

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const activeChats = await Conversation.countDocuments({
          assignedAgent: agent._id,
          status: "active",
        })

        const totalResolved = await Conversation.countDocuments({
          assignedAgent: agent._id,
          status: "resolved",
        })

        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          status: agent.status || "offline",
          activeChats,
          totalResolved,
        }
      }),
    )

    return NextResponse.json(agentsWithStats)
  } catch (error) {
    console.error("Admin agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
