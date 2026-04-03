"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ScreenShare, Users, Info, Settings, Maximize, Copy, Check, Hash, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/hooks/use-chat-store";
import { useAgora } from "@/hooks/meet/use-agora";
import { VideoElement } from "./VideoElement";
import { useSocket, getSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  meetingId: string;
}

export const MeetingRoom = ({ meetingId }: Props) => {
  const { setActiveMeeting, currentUser } = useChatStore();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [copied, setCopied] = useState(false);

  // Agora Integration
  const { 
    localVideoTrack, 
    remoteUsers, 
    joined, 
    loading, 
    leave,
    toggleMic,
    toggleVideo
  } = useAgora(meetingId);

  // Socket Integration
  useEffect(() => {
    if (joined && meetingId) {
      const socket = getSocket();
      socket?.emit("join_meeting_room", { roomId: meetingId });
    }
  }, [joined, meetingId]);

  const handleLeave = () => {
    leave();
    setActiveMeeting(null);
    toast.success("Meeting Terminated");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onToggleMic = () => {
    const nextState = !micOn;
    setMicOn(nextState);
    toggleMic(nextState);
  };

  const onToggleVideo = () => {
    const nextState = !videoOn;
    setVideoOn(nextState);
    toggleVideo(nextState);
  };

  if (loading) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#050505]">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="w-16 h-16 rounded-[24px] border-4 border-indigo-500 border-t-transparent shadow-[0_0_30px_rgba(79,70,229,0.3)] mb-8"
           />
           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic animate-pulse">Initializing Protocol...</h4>
        </div>
     );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden group transition-all duration-700">
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-30 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-5 pointer-events-auto">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="px-6 py-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center gap-4 shadow-2xl"
          >
             <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(239,44,44,0.5)]" />
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase italic">Node Hash</span>
                <span className="text-sm font-black text-white tracking-tighter uppercase">{meetingId}</span>
             </div>
          </motion.div>
          
          <button 
            onClick={handleCopy} 
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95 shadow-lg group/copy"
          >
             {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 group-hover/copy:scale-110" />}
          </button>
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto">
           <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] shadow-xl whitespace-nowrap">
              Participants: {1 + remoteUsers.length} Active
           </div>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="flex-1 p-12 flex items-center justify-center relative z-10 overflow-hidden">
        <div className={cn(
          "w-full h-full max-w-7xl grid gap-4 sm:gap-8 transition-all duration-500",
          remoteUsers.length === 0 ? "grid-cols-1 place-items-center" : 
          remoteUsers.length === 1 ? "grid-cols-1 sm:grid-cols-2" : 
          remoteUsers.length <= 3 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"
        )}>
           <VideoElement 
             track={localVideoTrack} 
             name={currentUser?.name} 
             avatar={currentUser?.avatar} 
             isLocal={true} 
           />

           {remoteUsers.map((user) => (
             <VideoElement 
               key={user.uid} 
               track={user.videoTrack} 
               name={`Remote Node ${user.uid}`} 
             />
           ))}
        </div>
        
        <div className="absolute inset-0 bg-[#050505] opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      </div>

      {/* Persistent Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-12 flex justify-center z-40 bg-gradient-to-t from-black/90 to-transparent">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.2 }}
          className="flex items-center gap-2 sm:gap-5 px-4 sm:px-10 py-3 sm:py-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[28px] sm:rounded-[40px] shadow-2xl ring-1 ring-white/5 max-w-[95vw] sm:max-w-none overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleMic}
              className={cn(
                "p-3 sm:p-6 rounded-2xl sm:rounded-[24px] transition-all duration-500 transform hover:scale-110 active:scale-90 shadow-lg",
                micOn ? "bg-white/5 text-white hover:bg-white/10" : "bg-red-600 text-white shadow-xl shadow-red-600/30"
              )}
            >
              {micOn ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <button
              onClick={onToggleVideo}
              className={cn(
                "p-3 sm:p-6 rounded-2xl sm:rounded-[24px] transition-all duration-500 transform hover:scale-110 active:scale-90 shadow-lg",
                videoOn ? "bg-white/5 text-white hover:bg-white/10" : "bg-red-600 text-white shadow-xl shadow-red-600/30"
              )}
            >
              {videoOn ? <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <button
               className="p-3 sm:p-6 rounded-2xl sm:rounded-[24px] bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg group/share hidden sm:block"
            >
               <ScreenShare className="w-5 h-5 sm:w-6 sm:h-6 group-hover/share:text-indigo-400" />
            </button>
          </div>

          <div className="w-px h-8 sm:h-12 bg-white/10 mx-1 sm:mx-3" />

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-3 sm:p-6 rounded-2xl sm:rounded-[24px] bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg opacity-40 hover:opacity-100 hidden sm:block">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button className="p-3 sm:p-6 rounded-2xl sm:rounded-[24px] bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg opacity-40 hover:opacity-100">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button
              onClick={handleLeave}
              className="p-3 sm:p-6 bg-red-600 text-white rounded-2xl sm:rounded-[24px] hover:bg-red-700 active:scale-90 transition-all shadow-xl shadow-red-600/40 font-black flex items-center justify-center gap-2 sm:gap-3 sm:pr-10 overflow-hidden relative group/btn"
            >
               <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
               <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 sm:ml-3 relative z-10" />
               <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] ml-1 sm:ml-2 relative z-10 hidden sm:block">Terminate</span>
               <span className="text-[9px] uppercase tracking-[0.3em] relative z-10 sm:hidden">End</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

