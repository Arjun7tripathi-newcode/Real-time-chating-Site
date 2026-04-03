"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import toast from "react-hot-toast";

export const NotificationHandler = () => {
  const socket = useSocket();

  useEffect(() => {
    // 1. Request Browser Notification Permission
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (!socket) {
      console.log("No socket found in NotificationHandler, waiting...");
      return;
    }

    console.log("Socket found in NotificationHandler, registering listeners");
    
    // 2. Handle Browser Notifications when Tab is Inactive
    const handleNotification = (payload: any) => {
      // ... (Rest of the logic)
      if (document.visibilityState === "hidden" && Notification.permission === "granted") {
        new (window as any).Notification(`New message from ${payload.sender?.name || "Someone"}`, {
          body: payload.message,
          icon: payload.sender?.avatar || "/favicon.ico",
        });
      }
    };

    socket.on("receive_message", handleNotification);
    return () => {
      socket.off("receive_message", handleNotification);
    };
  }, [socket]);

  return null;
};
