"use client";

import { ModeToggle } from "./ModeToggle";
import { UserButton } from "@clerk/nextjs";
import { MessageSquare, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useChatStore } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const { appMode, isSidebarOpen, setIsSidebarOpen } = useChatStore();

  return (
    <header className="h-16 sm:h-20 w-full bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl border-b border-gray-100 dark:border-zinc-900 px-4 sm:px-8 flex items-center justify-between z-[60] transition-all duration-500">
      <div className="flex items-center gap-2 sm:gap-10">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 sm:p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl text-gray-500 dark:text-zinc-400 hover:text-blue-500 transition-all border border-transparent active:scale-95 flex-shrink-0"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3 group px-1 sm:px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-2xl transition-all"
        >
          <div className={cn(
             "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex flex-shrink-0 items-center justify-center shadow-lg transition-all duration-700",
             appMode === "chat" 
               ? "bg-blue-600 shadow-blue-500/20 rotate-0" 
               : "bg-indigo-600 shadow-indigo-500/20 rotate-[360deg]"
          )}>
            {appMode === "chat" ? (
              <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" />
            ) : (
              <Video className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" />
            )}
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tighter text-gray-900 dark:text-white leading-none">
              Chat<span className="hidden sm:inline">Pro</span><span className="text-blue-500">.</span>
            </h1>
            <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-600 italic mt-1">
              {appMode === "chat" ? "Messaging Node" : "Meeting Hub (BETA)"}
            </p>
          </div>
        </motion.div>

        <ModeToggle />
      </div>

      <div className="flex items-center gap-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full text-[11px] font-black text-blue-500 uppercase tracking-widest shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Protocol Active
        </motion.div>
        
        <div className="h-10 w-px bg-gray-100 dark:bg-zinc-900" />
        
        <div className="flex items-center gap-4">
           <UserButton 
             appearance={{
               elements: {
                 userButtonAvatarBox: "h-10 w-10 ring-2 ring-white dark:ring-zinc-900 shadow-xl shadow-black/5"
               }
             }}
           />
        </div>
      </div>
    </header>
  );
};
