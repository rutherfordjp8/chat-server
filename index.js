const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "http://localhost:3001" } });

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (message, room = "") => {
    console.log(message, room);
    if (!room) socket.broadcast.emit("receive-message", message);
    else socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room) => {
    console.log("joining room", room, socket.id);
    socket.join(room);
  });
});

server.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
