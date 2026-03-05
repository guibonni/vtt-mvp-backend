import { io } from "../server"

export function initializeSocket() {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id)

    socket.on("join-session", (sessionId: string) => {

      socket.join(sessionId)

      console.log(`Socket ${socket.id} joined session ${sessionId}`)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)
    })

  })

}