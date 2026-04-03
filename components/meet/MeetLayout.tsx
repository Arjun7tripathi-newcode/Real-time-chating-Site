"use client";

import { useChatStore } from "@/hooks/use-chat-store";
import { MeetSidebar } from "./MeetSidebar";
import { MeetingRoom } from "@/components/meet/MeetingRoom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe, Lock, Video, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const MeetLayout = () => {
  const { activeMeeting, isSidebarOpen, setIsSidebarOpen } = useChatStore();

  return (
    <div className="flex w-full h-full bg-white dark:bg-[#050505] transition-all duration-700 overflow-hidden relative">
      {/* Mobile Responsive Sidebar for Meet */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:relative lg:inset-auto lg:block transition-all duration-500 ease-[0.22, 1, 0.36, 1]",
          isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:opacity-100 lg:translate-x-0"
        )}
      >
        <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative h-full w-[85vw] max-w-[380px] lg:w-[350px] xl:w-[380px] shadow-2xl lg:shadow-none bg-white dark:bg-[#080808]">
          <MeetSidebar />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeMeeting ? (
            <motion.div
              key="room"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full flex flex-col relative z-10"
            >
              <MeetingRoom meetingId={activeMeeting} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center p-12 max-w-xl mx-auto z-1 relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.08)_0%,transparent_70%)] pointer-events-none" />
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-[40px] mx-auto mb-10 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.2)] hover:rotate-6 transition-transform">
                <Video className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter italic">Cinema. <br/><span className="text-indigo-600 not-italic">Connection.</span></h3>
              <p className="text-gray-400 dark:text-zinc-500 font-bold italic max-w-sm leading-relaxed mx-auto uppercase tracking-widest text-[10px] mb-10">
                Experience ultra-low latency video communication. <br /> Security first. Experience always.
              </p>
              
              <div className="flex items-center justify-center gap-4 flex-wrap">
                 <div className="flex items-center gap-2 group cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-full transition-all">
                    <Shield className="w-3 h-3 text-indigo-500" />
                    <span className="text-[9px] font-black text-zinc-500 group-hover:text-zinc-400 uppercase tracking-[0.3em] transition-colors">E2EE Secured</span>
                 </div>
                 <div className="w-px h-3 bg-zinc-800" />
                 <div className="flex items-center gap-2 group cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-full transition-all">
                    <Globe className="w-3 h-3 text-zinc-700" />
                    <span className="text-[9px] font-black text-zinc-500 group-hover:text-zinc-400 uppercase tracking-[0.3em] transition-colors">Global Edge Network</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
