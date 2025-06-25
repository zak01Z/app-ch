import { User } from "@/models/User"
import { Conversation } from "@/models/Conversation"

export async function assignConversationToAgent() {
  // Get all active agents
  const agents = await User.find({ role: "agent", status: "online" })

  if (agents.length === 0) {
    throw new Error("No active agents available")
  }

  // Simple round-robin assignment based on current workload
  const agentWorkloads = await Promise.all(
    agents.map(async (agent) => {
      const activeConversations = await Conversation.countDocuments({
        assignedAgent: agent._id,
        status: "active",
      })
      return { agent, workload: activeConversations }
    }),
  )

  // Sort by workload (ascending) and assign to agent with least workload
  agentWorkloads.sort((a, b) => a.workload - b.workload)

  return agentWorkloads[0].agent
}
