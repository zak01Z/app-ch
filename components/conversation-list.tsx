"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  customerPhone: string
  customerName: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  assignedAgent: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onConversationSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedConversation, onConversationSelect }: ConversationListProps) {
  return (
    <div className="h-full bg-white border-r">
      <div className="p-4 border-b bg-green-600 text-white">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              selectedConversation === conversation.id ? "bg-green-50 border-l-4 border-l-green-600" : ""
            }`}
            onClick={() => onConversationSelect(conversation.id)}
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.customerName}`} />
                <AvatarFallback>{conversation.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.customerName}</h3>
                  <div className="flex items-center space-x-2">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                <p className="text-xs text-gray-400 mt-1">{conversation.customerPhone}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
