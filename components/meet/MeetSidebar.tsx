"use client";

import { useState, useEffect } from "react";
import { Plus, Hash, Users, Sparkles, Video, Search, Globe, PlusCircle, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";

export const MeetSidebar = () => {
  const { setActiveMeeting, activeMeeting } = useChatStore();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingIdInput, setMeetingIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const { data } = await axios.get("/api/meetings");
        setMeetings(data);
      } catch {}
    };
    fetchMeetings();
  }, []);

  const handleCreateMeeting = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/meetings");
      setMeetings([data, ...meetings]);
      setActiveMeeting(data.meetingId);
      toast.success("Meeting Created");
    } catch {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (id?: string) => {
    const targetId = id || meetingIdInput.trim().toUpperCase();
    if (!targetId) return;
    
    setLoading(true);
    try {
      // Validate meeting
      await axios.get(`/api/meetings/${targetId}`);
      setActiveMeeting(targetId);
      toast.success("Joining Meeting...");
    } catch {
      toast.error("Invalid Meeting ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-100 dark:bg-[#080808] dark:border-zinc-900 transition-all z-40 relative">
      <div className="p-8 border-b border-gray-100 dark:border-zinc-900 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">Video Hub.</h2>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-500 italic">Encrypted Secure Meetings</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCreateMeeting}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Video className="w-5 h-5" />
                Start Protocol
              </>
            )}
          </button>

          <div className="relative group">
            <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={meetingIdInput}
              onChange={(e) => setMeetingIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
              placeholder="ENTER MEETING ID..."
              className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-zinc-900/30 rounded-[28px] border border-transparent dark:border-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500/20 transition-all outline-none text-[11px] font-black tracking-widest text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-800"
            />
            <button
              onClick={() => handleJoinMeeting()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-2xl transition-all"
            >
               <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
        <p className="px-4 py-2 text-[10px] font-black text-gray-300 dark:text-zinc-800 uppercase tracking-widest flex items-center gap-2">
           <Sparkles className="w-3 h-3 text-indigo-500" /> Recent Conferences
        </p>
        
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center opacity-20">
             <Globe className="w-12 h-12 mb-4 text-zinc-500" />
             <p className="text-[10px] font-black uppercase tracking-widest">No Active Nodes Found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting: any) => (
              <button
                key={meeting._id}
                onClick={() => handleJoinMeeting(meeting.meetingId)}
                className={cn(
                  "w-full p-6 text-left rounded-[32px] hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-all border border-transparent group relative",
                  activeMeeting === meeting.meetingId && "bg-indigo-50 dark:bg-indigo-500/5 border-indigo-500/20 shadow-xl shadow-indigo-500/5 transform-none scale-[1.02]"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{meeting.title || "Quick Meeting"}</p>
                  <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-md uppercase tracking-tight italic">E2EE</span>
                </div>
                <div className="flex items-center gap-2">
                   <Hash className="w-3 h-3 text-zinc-400 dark:text-zinc-800" />
                   <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 font-bold group-hover:text-indigo-500 transition-colors uppercase tracking-widest">
                     {meeting.meetingId}
                   </p>
                </div>
                
                {activeMeeting === meeting.meetingId && (
                   <div className="absolute right-4 bottom-4">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                   </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
