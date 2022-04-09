import { join, resolve } from "path";

import { Server } from "socket.io";
import cors from "cors";
import { createServer } from "http";
import express from "express";

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const __dirname = resolve();

app.use(cors({ origin: "http://localhost:3001" }));

app.use(express.static(join(__dirname, "./build")));
app.get("/", function (req, res) {
  try {
    res.sendFile(join(__dirname, "./build/index.html"));
  } catch (err) {
    console.error(`Could not serve files: ${err}`);
    res.send(err).status(500);
  }
});

app.get("/rooms", (req, res) => {
  try {
    const rooms = {};
    io.sockets.adapter.rooms.forEach((value, key) => {
      rooms[key] = Array.from(value);
    });
    res.send(rooms);
  } catch (err) {
    console.error(`Could not get rooms for user: ${err}`);
    res.status(500).send();
  }
});

const io = new Server(server, {
  cors: { origin: ["http://localhost:3001"] },
}); // dev port is 3001 in package.json script

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (message, room = "") => {
    if (!room) socket.broadcast.emit("receive-message", message);
    else socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", async (room) => {
    await socket.join(room);
    socket.emit("joined-room", `You joined room ${room}`);
    socket.to(room).emit("joined-room", `${socket.id} joined room ${room}`);
  });
});

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
