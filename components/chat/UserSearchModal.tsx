"use client";

import { useEffect, useState } from "react";
import { Search, X, MessageCircle, Sparkles } from "lucide-react";
import axios from "axios";
import { useChatStore } from "@/hooks/use-chat-store";
import { UserAvatar } from "./UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { getSocket } from "@/hooks/use-socket";

export const UserSearchModal = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setActiveConversation, onlineUsers } = useChatStore();

  const sortedResults = [...results].sort((a, b) => {
    const aOnline = onlineUsers.includes(a.userId);
    const bOnline = onlineUsers.includes(b.userId);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/api/search-users?q=${debouncedQuery.trim()}`);
        setResults(data);
      } catch {
        setError("Something went wrong during search.");
      } finally {
        setLoading(false);
      }
    };
    handleSearch();
  }, [debouncedQuery]);

  const handleChat = async (user: any) => {
    try {
      const { data } = await axios.post("/api/conversations", { receiverId: user._id });
      setActiveConversation(data);
      
      // Notify the recipient about the new conversation
      getSocket()?.emit("new_chat", { 
        userIds: [user.userId], 
        chat: data 
      });

      onClose();
    } catch (err) {
      setError("Could not start conversation.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[40px] overflow-hidden shadow-2xl shadow-black/40 border border-gray-100 dark:border-zinc-900"
      >
        {/* ... (UI code stays same as before) */}
        <div className="p-5 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Find Friends
              </h2>
              <p className="text-sm text-gray-400 dark:text-zinc-500 font-bold italic">Search by name or unique User ID</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-zinc-700" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Who are you looking for?"
              className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/50 rounded-3xl pl-14 pr-4 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600"
            />
            {loading && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                 <div className="h-5 w-5 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-4 px-1">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-red-500 text-xs font-bold mb-4 bg-red-50 dark:bg-red-500/10 px-5 py-4 rounded-3xl border border-red-100 dark:border-red-500/20"
                >
                  {error}
                </motion.p>
              )}

              {sortedResults.map((user, i) => {
                const isOnline = onlineUsers.includes(user.userId);
                return <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={user._id}
                  onClick={() => handleChat(user)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/80 rounded-[32px] transition-all border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 group cursor-pointer"
                >
                  <UserAvatar src={user.avatar} name={user.name} isOnline={isOnline} className="h-14 w-14 ring-4 ring-transparent group-hover:ring-blue-500/10 transition-all" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] font-mono text-blue-500 font-black tracking-widest uppercase mt-0.5">{user.userId}</p>
                  </div>
                  <div
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </div>
                </motion.div>;
              })}

              {!loading && query && results.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Search className="w-6 h-6 text-gray-200 dark:text-zinc-800" />
                  </div>
                  <p className="text-sm text-gray-400 font-bold italic leading-relaxed">No users found <br className="hidden md:block" /> matching your criteria.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 text-center border-t border-gray-100 dark:border-zinc-900/50">
           <p className="text-[11px] text-gray-400 dark:text-zinc-600 font-black uppercase tracking-[0.2em] leading-relaxed italic">
             Connecting Humanity, One Message at a Time.
           </p>
        </div>
      </motion.div>
    </div>
  );
};
