"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useChatStore } from "@/hooks/use-chat-store";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSocket } from "@/hooks/use-socket";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { UnderDevelopment } from "@/components/meet/UnderDevelopment";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { NotificationHandler } from "@/components/chat/NotificationHandler";

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { currentUser, setCurrentUser, appMode, isSidebarOpen, setIsSidebarOpen } = useChatStore();
  useSocket(); // Init globally

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !userId) router.push("/");
  }, [isLoaded, userId, router]);

  // Fetch current user profile
  useEffect(() => {
    if (!userId) return;
    const fetchMe = async () => {
      try {
        const { data } = await axios.get("/api/users/me");
        setCurrentUser(data);
      } catch {}
    };
    fetchMe();
  }, [userId, setCurrentUser]);

  if (!isLoaded || !userId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        />
      </div>
    );
  }

  return (
    <main className="h-[100dvh] w-full flex flex-col overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500 relative font-sans">
      <NotificationHandler />
      <Header />
      
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {appMode === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex w-full h-full relative"
            >
              {/* Sidebar: Mobile Overlay & Desktop Persistent */}
              <div 
                className={cn(
                  "fixed inset-0 z-50 lg:relative lg:inset-auto lg:block transition-all duration-500 ease-[0.22, 1, 0.36, 1]",
                  isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:opacity-100 lg:translate-x-0"
                )}
              >
                <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative h-full w-[85vw] max-w-[380px] lg:w-[350px] xl:w-[380px] shadow-2xl lg:shadow-none bg-white dark:bg-[#080808]">
                  <Sidebar />
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0 h-full relative">
                 <ChatWindow />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="meet"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="flex w-full h-full"
            >
              <UnderDevelopment />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
