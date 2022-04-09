import "./App.css";

import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

import { DefaultEventsMap } from "socket.io/dist/typed-events";
import axios from "axios";

const MESSAGE_STYLES = {
  from: { alignSelf: "flex-end", bgcolor: "#1876d1" },
  to: { alignSelf: "flex-start", bgcolor: "gray" },
  JOINED_ROOM: { alignSelf: "center", textAlign: "center", bgcolor: "blue" },
};

const PORT = process.env.PORT || 3000;
const WEBSOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://rutherfordjp-chat-app.herokuapp.com"
    : `http://localhost:${PORT}`;

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://rutherfordjp-chat-app.herokuapp.com"
    : `http://localhost:3000`;

type Message = {
  message: string;
  from?: string;
  type: "from" | "to" | "JOINED_ROOM";
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWS] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const getRooms = async () => {
      const { data } = await axios.get(`${API_URL}/rooms`);

      setRooms(data);
    };
    getRooms();

    if (!ws) {
      const socket = io(WEBSOCKET_URL);
      setWS(socket);
    } else {
      ws.removeAllListeners();
      ws.on("receive-message", (messageObj) => {
        console.log("got a message", messageObj);
        const message = messageObj?.message;
        const from = messageObj?.from;

        setMessages([...messages, { message, from, type: "to" }]);
      });

      ws.on("joined-room", (message) => {
        setMessages([...messages, { message, type: "JOINED_ROOM" }]);
      });
    }
  }, [messages, setMessages, ws]);

  const sendMessage = () => {
    if (ws) {
      const newMessage: Message = { message, from: ws.id, type: "from" };

      ws.emit("message", newMessage, currentRoom);
      setMessages([...messages, newMessage]);
    } else {
      alert("Not connected to websocket");
    }
  };

  const joinRoom = () => {
    if (ws) {
      ws.emit("join-room", room);
      setCurrentRoom(room);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            borderRadius: ".5em",
            overflow: "hidden",
            height: "50vh",
            minHeight: "20em",
            width: "70%",
            marginTop: "4em",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              bgcolor: "black",
              height: "100%",
              overflowY: "scroll",
              padding: "1em",
              color: "white",
              textAlign: "left",
            }}
          >
            {/* <img
              style={{ position: "relative" }}
              src={logo}
              className="App-logo"
              alt="logo"
            /> */}
            {messages.map(({ message, from, type }: Message) => {
              return (
                <Typography
                  sx={{
                    ...MESSAGE_STYLES[type],
                    padding: "1em",
                    borderRadius: "1em",
                    margin: ".5em",
                    overflow: "wrap",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                  }}
                >
                  {message}
                </Typography>
              );
            })}
          </Box>
          <Box
            sx={{
              bgcolor: "white",
              minWidth: "12em",
              display: "flex",
            }}
          >
            <TextField
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              fullWidth
              label="Message"
              variant={"filled"}
              placeholder="Message"
            />
            <Button
              sx={{ width: "30%" }}
              style={{ borderRadius: "0px" }}
              onClick={sendMessage}
              variant="contained"
              color="primary"
              disabled={!ws}
            >
              SEND
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            marginTop: "1em",
            bgcolor: "white",
            minWidth: "12em",
            display: "flex",
            borderRadius: "5px",
          }}
        >
          <TextField
            sx={{ borderRadius: "20px" }}
            onChange={(e) => setRoom(e.target.value)}
            value={room}
            label="room"
            fullWidth
            variant={"filled"}
            placeholder="Message"
          />
          <Button
            sx={{ width: "70%" }}
            onClick={joinRoom}
            variant="contained"
            color="primary"
            disabled={!ws}
          >
            Join Room
          </Button>
        </Box>
      </header>
    </div>
  );
}

export default App;
