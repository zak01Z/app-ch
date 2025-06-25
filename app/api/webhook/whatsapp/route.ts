import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Conversation } from "@/models/Conversation"
import { Message } from "@/models/Message"
import { assignConversationToAgent } from "@/lib/agent-router"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!")
    return new NextResponse(challenge)
  } else {
    console.log("Webhook verification failed")
    return new NextResponse("Forbidden", { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process WhatsApp webhook payload
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            await processMessage(change.value)
          }
        }
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processMessage(messageData: any) {
  await connectDB()

  if (messageData.messages) {
    for (const message of messageData.messages) {
      const customerPhone = message.from
      const messageContent = message.text?.body || message.image?.caption || message.audio?.id || ""
      const messageType = message.type // text, image, audio, etc.

      // Find or create conversation
      let conversation = await Conversation.findOne({ customerPhone })

      if (!conversation) {
        // Create new conversation and assign to agent
        const assignedAgent = await assignConversationToAgent()

        conversation = new Conversation({
          customerPhone,
          customerName: messageData.contacts?.[0]?.profile?.name || customerPhone,
          assignedAgent: assignedAgent._id,
          status: "active",
          lastMessageTime: new Date(),
        })
        await conversation.save()
      }

      // Create message record
      const newMessage = new Message({
        conversationId: conversation._id,
        content: messageContent,
        type: messageType,
        sender: "customer",
        timestamp: new Date(Number.parseInt(message.timestamp) * 1000),
        whatsappMessageId: message.id,
      })

      if (message.image) {
        newMessage.mediaUrl = message.image.id
      } else if (message.audio) {
        newMessage.mediaUrl = message.audio.id
      }

      await newMessage.save()

      // Update conversation
      conversation.lastMessage = messageContent
      conversation.lastMessageTime = new Date()
      conversation.unreadCount += 1
      await conversation.save()

      // Emit real-time update to assigned agent
      // This would be handled by your Socket.IO implementation
      console.log(`New message for agent ${conversation.assignedAgent}:`, messageContent)
    }
  }
}
