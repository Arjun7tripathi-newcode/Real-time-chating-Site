import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import GroupMessage from "@/models/GroupMessage";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { messageId } = await params;

    let emoji;
    try {
      const body = await req.json();
      emoji = body?.emoji;
    } catch (e) {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }

    if (!emoji) return new NextResponse("Emoji required", { status: 400 });

    await connectToDatabase();
    const me = await User.findOne({ clerkId: clerkUserId });
    if (!me) return new NextResponse("User not found", { status: 404 });

    let message = await Message.findById(messageId);

    if (!message) {
      message = await GroupMessage.findById(messageId);
    }

    if (!message) return new NextResponse("Message not found", { status: 404 });

    // Ensure reactions array exists
    if (!message.reactions) {
      message.reactions = [];
    }

    // Toggle reaction logic
    const existingReactionIndex = message.reactions.findIndex(
      (r: any) => r.userId.toString() === me._id.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ emoji, userId: me._id });
    }

    await message.save();

    return NextResponse.json(message);
  } catch (err) {
    console.error("[REACTION_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
