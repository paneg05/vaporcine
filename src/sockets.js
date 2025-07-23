import { Server } from "socket.io";
export function setupSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: false,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Someone connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Someone disconnected: ${socket.id}`);
    });
  });
}
