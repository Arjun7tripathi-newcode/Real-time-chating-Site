"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";

interface Props { name: string; }

export const TypingIndicator = ({ name }: Props) => {
  const { typingUsers } = useChatStore();
  const isTyping = typingUsers.length > 0;

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-end gap-3 px-2 mb-4 group"
        >
          <div className="flex flex-col items-start max-w-[70%]">
             <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-3xl border border-gray-100 dark:border-zinc-800 rounded-[24px] rounded-bl-[6px] px-5 py-3.5 shadow-sm flex items-center gap-1.5 h-[42px]">
               <div className="flex gap-1 items-center justify-center">
                 <span className="h-1.5 w-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <span className="h-1.5 w-1.5 bg-blue-500/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <span className="h-1.5 w-1.5 bg-blue-500/100 rounded-full animate-bounce" />
               </div>
             </div>
             <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.1em] mt-1.5 ml-2 transition-opacity">
               {name} is typing...
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
