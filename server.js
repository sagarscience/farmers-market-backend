import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import newsRoutes from "./routes/news.js";

// Models
import ChatMessage from "./models/ChatMessage.js";


// 🔐 Environment Config
dotenv.config();

const app = express();
const server = http.createServer(app);
// 💬 Track connected users
const onlineUsers = new Map();

// ✅ Allowed origins for both dev and prod
const allowedOrigins = [
  "http://localhost:5173",
  "https://main.d3kd3knlivprie.amplifyapp.com"
];

// 🌐 Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Socket.IO CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});


io.on("connection", (socket) => {
  const { name, role, userId } = socket.handshake.query;

  if (name && role) {
    onlineUsers.set(socket.id, { socketId: socket.id, name, role, userId });
    console.log(`🟢 ${name} (${role}) connected: ${socket.id}`);
  }

  io.emit("onlineUsers", Array.from(onlineUsers.values()));

  socket.on("joinRoom", async (roomId) => {

    if (!roomId) return;
    socket.join(roomId);
    try {
      const messages = await ChatMessage.find({ roomId }).sort({ createdAt: 1 });
      socket.emit("loadMessages", messages);
    } catch (err) {
      console.error("❌ Load chat error:", err.message);
    }
  });

  socket.on("sendMessage", async (data) => {
    if (!data) return console.error("❌ No data in sendMessage");

    const { roomId, sender, senderId, recieverId, role, message } = data;
    if (!roomId || !sender || !message || !senderId || !recieverId) return console.error("❌ Incomplete message data");

    try {
      const newMsg = new ChatMessage({ roomId, sender, senderId, recieverId, role, message });
      await newMsg.save();

      // Emit to specific room
      io.to(roomId).emit("receiveMessage", {
        roomId,
        sender,
        role,
        message,
        timestamp: newMsg.createdAt,
      });
    } catch (err) {
      console.error("❌ Send message error:", err.message);
    }
  });


  socket.on("typing", ({ from, roomId }) => {
    socket.to(roomId).emit("typing", { from });
  });

  socket.on("stopTyping", ({ roomId }) => {
    socket.to(roomId).emit("stopTyping");
  });

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

// 🔧 Express Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Express CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// 🔗 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 📦 Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes); // Optional: if using agri RSS

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🌾 Farmers Market API is running...");
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
