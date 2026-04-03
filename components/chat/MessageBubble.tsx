"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "./UserAvatar";
import { cn, formatDate } from "@/lib/utils";
import { Check, CheckCheck, Flame, MoreHorizontal, Trash2, Edit3, UserX, Globe2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import axios from "axios";
import { getSocket } from "@/hooks/use-socket";
import { EditMessageModal } from "./EditMessageModal";

interface Message {
  _id?: string;
  senderId: any;
  text?: string;
  message?: string;
  createdAt: string;
  expiresAt?: string | Date;
  type?: string;
  seenBy?: any[];
  conversationId?: string;
  roomId?: string;
  reactions?: { emoji: string; userId: string | any }[];
  isDeleted?: boolean;
  deletedFor?: string[];
  edited?: boolean;
  editedAt?: Date | string;
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isNextSameSender?: boolean;
  isPrevSameSender?: boolean;
}

export const MessageBubble = ({ message, isMine, isNextSameSender, isPrevSameSender }: MessageBubbleProps) => {
  const [isExpired, setIsExpired] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  
  const { currentUser, updateMessage } = useChatStore();
  const text = message.text || message.message || "";
  const sender = message.senderId as any;
  const isSeen = (message.seenBy?.length ?? 0) > 0;
  const isDeleted = message.isDeleted;
  const isHidden = message.deletedFor?.includes(currentUser?._id!);

  // Handle Disappearing Messages countdown
  useEffect(() => {
    if (!message.expiresAt || isDeleted) return;
    
    const tick = () => {
      const expireTime = new Date(message.expiresAt!).getTime();
      const now = Date.now();
      const diff = Math.ceil((expireTime - now) / 1000);
      
      if (diff <= 0) {
        setIsExpired(true);
        setSecondsLeft(0);
      } else {
        setSecondsLeft(diff);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [message.expiresAt, isDeleted]);

  if (isExpired || isHidden) return null;

  const handleEdit = async (newText: string) => {
    if (!message._id) return;
    setIsEditing(false);

    try {
      const { data } = await axios.patch(`/api/messages/action/${message._id}`, { text: newText });
      updateMessage(message._id, { text: data.text, edited: true, editedAt: data.editedAt });
      
      const socket = getSocket();
      socket?.emit("edit_message", { 
        messageId: message._id, 
        text: data.text, 
        conversationId: message.conversationId, 
        roomId: message.roomId,
        edited: true,
        editedAt: data.editedAt
      });
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const handleDelete = async (mode: "everyone" | "me") => {
    if (!message._id) return;
    setShowActions(false);

    try {
      await axios.delete(`/api/messages/action/${message._id}?mode=${mode}`);
      if (mode === "everyone") {
        updateMessage(message._id, { isDeleted: true, text: "This message was deleted" });
        getSocket()?.emit("delete_message", {
          messageId: message._id,
          conversationId: message.conversationId,
          roomId: message.roomId,
          mode: "everyone"
        });
      } else {
        updateMessage(message._id, { deletedFor: [...(message.deletedFor || []), currentUser?._id!] });
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const canEdit = isMine && !isDeleted && (new Date().getTime() - new Date(message.createdAt).getTime() < 5 * 60 * 1000);

  const handleReact = async (emoji: string) => {
    if (!message._id || !currentUser || isDeleted) return;
    
    // Optimistic Update
    const currentReactions = message.reactions || [];
    const hasReacted = currentReactions.find(r => (r.userId?._id || r.userId) === currentUser._id && r.emoji === emoji);
    
    let newReactions = [...currentReactions];
    if (hasReacted) {
      newReactions = newReactions.filter(r => !((r.userId?._id || r.userId) === currentUser._id && r.emoji === emoji));
    } else {
      newReactions.push({ emoji, userId: currentUser._id });
    }
    
    updateMessage(message._id, { reactions: newReactions });
    setShowReactions(false);

    try {
      await axios.post(`/api/react/${message._id}`, { emoji });
      const socket = getSocket();
      socket?.emit("message_reaction", {
        messageId: message._id,
        emoji,
        userId: currentUser._id,
        conversationId: message.conversationId,
        roomId: message.roomId
      });
    } catch (err) {
      console.error("Reaction failed", err);
      updateMessage(message._id, { reactions: currentReactions }); // rollback
    }
  };

  const marginClass = isNextSameSender ? "mb-1" : "mb-6";
  
  let bubbleClasses = isMine
    ? "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-blue-500/10 hover:shadow-blue-500/20"
    : "bg-white/50 dark:bg-zinc-900/40 backdrop-blur-3xl border border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 hover:border-blue-500/20";
    
  if (isDeleted) {
    bubbleClasses = "bg-gray-50/50 dark:bg-zinc-900/30 border border-dashed border-gray-200 dark:border-zinc-800 text-gray-400 italic backdrop-blur-md";
  }

  let borderRadiusClass = "rounded-[22px]";
  if (isMine) {
    borderRadiusClass = isNextSameSender ? "rounded-[22px] rounded-br-[6px]" : "rounded-[22px] rounded-br-[4px]";
  } else {
    borderRadiusClass = isNextSameSender ? "rounded-[22px] rounded-bl-[6px]" : "rounded-[22px] rounded-bl-[4px]";
  }

  const quickEmojis = ["❤️", "😂", "🔥", "👍"];

  return (
    <>
      <AnimatePresence>
        {isEditing && (
          <EditMessageModal 
            initialText={text} 
            onSave={handleEdit} 
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onContextMenu={(e) => { e.preventDefault(); !isDeleted && setShowActions(!showActions); }}
        className={cn(`flex w-full ${marginClass} gap-4 px-2 group`, isMine ? "flex-row-reverse" : "flex-row")}
      >
        {!isMine && (
          <div className="flex-shrink-0 w-10 flex flex-col justify-end">
            {!isNextSameSender && (
              <UserAvatar 
                src={sender?.avatar} 
                name={sender?.name} 
                className="h-10 w-10 ring-2 ring-blue-500/5 shadow-xl mb-1 active:scale-95 transition-all" 
              />
            )}
          </div>
        )}

        <div className={cn("flex flex-col max-w-[85%] sm:max-w-[70%]", isMine ? "items-end" : "items-start")}>
          {!isMine && !isPrevSameSender && (
            <p className="text-[10px] font-black text-gray-300 dark:text-zinc-700 mb-1 ml-2 uppercase tracking-[0.2em] italic">
              {sender?.name}
            </p>
          )}
          
          <div className="relative">
            <div
              onClick={() => !isDeleted && setShowReactions(!showReactions)}
              onDoubleClick={() => !isDeleted && handleReact("❤️")}
              className={cn(
                "relative px-4 sm:px-5 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-medium leading-relaxed shadow-sm transition-all duration-300 cursor-pointer select-none break-words whitespace-pre-wrap",
                bubbleClasses,
                borderRadiusClass
              )}
            >
              {text}
              {message.edited && !isDeleted && (
                <span className="text-[8px] font-black opacity-40 ml-2 uppercase tracking-widest italic">(edited)</span>
              )}
            </div>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={cn(
                    "absolute z-[60] top-full mt-2 min-w-[200px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-2 rounded-3xl shadow-2xl backdrop-blur-3xl overflow-hidden",
                    isMine ? "right-0" : "left-0"
                  )}
                >
                  <div className="p-2 border-b border-gray-50 dark:border-zinc-900/50 mb-1">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-2">Message Actions</p>
                  </div>
                  
                  {canEdit && (
                    <button
                      onClick={() => { setShowActions(false); setIsEditing(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-blue-500" /> Edit Metadata
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete("me")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                  >
                    <UserX className="w-4 h-4 text-orange-500" /> Delete for Me
                  </button>

                  {isMine && (
                    <button
                      onClick={() => handleDelete("everyone")}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                    >
                      <Globe2 className="w-4 h-4" /> Delete for Everyone
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showReactions && !isDeleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className={cn(
                    "absolute z-50 bottom-full mb-1 flex items-center gap-1 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl backdrop-blur-xl",
                    isMine ? "right-0" : "left-0"
                  )}
                >
                  {quickEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button onClick={() => { setShowReactions(false); setShowActions(true); }} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full transition-all">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {message.reactions && message.reactions.length > 0 && !isDeleted && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "absolute -bottom-2 flex items-center gap-1 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-gray-100/50 dark:border-zinc-700/50 rounded-full px-2 py-0.5 shadow-xl ring-1 ring-black/5",
                  isMine ? "right-2" : "left-2"
                )}
              >
                <div className="flex -space-x-1">
                  {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => (
                    <span key={emoji} className="text-[11px] drop-shadow-sm">{emoji}</span>
                  ))}
                </div>
                <span className="text-[9px] font-black ml-0.5 text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {message.reactions.length}
                </span>
              </motion.div>
            )}
          </div>

          {!isNextSameSender && (
            <div className={cn("flex items-center gap-1.5 mt-1.5 px-1", isMine ? "flex-row-reverse" : "flex-row")}>
              <p className="text-[9px] font-black text-gray-300 dark:text-zinc-700 uppercase tracking-widest">
                {formatDate(message.createdAt)}
              </p>
              {message.expiresAt && !isDeleted && (
                <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  {secondsLeft && <span>{secondsLeft}s</span>}
                </div>
              )}
              {isMine && (
                <motion.div 
                  animate={{ scale: isSeen ? 1.1 : 1 }}
                  className={cn("transition-colors", isSeen ? "text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-gray-300 dark:text-zinc-800")}
                >
                  {isSeen ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};
