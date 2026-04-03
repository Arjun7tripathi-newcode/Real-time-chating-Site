"use client";

import { useState } from "react";
import { X, UserPlus, Trash2, Users } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/hooks/use-chat-store";
import { getSocket } from "@/hooks/use-socket";

interface Props {
  onClose: () => void;
}

export const CreatePrivateChatModal = ({ onClose }: Props) => {
  const [groupName, setGroupName] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const { setActiveGroup, groups, setGroups } = useChatStore();

  const handleAddId = async () => {
    const id = userIdInput.trim();
    if (!id) return;
    if (addedIds.includes(id)) { setError("User already added to the list."); return; }
    if (addedIds.length >= 9) { setError("Maximum 10 users allowed in a private group."); return; }

    setValidating(true);
    setError("");
    try {
      // Validate user exists
      await axios.get(`/api/users?userId=${id}`);
      setAddedIds((prev) => [...prev, id]);
      setUserIdInput("");
    } catch {
      setError(`No user found with ID "${id}".`);
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveId = (id: string) => setAddedIds((prev) => prev.filter((x) => x !== id));

  const handleCreate = async () => {
    if (addedIds.length < 1) { setError("Please add at least one other user."); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/groups", {
        name: groupName.trim() || undefined,
        userIds: addedIds,
      });

      if (setGroups) setGroups([data, ...groups]);
      if (setActiveGroup) setActiveGroup(data);

      // Notify ALL participants that they've been added to a new private group
      getSocket()?.emit("new_chat", { 
        userIds: addedIds, 
        chat: data 
      });

      onClose();
    } catch (err: any) {
      setError(err.response?.data || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[40px] shadow-2xl shadow-black/40 border border-gray-100 dark:border-zinc-900 overflow-hidden"
      >
        <div className="p-5 sm:p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">New Group</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1">Chat privately with 2 to 10 friends</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Group Details</label>
              <input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Give your group a name (optional)"
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Participants</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddId()}
                    placeholder="Enter friend's User ID"
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddId}
                  disabled={validating || !userIdInput.trim()}
                  className="px-6 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20"
                >
                  {validating ? (
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-2xl border border-red-100 dark:border-red-500/20">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {addedIds.length > 0 ? (
                addedIds.map((id) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={id} 
                    className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 px-4 py-3 rounded-2xl group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                        {id.substring(0, 2)}
                      </div>
                      <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{id}</span>
                    </div>
                    <button onClick={() => handleRemoveId(id)} className="p-1 hover:text-red-500 text-gray-300 dark:text-zinc-700 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 dark:border-zinc-900 rounded-[32px]">
                   <Users className="w-8 h-8 text-gray-200 dark:text-zinc-800 mb-2" />
                   <p className="text-xs text-gray-400 font-medium">No participants added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-900 flex flex-col gap-3">
          <button
            onClick={handleCreate}
            disabled={loading || addedIds.length < 1}
            className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-[24px] font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-2xl shadow-black/10"
          >
            {loading ? "Initializing..." : `Create Group Chat`}
          </button>
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
             Members will be notified instantly via real-time sidebar sync
          </p>
        </div>
      </motion.div>
    </div>
  );
};
