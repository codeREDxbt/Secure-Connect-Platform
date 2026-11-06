/**
 * Secure Connect Platform - Web Dev III Lab 4
 * Student Name: Vinayak Vashisth
 * Roll Number: 2501730150
 */

require("dotenv").config();

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
const { EventEmitter } = require("events");

const authRoutes = require("./src/routes/authRoutes");
const notesRoutes = require("./src/routes/notesRoutes");
const { setDatabase } = require("./src/config/database");
const {
  authenticateToken,
  requireRole
} = require("./src/middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const appEvents = new EventEmitter();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Secure Connect and Communication Platform API",
    status: "running"
  });
});

app.use((req, res, next) => {
  req.appEvents = appEvents;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Protected resource accessed successfully",
    user: req.user
  });
});

app.get(
  "/api/admin",
  authenticateToken,
  requireRole("admin"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

// User signup event
appEvents.on("user:signup", ({ username, email }) => {
  console.log(
    `[event] user:signup username=${username} email=${email}`
  );
});

// User login event
appEvents.on("user:login", ({ email }) => {
  console.log(`[event] user:login email=${email}`);
});

// Note creation event + REAL-TIME SOCKET.IO NOTIFICATION
appEvents.on("note:created", ({ userId, title }) => {
  console.log(
    `[event] note:created userId=${userId} title="${title}"`
  );

  // Send the event to connected Socket.IO clients
  io.emit("note:created", { userId, title });
});

// Chat message event
appEvents.on("chat:message", ({ room, username, message }) => {
  console.log(
    `[event] chat:message room=${room} ${username}: ${message}`
  );
});

// Socket.IO connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a chat room
  socket.on("join_room", ({ room } = {}) => {
    if (typeof room !== "string" || !room.trim()) {
      return;
    }

    socket.join(room);

    console.log(`${socket.id} joined room ${room}`);

    socket.emit("room_joined", { room });
  });

  // Send chat messages to everyone in the same room
  socket.on("chat_message", (payload = {}) => {
    const { room, username, message } = payload;

    if (
      typeof room !== "string" || !room.trim() ||
      typeof username !== "string" || !username.trim() ||
      typeof message !== "string" || !message.trim()
    ) {
      socket.emit("chat_error", {
        message: "room, username and message are required"
      });

      return;
    }

    const chatMessage = {
      room: room.trim(),
      username: username.trim(),
      message: message.trim(),
      sentAt: new Date().toISOString()
    };

    appEvents.emit("chat:message", chatMessage);

    io.to(chatMessage.room).emit("chat_message", chatMessage);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  if (
    !process.env.MONGODB_URI ||
    !process.env.DB_NAME ||
    !process.env.JWT_SECRET
  ) {
    throw new Error(
      "Missing MONGODB_URI, DB_NAME, or JWT_SECRET in .env"
    );
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  const db = client.db(process.env.DB_NAME);

  await setDatabase(db);

  await db.collection("users").createIndex(
    { email: 1 },
    { unique: true }
  );

  await db.collection("notes").createIndex({
    ownerId: 1,
    createdAt: -1
  });

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});