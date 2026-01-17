import { Server } from "socket.io";

const SetupSockets = (app) => {
  const io = new Server(app.server, {
    cors: { origin: "*" },
    credentials: false,
  });
  io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
export default SetupSockets;
