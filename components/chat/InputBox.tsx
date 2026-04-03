"use client";

import { useState, useCallback, useRef } from "react";
import { Smile, Send, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface InputBoxProps {
  onSendMessage: (text: string, expiresIn?: number) => void;
  onTyping: () => void;
}

export const InputBox = ({ onSendMessage, onTyping }: InputBoxProps) => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle timer: undefined -> 10 -> 60 -> undefined
  const toggleTimer = () => {
    setExpiresIn(prev => {
      if (prev === undefined) return 10;
      if (prev === 10) return 60;
      return undefined;
    });
  };

  const handleSubmit = useCallback((e?: any) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, expiresIn);
    setText("");
    setShowEmoji(false);
    inputRef.current?.focus();
  }, [text, expiresIn, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    } else {
      onTyping();
    }
  };

  return (
    <div className="relative flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full mb-4 left-0 z-50 shadow-2xl shadow-black/20 rounded-[32px] overflow-hidden border border-gray-100 dark:border-zinc-800"
          >
            <Picker
              onEmojiClick={(emoji) => {
                setText((prev) => prev + emoji.emoji);
                inputRef.current?.focus();
              }}
              theme={Theme.AUTO}
              width={320}
              height={400}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-gray-50/50 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/50 px-2 py-2 rounded-full focus-within:bg-white dark:focus-within:bg-zinc-950/80 focus-within:border-blue-500/30 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm"
      >
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="p-2 sm:p-3 rounded-full text-gray-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-90 flex-shrink-0 shadow-sm"
        >
          <Smile className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>

        <input
          ref={inputRef}
          autoComplete="off"
          placeholder={expiresIn ? `Self-destructs in ${expiresIn}s...` : "iMessage..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 min-w-0 w-full bg-transparent border-none outline-none text-[13px] sm:text-[15px] font-medium px-1 sm:px-2 h-full py-2 sm:py-3 transition-colors",
            expiresIn ? "text-amber-600 dark:text-amber-500 placeholder:text-amber-500/50" : "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
          )}
        />

        <button
          type="button"
          onClick={toggleTimer}
          className={cn(
            "p-2 sm:p-3 rounded-full transition-all active:scale-90 flex-shrink-0 shadow-sm font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1",
            expiresIn !== undefined 
              ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500 ring-2 ring-amber-500/50" 
              : "text-gray-400 dark:text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-amber-500"
          )}
          title="Ghost Mode (Disappearing Messages)"
        >
          {expiresIn ? `${expiresIn}s` : "⏱️"}
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!text.trim()}
          type="submit"
          className={cn(
            "p-2.5 sm:p-3.5 text-white rounded-full disabled:opacity-30 disabled:grayscale shadow-lg transition-all flex-shrink-0 flex items-center justify-center mr-0.5 sm:mr-1",
            expiresIn ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-500 shadow-blue-500/20"
          )}
        >
          <Send className="w-4 h-4 ml-0.5" />
        </motion.button>
      </form>
    </div>
  );
};
