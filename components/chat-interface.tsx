"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Mic } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  conversationId: string
  content: string
  type: "text" | "image" | "audio"
  sender: "customer" | "agent"
  timestamp: Date
  mediaUrl?: string
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string, type: "text" | "image" | "audio", file?: File) => void
  conversationId: string
}

export function ChatInterface({ messages, onSendMessage, conversationId }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendText = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, "text")
      setInputValue("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const type = file.type.startsWith("image/") ? "image" : "audio"
      onSendMessage(file.name, type, file)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  return (
    <div className="flex flex-col h-full whatsapp-bg">
      {/* Chat Header */}
      <div className="p-4 bg-green-600 text-white border-b">
        <h3 className="font-semibold">Customer Chat</h3>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "agent" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "agent" ? "bg-green-500 text-white" : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                {message.type === "text" && <p className="text-sm">{message.content}</p>}
                {message.type === "image" && (
                  <div>
                    <img
                      src={message.mediaUrl || "/placeholder.svg?height=200&width=200"}
                      alt="Shared image"
                      className="rounded-lg max-w-full h-auto"
                    />
                    {message.content && <p className="text-sm mt-2">{message.content}</p>}
                  </div>
                )}
                {message.type === "audio" && (
                  <div className="flex items-center space-x-2">
                    <Mic className="h-4 w-4" />
                    <span className="text-sm">Audio message</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendText} className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,audio/*" onChange={handleFileUpload} className="hidden" />
      </div>
    </div>
  )
}
