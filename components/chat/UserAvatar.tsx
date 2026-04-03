"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name?: string;
  className?: string;
  isOnline?: boolean;
}

export const UserAvatar = ({ src, name, className, isOnline }: UserAvatarProps) => {
  const initials = name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className={cn("relative flex-shrink-0 h-10 w-10", className)}>
      <div className="h-full w-full rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center">
        {src ? (
          <Image src={src} alt={name || "User"} width={48} height={48} className="h-full w-full object-cover" />
        ) : (
          <span className="text-white font-bold text-sm">{initials}</span>
        )}
      </div>
      {isOnline !== undefined && (
        <div className={cn(
          "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#050505] flex items-center justify-center transition-all duration-500",
          isOnline ? "bg-green-500" : "bg-gray-300"
        )}>
          {isOnline && (
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>
      )}
    </div>
  );
};
