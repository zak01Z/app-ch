import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Message } from "@/models/Message"
import { Conversation } from "@/models/Conversation"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const content = formData.get("content") as string
    const type = formData.get("type") as string
    const conversationId = formData.get("conversationId") as string
    const file = formData.get("file") as File | null

    await connectDB()

    // Get conversation details
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Check if agent is assigned to this conversation
    if (session.user.role === "agent" && conversation.assignedAgent.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized for this conversation" }, { status: 403 })
    }

    let mediaUrl = ""

    // Handle file upload for images/audio
    if (file && (type === "image" || type === "audio")) {
      // In a real implementation, you would upload to a cloud storage service
      // For now, we'll simulate this
      mediaUrl = `https://your-storage.com/${file.name}`
    }

    // Send message via WhatsApp API
    const whatsappResponse = await sendWhatsAppMessage(conversation.customerPhone, content, type, mediaUrl)

    // Save message to database
    const newMessage = new Message({
      conversationId,
      content,
      type,
      sender: "agent",
      timestamp: new Date(),
      mediaUrl,
      whatsappMessageId: whatsappResponse.messages[0].id,
    })

    await newMessage.save()

    // Update conversation
    conversation.lastMessage = content
    conversation.lastMessageTime = new Date()
    conversation.unreadCount = 0
    await conversation.save()

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
