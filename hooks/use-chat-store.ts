import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  avatar: string;
  userId: string;
  clerkId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  _id?: string;
  senderId: User | string;
  text?: string;
  message?: string;
  conversationId?: string;
  roomId?: string;
  privateChatId?: string;
  type: "private" | "public" | "meeting" | "group";
  createdAt: string;
  seen?: boolean;
  seenBy?: User[];
  reactions?: { emoji: string; userId: string | any }[];
  isDeleted?: boolean;
  deletedFor?: string[];
  edited?: boolean;
  editedAt?: Date | string;
  expiresAt?: string | Date;
}

export interface Conversation {
  _id: string;
  conversationId?: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
  unreadCount?: number;
}

export interface Room {
  _id: string;
  roomId: string;
  name: string;
  type: "public" | "meeting";
  createdBy: User;
}

export interface PrivateGroup {
  _id: string;
  privateChatId: string;
  name: string;
  participants: User[];
  createdBy: string;
  lastMessage?: Message;
  updatedAt: string;
  unreadCount?: number;
}

interface ChatStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
  activeConversation: Conversation | null;
  setActiveConversation: (c: Conversation | null) => void;

  rooms: Room[];
  setRooms: (r: Room[]) => void;
  activeRoom: Room | null;
  setActiveRoom: (r: Room | null) => void;

  groups: PrivateGroup[];
  setGroups: (g: PrivateGroup[]) => void;
  updateGroupLastMessage: (privateChatId: string, message: Message) => void;
  activeGroup: PrivateGroup | null;
  setActiveGroup: (g: PrivateGroup | null) => void;

  messages: Message[];
  setMessages: (m: Message[]) => void;
  addMessage: (m: Message) => void;
  updateMessage: (id: string, data: Partial<Message>) => void;
  
  incrementUnreadCount: (id: string) => void;
  clearUnreadCount: (id: string) => void;

  onlineUsers: string[];
  setOnlineUsers: (u: string[]) => void;

  viewMode: "private" | "public" | "meeting" | "group" | null;
  setViewMode: (v: "private" | "public" | "meeting" | "group" | null) => void;

  typingUsers: string[];
  setTypingUser: (userId: string, isTyping: boolean) => void;

  // New: Mode & Meeting
  appMode: "chat" | "meet";
  setAppMode: (mode: "chat" | "meet") => void;
  activeMeeting: string | null; // meetingId
  setActiveMeeting: (id: string | null) => void;

  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),

  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  updateConversationLastMessage: (id, msg) => set((s) => ({
    conversations: s.conversations.map((c) => 
      c._id === id ? { ...c, lastMessage: msg, updatedAt: new Date().toISOString() } : c
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  })),

  activeConversation: null,
  setActiveConversation: (activeConversation) =>
    set((s) => ({
      activeConversation,
      activeRoom: null,
      activeGroup: null,
      viewMode: "private",
      messages: [],
      isSidebarOpen: false,
      // Add to list if not already there + Clear unread locally
      conversations: (activeConversation && !s.conversations.some(c => c._id === activeConversation?._id)
        ? [activeConversation, ...s.conversations]
        : s.conversations.map(c => c._id === activeConversation?._id ? { ...c, unreadCount: 0 } : c)
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    })),

  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  activeRoom: null,
  setActiveRoom: (activeRoom) =>
    set({ activeRoom, activeConversation: null, activeGroup: null, viewMode: (activeRoom?.type as any) ?? null, messages: [], isSidebarOpen: false }),

  groups: [],
  setGroups: (groups) => set({ groups }),
  updateGroupLastMessage: (id, msg) => set((s) => ({
    groups: s.groups.map((g) => 
      g.privateChatId === id ? { ...g, lastMessage: msg, updatedAt: new Date().toISOString() } : g
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  })),

  activeGroup: null,
  setActiveGroup: (activeGroup) =>
    set((s) => ({
      activeGroup,
      activeConversation: null,
      activeRoom: null,
      viewMode: "group",
      messages: [],
      isSidebarOpen: false,
      // Add to list if not already there + Clear unread locally
      groups: (activeGroup && !s.groups.some(g => g._id === activeGroup?._id)
        ? [activeGroup, ...s.groups]
        : s.groups.map(g => g._id === activeGroup?._id ? { ...g, unreadCount: 0 } : g)
      )
    })),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateMessage: (id, data) => set((s) => ({
    messages: s.messages.map((m) => (m._id === id ? { ...m, ...data } : m)),
  })),

  incrementUnreadCount: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === id ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
      ),
      groups: s.groups.map((g) =>
        g.privateChatId === id ? { ...g, unreadCount: (g.unreadCount || 0) + 1 } : g
      ),
    })),

  clearUnreadCount: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === id ? { ...c, unreadCount: 0 } : c
      ),
      groups: s.groups.map((g) =>
        g.privateChatId === id ? { ...g, unreadCount: 0 } : g
      ),
    })),

  onlineUsers: [],
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  viewMode: null,
  setViewMode: (viewMode) => set({ viewMode }),

  typingUsers: [],
  setTypingUser: (userId, isTyping) =>
    set((s) => ({
      typingUsers: isTyping
        ? [...s.typingUsers.filter((id) => id !== userId), userId]
        : s.typingUsers.filter((id) => id !== userId),
    })),

  // Mode & Meeting Defaults
  appMode: "chat",
  setAppMode: (appMode) => set({ appMode }),
  activeMeeting: null,
  setActiveMeeting: (activeMeeting) => set({ activeMeeting }),

  isSidebarOpen: true,
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}));
