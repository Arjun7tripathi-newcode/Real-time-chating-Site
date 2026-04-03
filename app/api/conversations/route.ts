import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { receiverId } = await req.json();

    await connectToDatabase();

    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById(receiverId);

    if (!currentUser || !targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if 1-to-1 conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, targetUser._id], $size: 2 },
    }).populate("participants", "name clerkId userId avatar isOnline lastSeen");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUser._id, targetUser._id],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name clerkId userId avatar isOnline lastSeen"
      );
    }

    // Filter participants for front-end consistency (exclude current user)
    const conversationObj = conversation.toObject();
    conversationObj.participants = conversationObj.participants.filter(
      (p: any) => p.clerkId !== userId
    );

    return NextResponse.json(conversationObj);
  } catch (error) {
    console.error("[CONVERSATION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) return NextResponse.json([]);

    const conversations = await Conversation.find({
      participants: currentUser._id,
      $or: [
        { lastMessage: { $exists: true, $ne: null } },
        { conversationId: { $regex: "^self_" } }
      ]
    })
      .populate("participants", "name clerkId userId avatar isOnline lastSeen")
      .populate({
        path: "lastMessage",
        select: "text createdAt",
      })
      .sort({ updatedAt: -1 });

    // Return conversations with the OTHER participant first + unreadCount
    const result = await Promise.all(conversations.map(async (conv) => {
      const others = conv.participants.filter(
        (p: any) => p.clerkId !== userId
      );

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: currentUser._id },
        seenBy: { $ne: currentUser._id }
      });

      return {
        ...conv.toObject(),
        participants: others, // Front-end only needs the other user(s)
        unreadCount
      };
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CONVERSATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
