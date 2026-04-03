"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import axios from "axios";
import { useChatStore } from "@/hooks/use-chat-store";
import { motion } from "framer-motion";
import { getSocket } from "@/hooks/use-socket";

export const JoinRoomModal = ({ onClose }: { onClose: () => void }) => {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const { setActiveRoom } = useChatStore();

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`/api/rooms/${roomId.trim()}`, {
        password: password || undefined,
      });
      const socket = getSocket();
      setActiveRoom(data);
      const event = data.type === "meeting" ? "join_meeting_room" : "join_public_room";
      socket?.emit(event, { roomId: data.roomId });
      onClose();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setNeedsPassword(true);
        setError("This room requires a password.");
      } else {
        setError("Room not found. Check the Room ID.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] p-5 sm:p-8 shadow-2xl shadow-black/20 border border-gray-100"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">Join Room</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID (e.g. MEET_XYZ789)"
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
        />

        {needsPassword && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2 mb-3">
            <Lock className="w-4 h-4 text-amber-500" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password"
              type="password"
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm font-medium mb-3 bg-red-50 px-4 py-3 rounded-2xl">{error}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || !roomId.trim()}
          className="w-full py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-black/10"
        >
          {loading ? "Joining…" : "Join Room"}
        </button>
      </motion.div>
    </div>
  );
};
