"use client";

import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { UserPlus, LogOut, Crown, Trash2, X, Sparkles, AlertCircle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";

interface Props {
  group: any;
  onClose: () => void;
  onGroupUpdated: (g: any) => void;
}

export const ParticipantsList = ({ group, onClose, onGroupUpdated }: Props) => {
  const { currentUser, setActiveGroup, groups, setGroups } = useChatStore();
  const [addInput, setAddInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const meAsParticipant = group.participants?.find((p: any) => p.clerkId === currentUser?.clerkId);
  const isCreator = group.createdBy?.toString() === meAsParticipant?._id?.toString();

  const handleAdd = async () => {
    const id = addInput.trim();
    if (!id) return;
    setLoading(true); 
    setError("");
    try {
      const { data } = await axios.patch(`/api/groups/${group.privateChatId}`, { addUserId: id });
      onGroupUpdated(data);
      setAddInput("");
    } catch (err: any) {
      setError(err.response?.data || "User not found or limit reached (Max 10).");
    } finally { 
      setLoading(false); 
    }
  };

  const handleRemove = async (userId: string) => {
    setLoading(true); 
    setError("");
    try {
      const { data } = await axios.patch(`/api/groups/${group.privateChatId}`, { removeUserId: userId });
      onGroupUpdated(data);
    } catch (err: any) {
      setError(err.response?.data || "Action failed.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      await axios.delete(`/api/groups/${group.privateChatId}`);
      if (setGroups) setGroups(groups.filter((g: any) => g.privateChatId !== group.privateChatId));
      setActiveGroup(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data || "Failed to leave.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] rounded-[40px] shadow-2xl border border-gray-100 dark:border-zinc-900 overflow-hidden"
      >
        <div className="p-5 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-violet-500" />
                 Group Hub
              </h2>
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] mt-1.5 font-bold italic">
                 {group.participants?.length} / 10 Active Protocols
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-1">
            {group.participants?.map((p: any) => {
              const isMe = p.clerkId === currentUser?.clerkId;
              const isGroupCreator = group.createdBy?.toString() === p._id?.toString();
              return (
                <div key={p._id} className="flex items-center gap-4 px-4 py-3 rounded-3xl hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 group">
                  <UserAvatar src={p.avatar} name={p.name} isOnline={p.isOnline} className="h-11 w-11 shadow-sm ring-2 ring-transparent group-hover:ring-violet-500/10 transition-all" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{p.name}{isMe && " (you)"}</p>
                       {isGroupCreator && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">{p.userId}</p>
                  </div>
                  {isCreator && !isMe && (
                    <button 
                      onClick={() => handleRemove(p.userId)} 
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors rounded-xl opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isCreator && group.participants?.length < 10 && (
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1 group">
                 <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-700 group-focus-within:text-violet-500 transition-colors" />
                 <input
                   value={addInput}
                   onChange={(e) => setAddInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                   placeholder="Friend's User ID"
                   className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-gray-900 dark:text-white"
                 />
              </div>
              <button
                onClick={handleAdd}
                disabled={loading || !addInput.trim()}
                className="px-5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 active:scale-95 transition-all text-xs font-bold disabled:opacity-40 shadow-xl shadow-violet-600/20"
              >
                {loading ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Deploy"}
              </button>
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl">
               <AlertCircle className="w-4 h-4 text-red-500" />
               <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </motion.div>
          )}

          <button
            onClick={handleLeave}
            className="w-full py-4 flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all border border-red-500/10 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" /> Leave Protocol
          </button>
        </div>
        
        <div className="bg-gray-50/50 dark:bg-black/40 p-6 text-center border-t border-gray-100 dark:border-zinc-900/50">
           <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-700 italic">
             Restricted Access · All Transmissions Logged
           </p>
        </div>
      </motion.div>
    </div>
  );
};

