"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "./use-chat-store";
import axios from "axios";
import { cn } from "@/lib/utils";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { currentUser, addMessage, setOnlineUsers, setTypingUser } = useChatStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once when we have a current user
    if (!currentUser?.userId || initialized.current) return;
    initialized.current = true;

    socketInstance = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance?.id);
      // Register current user as online
      socketInstance?.emit("user_online", {
        userId: currentUser.userId,
        name: currentUser.name,
        avatar: currentUser.avatar,
      });
    });

    socketInstance.on("online_users", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    socketInstance.on("receive_message", (data: any) => {
      const state = useChatStore.getState();
      const myUserId = state.currentUser?.userId;
      
      if (data?.sender?.userId !== myUserId) {
        // Play notification sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        audio.play().catch(() => {});

        // Smart Notification: Toast if chat is completely closed or inactive
        const isActiveChat = 
           state.activeConversation?._id === data.conversationId ||
           state.activeRoom?.roomId === data.roomId ||
           state.activeGroup?.privateChatId === data.conversationId;
           
         if (!isActiveChat) {
            import("react-hot-toast").then((m) => {
              const toastManager = m.default;
              toastManager.custom((t) => (
                <div
                  onClick={async () => {
                     toastManager.dismiss(t.id);
                     if (data.type === "private") {
                        const s = useChatStore.getState();
                        const existing = s.conversations.find(c => c._id === data.conversationId);
                        if (existing) {
                           s.setActiveConversation(existing);
                        } else {
                           try {
                              const { data: convs } = await axios.get(`/api/conversations`);
                              const target = convs.find((c: any) => c._id === data.conversationId);
                              if (target) s.setActiveConversation(target);
                           } catch {}
                        }
                     }
                  }}
                  className={cn(
                    "flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-[28px] shadow-2xl border border-gray-100 dark:border-zinc-800 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all max-w-sm",
                    t.visible ? "animate-in slide-in-from-bottom-5" : "animate-out fade-out"
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {data.sender?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">{data.sender?.name || "New Message"}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">{data.message}</p>
                  </div>
                </div>
              ));
            });
         }

        const socketMessage = {
          _id: `socket_${Date.now()}`,
          senderId: data.sender,
          text: data.message,
          message: data.message,
          type: data.type,
          conversationId: data.conversationId,
          roomId: data.roomId,
          privateChatId: data.conversationId, // for group consistency
          createdAt: data.createdAt || new Date().toISOString(),
          seenBy: [],
        };

        addMessage(socketMessage);
        
        // Instant Sidebar Update
        const { updateConversationLastMessage, updateGroupLastMessage, incrementUnreadCount } = useChatStore.getState();
        if (data.type === "private" && data.conversationId) {
           updateConversationLastMessage(data.conversationId, socketMessage as any);
           // Also update group if it's a private group
           updateGroupLastMessage(data.conversationId, socketMessage as any);
           
           if (!isActiveChat) {
              incrementUnreadCount(data.conversationId);
           }
        }
        
        console.log("Real-time message added and sidebar updated:", data.message);
      }
    });

    socketInstance.on("user_typing", ({ userId }: { userId: string }) => {
      if (userId !== currentUser.userId) {
        setTypingUser(userId, true);
      }
    });

    socketInstance.on("user_stop_typing", ({ userId }: { userId: string }) => {
      setTypingUser(userId, false);
    });

    socketInstance.on("sidebar_refresh", async () => {
      const { setConversations, setGroups } = useChatStore.getState();
      try {
        const [convRes, groupRes] = await Promise.all([
          axios.get("/api/conversations"),
          axios.get("/api/groups")
        ]);
        setConversations(convRes.data);
        setGroups(groupRes.data);
        console.log("Sidebar refreshed in real-time");
      } catch (err) {
        console.error("Sidebar refresh failed", err);
      }
    });

    socketInstance.on("message_updated", (data: any) => {
      const { updateMessage } = useChatStore.getState();
      updateMessage(data.messageId, {
        text: data.text,
        edited: true,
        editedAt: data.editedAt
      });
    });

    socketInstance.on("message_deleted", (data: any) => {
      const { updateMessage } = useChatStore.getState();
      if (data.mode === "everyone") {
        updateMessage(data.messageId, {
          isDeleted: true,
          text: "This message was deleted"
        });
      }
    });

    socketInstance.on("receive_reaction", ({ messageId, emoji, userId }: any) => {
      const { messages, updateMessage } = useChatStore.getState();
      const message = messages.find(m => m._id === messageId);
      if (message) {
        const currentReactions = message.reactions || [];
        const hasReacted = currentReactions.find(r => (r.userId?._id || r.userId) === userId && r.emoji === emoji);
        
        let newReactions = [...currentReactions];
        if (hasReacted) {
          newReactions = newReactions.filter(r => !((r.userId?._id || r.userId) === userId && r.emoji === emoji));
        } else {
          newReactions.push({ emoji, userId });
        }
        updateMessage(messageId, { reactions: newReactions });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
      initialized.current = false;
    };
  }, [currentUser?.userId]); // Re-run when currentUser loads

  return socketInstance;
};

export const getSocket = () => socketInstance;
