import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import dhive from "@hiveio/dhive";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true, },
});

app.use(cors({origin: "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(cookieParser());
const client = new dhive.Client(["https://testnet.openhive.network"]);

let documentState = {};

io.use((socket, next) => {
  const username = socket.handshake.query.user;
  if (!username) return next(new Error("Unauthorized"));
  next();
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.handshake.query.user} | Socket ID: ${socket.id}`);

  socket.on("join", (username) => {
    console.log(`${username} joined the session.`);
  });
  
  socket.on("send-changes", (data) => {
    console.log(`Received Changes from: ${data.user}`, data.content);
    documentState = data;
    socket.broadcast.emit("receive-changes", data.content);
  });

  socket.on("save-to-hive", async ({ username, content }) => {
    try {
      const jsonData = {
        author: username,
        content,
        timestamp: new Date().toISOString(),
      };

      await client.broadcast.json({
        required_auths: [],
        required_posting_auths: [username],
        id: "collab_writing",
        json: JSON.stringify(jsonData),
      });

      console.log("Saved to Hive:", jsonData);
    } catch (error) {
      console.error("Error saving to Hive:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
  });
});

server.listen(5000, () => console.log("WebSocket server running on port 5000"));