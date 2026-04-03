"use client";

import { useState } from "react";
import { X, Lock, Globe } from "lucide-react";
import axios from "axios";
import { useChatStore } from "@/hooks/use-chat-store";
import { motion } from "framer-motion";
import { getSocket } from "@/hooks/use-socket";

export const CreateRoomModal = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"public" | "meeting">("public");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);
  const { setActiveRoom, setRooms, rooms } = useChatStore();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/rooms", {
        name,
        type,
        password: password || undefined,
      });
      setCreated(data);
      setRooms([...rooms, data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!created) return;
    const socket = getSocket();
    setActiveRoom(created);
    socket?.emit(type === "meeting" ? "join_meeting_room" : "join_public_room", { roomId: created.roomId });
    onClose();
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
          <h2 className="text-xl font-bold tracking-tight">Create Room</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {!created ? (
          <>
            <div className="flex gap-3 mb-5">
              {(["public", "meeting"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${type === t ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
                >
                  {t === "public" ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {t === "public" ? "Public Room" : "Meeting Room"}
                </button>
              ))}
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Room name"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />

            {type === "meeting" && (
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (optional)"
                type="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            )}

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="w-full py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-black/10 mt-2"
            >
              {loading ? "Creating…" : "Create Room"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-5">
              <p className="text-green-600 font-bold text-sm mb-1">Room Created!</p>
              <p className="text-gray-500 text-sm mb-3">Share this ID with others</p>
              <div className="bg-white rounded-xl px-4 py-3 font-mono font-bold text-lg tracking-widest text-blue-600 border border-blue-100">
                {created.roomId}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(created.roomId)}
                className="mt-2 text-xs text-gray-400 hover:text-blue-500 transition-colors font-medium"
              >
                Click to copy
              </button>
            </div>
            <button
              onClick={handleJoin}
              className="w-full py-3.5 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30"
            >
              Enter Room
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
