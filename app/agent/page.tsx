"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { ConversationList } from "@/components/conversation-list"
import { io, type Socket } from "socket.io-client"

interface Conversation {
  id: string
  customerPhone: string
  customerName: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  assignedAgent: string
}

interface Message {
  id: string
  conversationId: string
  content: string
  type: "text" | "image" | "audio"
  sender: "customer" | "agent"
  timestamp: Date
  mediaUrl?: string
}

export default function AgentDashboard() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      redirect("/login")
    }
    if (session.user.role !== "agent") {
      redirect("/admin")
    }

    // Initialize socket connection
    const newSocket = io("/api/socket")
    setSocket(newSocket)

    // Join agent room
    newSocket.emit("join-agent", session.user.id)

    // Listen for new messages
    newSocket.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message])
      // Update conversation list
      fetchConversations()
    })

    // Listen for conversation assignments
    newSocket.on("conversation-assigned", (conversation: Conversation) => {
      setConversations((prev) => [...prev, conversation])
    })

    fetchConversations()

    return () => {
      newSocket.close()
    }
  }, [session, status])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId)
    fetchMessages(conversationId)
  }

  const handleSendMessage = async (content: string, type: "text" | "image" | "audio", file?: File) => {
    if (!selectedConversation) return

    try {
      const formData = new FormData()
      formData.append("content", content)
      formData.append("type", type)
      formData.append("conversationId", selectedConversation)
      if (file) {
        formData.append("file", file)
      }

      const response = await fetch("/api/messages/send", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages((prev) => [...prev, newMessage])
        socket?.emit("message-sent", newMessage)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-300">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
        />
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
