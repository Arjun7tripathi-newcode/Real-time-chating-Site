"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import axios from "axios";
import { MessageBubble } from "./MessageBubble";
import { InputBox } from "./InputBox";
import { UserAvatar } from "./UserAvatar";
import { TypingIndicator } from "./TypingIndicator";
import { useChatStore } from "@/hooks/use-chat-store";
import { useSocket, getSocket } from "@/hooks/use-socket";
import { Info, Hash, Lock, Copy, Check, Users, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getRelativeGroupDate } from "@/lib/utils";
import { ParticipantsList } from "./ParticipantsList";
import { MessageSkeleton } from "@/components/Skeleton";

export const ChatWindow = () => {
  const {
    activeConversation,
    activeRoom,
    activeGroup,
    setActiveGroup,
    messages,
    setMessages,
    addMessage,
    onlineUsers,
    currentUser,
    typingUsers,
  } = useChatStore();

  useSocket(); // Ensure socket connection is active and listeners are registered for this component
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isActive = !!(activeConversation || activeRoom || activeGroup);
  const isSelfChat = activeConversation?.conversationId === `self_${currentUser?.userId}`;

  // Fetch messages when active chat changes
  useEffect(() => {
    setMessages([]);
    if (!isActive) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        if (activeConversation) {
          const { data } = await axios.get(`/api/messages/${activeConversation._id}`);
          setMessages(data);
          getSocket()?.emit("join_private_chat", { conversationId: activeConversation._id });
        } else if (activeRoom) {
          const { data } = await axios.get(`/api/rooms/${activeRoom.roomId}`);
          setMessages(data);
          getSocket()?.emit("join_public_room", { roomId: activeRoom.roomId });
        } else if (activeGroup) {
          const { data } = await axios.get(`/api/groups/${activeGroup.privateChatId}/messages`);
          setMessages(data);
          getSocket()?.emit("join_private_chat", { conversationId: activeGroup.privateChatId });
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeConversation?._id, activeRoom?.roomId, activeGroup?._id, setMessages, isActive]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0 || typingUsers.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers]);

  const handleSendMessage = useCallback(
    async (text: string, expiresIn?: number) => {
      if (!currentUser || !text.trim()) return;
      const socket = getSocket();

      try {
        if (activeConversation) {
          const { data } = await axios.post(`/api/messages/${activeConversation._id}`, { text, expiresIn });
          addMessage(data);
          const otherParticipant = activeConversation.participants.find(p => p.userId !== currentUser.userId);
          socket?.emit("send_message", {
            type: "private",
            conversationId: activeConversation._id,
            message: text,
            sender: currentUser,
            expiresAt: data.expiresAt,
            recipientId: otherParticipant?.userId
          });
        } else if (activeRoom) {
          const { data } = await axios.put(`/api/rooms/${activeRoom.roomId}`, { text, expiresIn });
          addMessage(data);
          socket?.emit("send_message", {
            type: "public",
            roomId: activeRoom.roomId,
            message: text,
            sender: currentUser,
            expiresAt: data.expiresAt
          });
        } else if (activeGroup) {
          const { data } = await axios.post(`/api/groups/${activeGroup.privateChatId}/messages`, { text, expiresIn });
          addMessage(data);
          socket?.emit("send_message", {
            type: "private",
            conversationId: activeGroup.privateChatId,
            message: text,
            sender: currentUser,
            expiresAt: data.expiresAt
          });
        }

        socket?.emit("stop_typing", {
          type: "private",
          conversationId: activeConversation?._id || activeGroup?.privateChatId,
          roomId: activeRoom?.roomId,
          userId: currentUser.userId,
        });
      } catch (err) {
        console.error("Send failed", err);
      }
    },
    [activeConversation, activeRoom, activeGroup, currentUser, addMessage]
  );

  const handleTyping = useCallback(() => {
    const socket = getSocket();
    socket?.emit("typing", {
      type: "private",
      conversationId: activeConversation?._id || activeGroup?.privateChatId,
      roomId: activeRoom?.roomId,
      userId: currentUser?.userId,
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit("stop_typing", {
        type: "private",
        conversationId: activeConversation?._id || activeGroup?.privateChatId,
        roomId: activeRoom?.roomId,
        userId: currentUser?.userId,
      });
    }, 2000);
  }, [activeConversation, activeRoom, activeGroup, currentUser]);

  const copyId = () => {
    const id = activeRoom?.roomId || activeGroup?.privateChatId;
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] relative overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="text-center p-12 relative z-10"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[44px] mx-auto mb-10 flex items-center justify-center shadow-[0_20px_50px_rgba(59,130,246,0.25)] ring-4 ring-white dark:ring-black">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Your Workspace. <br/> <span className="text-blue-500">Pure Protocol.</span></h3>
          <p className="text-gray-400 dark:text-zinc-500 font-bold italic max-w-sm leading-relaxed mx-auto uppercase tracking-widest text-[10px]">
            Connect instantly with friends or drop into public communities. <br /> Security first. Experience always.
          </p>
          <div className="mt-12 flex items-center justify-center gap-4">
             <div className="flex items-center gap-2 group cursor-pointer">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                <span className="text-[9px] font-black text-zinc-500 group-hover:text-zinc-400 uppercase tracking-[0.3em] transition-colors">Network: Active</span>
             </div>
             <div className="w-px h-3 bg-zinc-800" />
             <div className="flex items-center gap-2 group cursor-pointer">
                <Lock className="w-3 h-3 text-zinc-700" />
                <span className="text-[9px] font-black text-zinc-500 group-hover:text-zinc-400 uppercase tracking-[0.3em] transition-colors">Encrypted</span>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const otherUser = activeConversation?.participants[0];
  const isOnline = otherUser ? onlineUsers.includes(otherUser.userId) : false;
  const typingName = typingUsers.length > 0 ? (otherUser?.name ?? "Someone") : "";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#050505] transition-colors relative lg:rounded-r-[40px] w-full">
      <AnimatePresence>
        {showMembers && activeGroup && (
          <ParticipantsList 
            group={activeGroup} 
            onClose={() => setShowMembers(false)} 
            onGroupUpdated={(g) => { 
               if (setActiveGroup) setActiveGroup(g);
               // Handle group list update if needed
            }} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 lg:px-10 py-3 sm:py-6 border-b border-gray-100 dark:border-zinc-900 flex-shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-5">
          {activeConversation ? (
            <>
              {isSelfChat ? (
                <div className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 font-bold">
                  <Lock className="w-5 h-5" />
                </div>
              ) : (
                <div className="relative">
                  <UserAvatar src={otherUser?.avatar} name={otherUser?.name} className="h-12 w-12 ring-2 ring-blue-500/5 shadow-md" />
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#050505] rounded-full shadow-sm" />
                  )}
                </div>
              )}
              <div>
                <p className="font-black text-base text-gray-900 dark:text-white leading-tight tracking-tight">
                  {isSelfChat ? "Personal Workspace" : otherUser?.name}
                </p>
                {isSelfChat ? (
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 italic">Private Cloud Storage</p>
                ) : (
                  <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1.5 transition-colors", isOnline ? "text-green-500" : "text-zinc-600")}>
                    {isOnline ? "Protocol: Active" : "Status: Dormant"}
                  </div>
                )}
              </div>
            </>
          ) : activeGroup ? (
            <>
              <button 
                onClick={() => setShowMembers(true)}
                className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Users className="w-5 h-5" />
              </button>
              <div>
                <p className="font-black text-base text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-2">
                   {activeGroup.name}
                   <span className="text-[8px] font-black bg-violet-500/10 text-violet-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Private</span>
                </p>
                <button 
                  onClick={copyId} 
                  className="group flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-blue-500 transition-all font-bold mt-1"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 group-hover:scale-110" />}
                  {activeGroup.privateChatId}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-base text-gray-900 dark:text-white leading-tight tracking-tight">{activeRoom?.name}</p>
                <button onClick={copyId} className="group flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-blue-500 transition-all font-bold mt-1">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 group-hover:scale-110" />}
                  {activeRoom?.roomId}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => activeGroup && setShowMembers(true)}
             className="p-3.5 text-zinc-400 dark:text-zinc-700 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 rounded-2xl transition-all"
           >
             <Info className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 lg:px-10 py-4 sm:py-10 space-y-3 relative">
        {loading ? (
           <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-50">
            <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900/40 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
               <AlertCircle className="w-8 h-8 text-zinc-400 dark:text-zinc-800" />
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-600 font-black uppercase tracking-[0.3em] max-w-[220px]">
               No transmission history found for this node.
            </p>
          </div>
        ) : (
          <>
            {messages.reduce((acc, msg, i) => {
              const prevMsg = messages[i - 1];
              const msgDate = getRelativeGroupDate(msg.createdAt);
              const prevDate = prevMsg ? getRelativeGroupDate(prevMsg.createdAt) : null;

              if (msgDate !== prevDate) {
                acc.push(
                  <div key={`date-${msgDate}`} className="flex justify-center my-6">
                    <span className="px-4 py-1.5 bg-gray-100/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest border border-gray-200/50 dark:border-zinc-800/50 shadow-sm">
                      {msgDate}
                    </span>
                  </div>
                );
              }

              const senderObj = msg.senderId as any;
              const isMine =
                senderObj?.clerkId === currentUser?.clerkId ||
                senderObj?.userId === currentUser?.userId;

              const nextMsg = messages[i + 1];
              const nextSenderObj = nextMsg?.senderId as any;
              const isNextSameSender = !!(
                nextSenderObj &&
                (nextSenderObj.clerkId === senderObj?.clerkId ||
                 nextSenderObj.userId === senderObj?.userId)
              );
              
              const prevMsgSameGrp = messages[i - 1]; // Make sure it's in the same date group! However, we can just rely on basic comparison
              const prevSenderObj = prevMsgSameGrp?.senderId as any;
              const isPrevSameSender = !!(
                prevSenderObj &&
                (prevSenderObj.clerkId === senderObj?.clerkId ||
                 prevSenderObj.userId === senderObj?.userId) && 
                msgDate === prevDate
              );

              acc.push(
                <MessageBubble 
                   key={msg._id ?? `opt_${i}`} 
                   message={msg} 
                   isMine={isMine} 
                   isNextSameSender={isNextSameSender && msgDate === (nextMsg ? getRelativeGroupDate(nextMsg.createdAt) : null)}
                   isPrevSameSender={isPrevSameSender}
                />
              );

              return acc;
            }, [] as React.ReactNode[])}
          </>
        )}
        <AnimatePresence>
          {typingName && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
              <TypingIndicator name={typingName} />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} className="h-6" />
      </div>

      <div className="px-3 sm:px-6 lg:px-10 pb-3 sm:pb-10 pt-3 bg-white dark:bg-[#050505] flex-shrink-0 z-20">
        <InputBox onSendMessage={handleSendMessage} onTyping={handleTyping} />
        <div className="flex justify-center mt-6">
           <div className="px-4 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900/50 flex items-center gap-2">
              <div className="h-1 w-1 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest leading-none">Security Protocol: E2EE Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};
