"use client";

import { motion } from "framer-motion";
import { MessageSquare, Video } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";

export const ModeToggle = () => {
  const { appMode, setAppMode } = useChatStore();

  return (
    <div className="flex bg-gray-100/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-inner relative z-50">
      <div className="relative flex items-center gap-1">
        <motion.div
           layout
           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
           className={cn(
             "absolute h-full w-1/2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10",
             appMode === "meet" ? "translate-x-full" : "translate-x-0"
           )}
        />
        
        <button
          onClick={() => setAppMode("chat")}
          className={cn(
            "relative z-10 flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors duration-300",
            appMode === "chat" ? "text-blue-500" : "text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-400"
          )}
        >
          <MessageSquare className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Chat</span>
        </button>

        <button
          onClick={() => setAppMode("meet")}
          className={cn(
            "relative z-10 flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors duration-300",
            appMode === "meet" ? "text-indigo-500" : "text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-400"
          )}
        >
          <Video className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Meet</span>
          <span className="absolute -top-1 -right-2 px-1 py-0.5 bg-indigo-500 text-[6px] text-white rounded-full leading-none shadow-[0_0_10px_rgba(79,70,229,0.5)] border border-white/20">
            BETA
          </span>
        </button>
      </div>
    </div>
  );
};
