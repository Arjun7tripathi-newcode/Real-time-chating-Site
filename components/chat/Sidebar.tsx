"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useChatStore } from "@/hooks/use-chat-store";
import { UserAvatar } from "./UserAvatar";
import { cn, formatDate } from "@/lib/utils";
import { Search, Plus, Hash, Users, Copy, Check, Lock, Sparkles, UserPlus, Globe } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { UserSearchModal } from "./UserSearchModal";
import { CreateRoomModal } from "./CreateRoomModal";
import { JoinRoomModal } from "./JoinRoomModal";
import { CreatePrivateChatModal } from "./CreatePrivateChatModal";
import { useSocket, getSocket } from "@/hooks/use-socket";
import { useDebounce } from "@/hooks/use-debounce";
import { SidebarSkeleton } from "@/components/Skeleton";

type Tab = "private" | "public";

export const Sidebar = () => {
  const {
    currentUser, conversations, setConversations, activeConversation, setActiveConversation,
    rooms, setRooms, activeRoom, setActiveRoom, onlineUsers, groups, setGroups, activeGroup, setActiveGroup
  } = useChatStore();

  useSocket(); // Maintain connection and listeners
  const [tab, setTab] = useState<Tab>("private");
  const [search, setSearch] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convRes, groupRes] = await Promise.all([
          axios.get("/api/conversations"),
          axios.get("/api/groups")
        ]);
        setConversations(convRes.data);
        if (setGroups) setGroups(groupRes.data);
        
        // AUTO-JOIN all conversation rooms for real-time delivery
        const socket = getSocket();
        if (socket) {
          convRes.data.forEach((c: any) => {
            socket.emit("join_private_chat", { conversationId: c._id });
          });
          groupRes.data.forEach((g: any) => {
             socket.emit("join_private_chat", { conversationId: g.privateChatId });
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setConversations, setGroups]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get(`/api/rooms?type=${tab}`);
        if (tab === "public") setRooms(data);
      } catch {}
    };
    if (tab === "public") fetchRooms();
  }, [tab, setRooms]);

  const handleCopyId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = (room: any) => {
    const socket = getSocket();
    setActiveRoom(room);
    socket?.emit("join_public_room", { roomId: room.roomId });
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "private", label: "Chats", icon: Users },
    { key: "public", label: "Rooms", icon: Hash },
  ];

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const other = c.participants[0];
      const isSelf = c.conversationId === `self_${currentUser?.userId}`;
      if (isSelf) return true; 
      return other?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
             other?.userId?.toLowerCase().includes(debouncedSearch.toLowerCase());
    });
  }, [conversations, debouncedSearch, currentUser?.userId]);

  const filteredGroups = useMemo(() => {
    return groups?.filter((g: any) => 
      g.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      g.privateChatId.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) || [];
  }, [groups, debouncedSearch]);

  const selfChat = useMemo(() => 
    conversations.find(c => c.conversationId === `self_${currentUser?.userId}`),
    [conversations, currentUser?.userId]
  );
  
  const otherChats = useMemo(() => 
    filteredConversations.filter(c => c.conversationId !== `self_${currentUser?.userId}`),
    [filteredConversations, currentUser?.userId]
  );

  const handleSetActiveConversation = (conv: any) => {
    setActiveConversation(conv);
  };

  const handleSetActiveGroup = (group: any) => {
    if (setActiveGroup) setActiveGroup(group);
  };

  return (
    <>
      <AnimatePresence>
        {showUserSearch && <UserSearchModal onClose={() => setShowUserSearch(false)} />}
        {showCreateGroup && <CreatePrivateChatModal onClose={() => setShowCreateGroup(false)} />}
        {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} />}
        {showJoinRoom && <JoinRoomModal onClose={() => setShowJoinRoom(false)} />}
      </AnimatePresence>

      <div className="w-full h-full flex flex-col bg-white border-r border-gray-100 flex-shrink-0 dark:bg-[#080808] dark:border-zinc-900 transition-all overflow-hidden lg:rounded-l-[40px]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-900 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar src={currentUser?.avatar} name={currentUser?.name} className="h-10 w-10 ring-2 ring-blue-500/10 shadow-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#080808] rounded-full" />
              </div>
              <div className="flex flex-col">
                <p className="font-black text-sm text-gray-900 dark:text-zinc-100 tracking-tight">{currentUser?.name || "Initializing..."}</p>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 text-[10px] font-mono text-blue-500 font-bold hover:text-blue-600 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {currentUser?.userId || "---"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }} />
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-zinc-900/50 rounded-2xl p-1.5 gap-1 shadow-inner">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                  tab === key 
                    ? "bg-white text-gray-900 shadow-xl shadow-black/5 dark:bg-zinc-800 dark:text-zinc-100" 
                    : "text-gray-400 hover:text-gray-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", tab === key ? "text-blue-500" : "")} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="px-6 py-5 border-b border-gray-50 dark:border-zinc-900/50">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder={tab === "private" ? "Search messengers..." : "Search rooms..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900/30 rounded-2xl text-[13px] font-medium border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500/20 transition-all outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-1.5">
               {tab === "private" ? (
                 <>
                   <button
                     onClick={() => setShowUserSearch(true)}
                     className="p-3.5 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                     title="New 1:1 Chat"
                   >
                     <Plus className="w-5 h-5" />
                   </button>
                   <button
                     onClick={() => setShowCreateGroup(true)}
                     className="p-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:bg-zinc-800 dark:hover:bg-gray-100 active:scale-95 transition-all shadow-xl"
                     title="New Group Chat"
                   >
                     <UserPlus className="w-5 h-5" />
                   </button>
                 </>
               ) : (
                 <button
                   onClick={() => setShowCreateRoom(true)}
                   className="p-3.5 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               )}
            </div>
          </div>

          {tab === "public" && (
            <button
              onClick={() => setShowJoinRoom(true)}
              className="w-full mt-3 py-3 text-[10px] font-black text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 rounded-2xl transition-all uppercase tracking-[0.2em] border border-blue-500/10"
            >
              Join via Room ID
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {loading ? (
             <SidebarSkeleton />
          ) : tab === "private" ? (
            <div className="space-y-1">
              {selfChat && (
                <div className="mb-4">
                  <p className="px-5 py-2 text-[10px] font-black text-gray-300 dark:text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                    <Check className="w-3 h-3" /> Pinned
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActiveConversation(selfChat);
                    }}
                    className={cn(
                      "w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-900/40 rounded-[28px] transition-all text-left relative group z-10",
                      activeConversation?._id === selfChat._id && "bg-blue-50 dark:bg-blue-500/5 ring-1 ring-blue-500/10"
                    )}
                  >
                    <div className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-bold text-[15px] text-gray-900 dark:text-white">Personal Notes</p>
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter bg-blue-500/10 px-1.5 py-0.5 rounded-md italic">Me</span>
                      </div>
                      <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 truncate">{selfChat.lastMessage?.text || "Save messages, links & ideas"}</p>
                    </div>
                  </button>
                </div>
              )}

              <p className="px-5 py-2 text-[10px] font-black text-gray-300 dark:text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3" /> Conversations
              </p>
              
              {otherChats.map((conv) => {
                const other = conv.participants[0];
                const isActive = activeConversation?._id === conv._id;
                const isOnline = onlineUsers.includes(other?.userId);
                return (
                  <motion.button
                    layout
                    key={`conv_${conv._id}`}
                    onClick={(e) => {
                       e.stopPropagation();
                       handleSetActiveConversation(conv);
                    }}
                    className={cn(
                      "w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-900/40 rounded-[28px] transition-all text-left relative group mb-0.5 z-10",
                      isActive && "bg-blue-50 dark:bg-blue-500/5 ring-1 ring-blue-500/10"
                    )}
                  >
                    <UserAvatar src={other?.avatar} name={other?.name} isOnline={isOnline} className="h-12 w-12 shadow-sm group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-bold text-[15px] text-gray-900 dark:text-zinc-100 truncate">{other?.name}</p>
                        <span className="text-[10px] font-bold text-gray-400">{conv.lastMessage ? formatDate(conv.updatedAt) : ""}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 truncate group-hover:text-gray-600 transition-colors flex-1 mr-2">
                          {conv.lastMessage?.text || "Start a conversation"}
                        </p>
                        {(conv.unreadCount ?? 0) > 0 && (
                          <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-blue-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-500/30 animate-in zoom-in">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {filteredGroups.map((group: any) => {
                const isActive = activeGroup?._id === group._id;
                return (
                  <motion.button
                    layout
                    key={group._id}
                    onClick={() => handleSetActiveGroup(group)}
                    className={cn(
                      "w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-900/40 rounded-[28px] transition-all text-left relative group mb-0.5",
                      isActive && "bg-violet-50 dark:bg-violet-500/5 ring-1 ring-violet-500/10"
                    )}
                  >
                    <div className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-bold text-[15px] text-gray-900 dark:text-zinc-100 truncate">{group.name}</p>
                        <span className="text-[10px] font-bold text-gray-400">{group.lastMessage ? formatDate(group.updatedAt) : ""}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                           <span className="text-[9px] font-black text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-md uppercase">Group</span>
                           <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 truncate group-hover:text-gray-600 transition-colors">
                              {group.lastMessage?.text || `${group.participants.length} participants`}
                           </p>
                        </div>
                        {(group.unreadCount ?? 0) > 0 && (
                           <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-violet-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-violet-500/30 animate-in zoom-in ml-2">
                             {group.unreadCount}
                           </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {conversations.length === 0 && (filteredGroups?.length === 0) && (
                <div className="flex flex-col items-center justify-center h-80 text-gray-300 dark:text-zinc-800 text-center p-6 bg-gray-50/50 dark:bg-zinc-950/50 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-zinc-900 mt-4">
                  <Sparkles className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm font-bold text-gray-400 italic">No connections yet.<br />
                    <span className="text-blue-500 cursor-pointer not-italic hover:underline" onClick={() => setShowUserSearch(true)}>Launch your first chat.</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-5 py-2 text-[10px] font-black text-gray-300 dark:text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3 text-blue-500" /> Public Communities
              </p>
              {rooms
                .filter((r) => r.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
                .map((room) => {
                  const isActive = activeRoom?.roomId === room.roomId;
                  return (
                    <button
                      key={room._id}
                      onClick={() => handleJoinRoom(room)}
                      className={cn(
                        "w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-900/40 rounded-[28px] transition-all text-left relative group mb-0.5",
                        isActive && "bg-blue-50 dark:bg-blue-500/5 ring-1 ring-blue-500/10"
                      )}
                    >
                      <div className="h-12 w-12 rounded-[20px] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-all">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="font-bold text-[15px] text-gray-900 dark:text-zinc-100 truncate">{room.name}</p>
                          <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-tight">Active</span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-400 font-bold tracking-tight mt-0.5">{room.roomId}</p>
                      </div>
                    </button>
                  );
                })}
              {rooms.length === 0 && (
                <div className="flex flex-col items-center justify-center h-80 text-gray-300 dark:text-zinc-800 text-center p-6 bg-gray-50/50 dark:bg-zinc-950/50 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-zinc-900 mt-4">
                  <Hash className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm font-bold text-gray-400 italic">No rooms populated.<br /><span className="text-blue-500">Create the first one!</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
