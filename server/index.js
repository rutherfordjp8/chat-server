const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3001" } }); // dev port is 3001 in package.json script

const PORT = process.env.PORT || 3000;

console.log("CURENT ENV", process.env.NODE_ENV, "port", process.env.PORT);
app.use(express.static(path.join(__dirname, "../build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// app.get("/rooms", (req, res) => {
//   // console.log(typeof io.sockets.adapter.rooms);
//   // res.status(200).send(JSON.stringify(io.sockets.adapter.rooms));
//   const a = io.sockets.adapter.rooms.values();
//   // console.log(a);
//   res.json(Array.from(a));
// });

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
    socket.join(room);
    socket.to(room).emit("joined-room", `${socket.id} joined room ${room}`);
  });
});

server.listen(PORT, () => {
  console.log("listening on http://localhost:3000");
});
