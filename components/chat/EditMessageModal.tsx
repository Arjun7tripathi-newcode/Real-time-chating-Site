"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Send } from "lucide-react";

interface EditMessageModalProps {
  initialText: string;
  onSave: (newText: string) => void;
  onClose: () => void;
}

export const EditMessageModal = ({ initialText, onSave, onClose }: EditMessageModalProps) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text === initialText) {
      onClose();
      return;
    }
    onSave(text);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-3xl"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative z-10 border border-gray-100 dark:border-zinc-800"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Edit Protocol</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-60">Alter the transmitted data</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full transition-all">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[150px] p-6 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-transparent focus:border-blue-500/20 transition-all outline-none resize-none text-lg text-gray-900 dark:text-white font-medium shadow-inner"
                placeholder="Correct your transmission..."
              />
              <div className="absolute top-0 right-0 p-4 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all active:scale-95"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Sync Changes <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-zinc-950/30 text-center border-t border-gray-50 dark:border-zinc-900/50">
           <p className="text-[9px] text-gray-400 dark:text-zinc-600 font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
             Time limit active: Changes must be made within 5 minutes.
           </p>
        </div>
      </motion.div>
    </div>
  );
};
