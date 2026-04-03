"use client";

import { useEffect, useRef } from "react";
import type { 
  ICameraVideoTrack
} from "agora-rtc-sdk-ng";
import { UserAvatar } from "../chat/UserAvatar";
import { cn } from "@/lib/utils";

interface Props {
  track?: any;
  name?: string;
  avatar?: string;
  isLocal?: boolean;
}

export const VideoElement = ({ track, name, avatar, isLocal }: Props) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (track && videoRef.current) {
      track.play(videoRef.current);
    }
    return () => {
      if (track) {
        track.stop();
      }
    };
  }, [track]);

  return (
    <div className={cn(
      "w-full h-full relative bg-zinc-900 rounded-[40px] overflow-hidden border border-white/10 group shadow-2xl reflection-effect transition-all",
      track ? "opacity-100" : "opacity-90"
    )}>
      {track ? (
        <div ref={videoRef} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] space-y-4">
           <div className="h-40 w-40 rounded-full overflow-hidden border-8 border-white/5 shadow-2xl ring-4 ring-black/50">
              <UserAvatar src={avatar} name={name} className="h-full w-full opacity-40 grayscale" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Awaiting Transmission</p>
        </div>
      )}
      
      <div className="absolute bottom-8 left-8 flex items-center gap-4 px-6 py-3 bg-[#050505]/70 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
         <span className={cn(
           "h-2 w-2 rounded-full",
           track ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,44,44,0.5)]"
         )} />
         <p className="text-[10px] font-black tracking-[0.2em] text-white uppercase italic truncate max-w-[120px]">
           {name || "Protocol Node"} {isLocal && "(Me)"}
         </p>
      </div>

      <style jsx>{`
        .reflection-effect::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%, rgba(255,255,255,0.02) 100%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
