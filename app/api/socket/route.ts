import type { NextRequest } from "next/server"
import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiResponse } from "next"

export const config = {
  api: {
    bodyParser: false,
  },
}

interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

const SocketHandler = (req: NextRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join-agent", (agentId) => {
        socket.join(`agent-${agentId}`)
        console.log(`Agent ${agentId} joined room`)
      })

      socket.on("message-sent", (message) => {
        // Broadcast to all connected clients
        socket.broadcast.emit("new-message", message)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }
  res.end()
}

export default SocketHandler
