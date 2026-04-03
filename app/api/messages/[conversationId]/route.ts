import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { conversationId } = await params;

    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });

    if (currentUser) {
      // Mark all messages as seen by me
      await Message.updateMany(
        { conversationId, senderId: { $ne: currentUser._id }, seenBy: { $ne: currentUser._id } },
        { $addToSet: { seenBy: currentUser._id } }
      );
    }

    const messages = await Message.find({ 
      conversationId,
      deletedFor: { $ne: currentUser?._id } 
    })
      .populate("senderId", "name avatar clerkId userId")
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { conversationId } = await params;
    const { text, expiresIn } = await req.json();

    if (!text?.trim()) return new NextResponse("Message required", { status: 400 });

    await connectToDatabase();
    const sender = await User.findOne({ clerkId: userId });
    if (!sender) return new NextResponse("User not found", { status: 404 });

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    const newMessage = await Message.create({
      senderId: sender._id,
      conversationId,
      text: text.trim(),
      type: "private",
      expiresAt,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: Date.now(),
    });

    const populated = await Message.findById(newMessage._id).populate(
      "senderId",
      "name avatar clerkId userId"
    );

    return NextResponse.json(populated);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
