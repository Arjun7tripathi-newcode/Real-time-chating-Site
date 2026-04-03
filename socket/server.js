const { Server } = require("socket.io");
const http = require("http");

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track online users: { userId, socketId, name, avatar }
let onlineUsers = [];

const addUser = (userId, socketId, name, avatar) => {
  const exists = onlineUsers.find((u) => u.userId === userId);
  if (!exists) onlineUsers.push({ userId, socketId, name, avatar });
  else {
    // Update socket if user reconnects
    onlineUsers = onlineUsers.map((u) =>
      u.userId === userId ? { ...u, socketId } : u
    );
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
};

const getSocketId = (userId) =>
  onlineUsers.find((u) => u.userId === userId)?.socketId;

io.on("connection", (socket) => {
  console.log("[Socket] Connected:", socket.id);

  // ─── USER ONLINE ────────────────────────────────────────────────
  socket.on("user_online", ({ userId, name, avatar }) => {
    addUser(userId, socket.id, name, avatar);
    socket.join(`user_${userId}`); // Join unique user room
    io.emit("online_users", onlineUsers.map((u) => u.userId));
    console.log(`[Socket] ${userId} is online and joined personal room`);
  });

  // ─── PRIVATE CHAT ───────────────────────────────────────────────
  socket.on("join_private_chat", ({ conversationId }) => {
    socket.join(`private_${conversationId}`);
    console.log(`[Socket] Joined private room: private_${conversationId}`);
  });

  // ─── PUBLIC ROOM ────────────────────────────────────────────────
  socket.on("join_public_room", ({ roomId }) => {
    socket.join(`public_${roomId}`);
    io.to(`public_${roomId}`).emit("room_user_joined", {
      userId: socket.id,
      message: "A user joined the room",
    });
    console.log(`[Socket] Joined public room: public_${roomId}`);
  });

  // ─── MEETING ROOM ───────────────────────────────────────────────
  socket.on("join_meeting_room", ({ roomId }) => {
    socket.join(`meeting_${roomId}`);
    io.to(`meeting_${roomId}`).emit("room_user_joined", {
      userId: socket.id,
      message: "A user joined the meeting",
    });
    console.log(`[Socket] Joined meeting room: meeting_${roomId}`);
  });

  socket.on("send_message", ({ type, roomId, conversationId, message, sender, recipientId }) => {
    const payload = { type, roomId, conversationId, message, sender, createdAt: new Date() };

    if (type === "private" && conversationId) {
      io.to(`private_${conversationId}`).emit("receive_message", payload);
      if (recipientId) {
        // Also send to the recipient's personal room for global notifications
        io.to(`user_${recipientId}`).emit("receive_message", payload);
      }
    } else if (type === "public" && roomId) {
      io.to(`public_${roomId}`).emit("receive_message", payload);
    } else if (type === "meeting" && roomId) {
      io.to(`meeting_${roomId}`).emit("receive_message", payload);
    }
  });

  // ─── TYPING ─────────────────────────────────────────────────────
  socket.on("typing", ({ type, roomId, conversationId, userId }) => {
    if (type === "private") {
      socket.to(`private_${conversationId}`).emit("user_typing", { userId });
    } else if (type === "public") {
      socket.to(`public_${roomId}`).emit("user_typing", { userId });
    } else if (type === "meeting") {
      socket.to(`meeting_${roomId}`).emit("user_typing", { userId });
    }
  });

  socket.on("stop_typing", ({ type, roomId, conversationId, userId }) => {
    if (type === "private") {
      socket.to(`private_${conversationId}`).emit("user_stop_typing", { userId });
    } else if (type === "public") {
      socket.to(`public_${roomId}`).emit("user_stop_typing", { userId });
    } else if (type === "meeting") {
      socket.to(`meeting_${roomId}`).emit("user_stop_typing", { userId });
    }
  });

  // ─── EDIT/DELETE ────────────────────────────────────────────────
  socket.on("edit_message", (data) => {
    // data: { messageId, text, conversationId, roomId, edited, editedAt }
    if (data.conversationId) {
      io.to(`private_${data.conversationId}`).emit("message_updated", data);
    } else if (data.roomId) {
      io.to(`public_${data.roomId}`).emit("message_updated", data);
      io.to(`meeting_${data.roomId}`).emit("message_updated", data);
    }
  });

  socket.on("delete_message", (data) => {
    // data: { messageId, conversationId, roomId, mode, deletedBy }
    if (data.mode === "everyone") {
      if (data.conversationId) {
        io.to(`private_${data.conversationId}`).emit("message_deleted", data);
      } else if (data.roomId) {
        io.to(`public_${data.roomId}`).emit("message_deleted", data);
        io.to(`meeting_${data.roomId}`).emit("message_deleted", data);
      }
    }
    // "me" mode is handled only on the client that emitted it (backend already updated)
  });

  // ─── REACTION ───────────────────────────────────────────────────
  socket.on("message_reaction", ({ messageId, emoji, userId, conversationId, roomId }) => {
    const payload = { messageId, emoji, userId };
    if (conversationId) {
      io.to(`private_${conversationId}`).emit("receive_reaction", payload);
    } else if (roomId) {
      io.to(`public_${roomId}`).emit("receive_reaction", payload);
    }
  });

  // ─── NEW CHAT NOTIFICATION ──────────────────────────────────────
  socket.on("new_chat", ({ userIds, chat }) => {
    userIds.forEach(userId => {
      io.to(`user_${userId}`).emit("sidebar_refresh", { chat });
    });
  });

  // ─── DISCONNECT ─────────────────────────────────────────────────
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("online_users", onlineUsers.map((u) => u.userId));
    console.log("[Socket] Disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
