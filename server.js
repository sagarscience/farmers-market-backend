import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ChatMessage from "./models/ChatMessage.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map(); // key: socket.id => { name, role }

// ✅ Handle Socket.IO connections
io.on("connection", (socket) => {
  const { name, role } = socket.handshake.query;

  if (name && role) {
    onlineUsers.set(socket.id, { name, role });
    console.log(`🟢 ${name} (${role}) connected: ${socket.id}`);
  }

  io.emit("onlineUsers", Array.from(onlineUsers.values()));

  // ✅ Join room (global or private)
  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    console.log(`👤 ${name || socket.id} joined room: ${roomId}`);
    try {
      const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });
      socket.emit("loadMessages", messages);
    } catch (err) {
      console.error("❌ Error loading messages:", err);
    }
  });

  // ✅ Send new message (global or private)
  socket.on("sendMessage", async ({ roomId, sender, role, message }) => {
    try {
      const newMsg = new ChatMessage({ roomId, sender, role, message });
      await newMsg.save();

      io.to(roomId).emit("receiveMessage", {
        roomId,
        sender,
        role,
        message,
        timestamp: newMsg.timestamp,
      });
    } catch (err) {
      console.error("❌ Message send error:", err);
    }
  });

  // ✅ Typing indicators
  socket.on("typing", ({ from, roomId }) => {
    socket.to(roomId).emit("typing", { from });
  });

  socket.on("stopTyping", ({ roomId }) => {
    socket.to(roomId).emit("stopTyping");
  });

  // ✅ Disconnect
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log(`🔴 ${user.name} (${user.role}) disconnected`);
    } else {
      console.log(`🔴 Unknown user disconnected: ${socket.id}`);
    }
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });
});

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
