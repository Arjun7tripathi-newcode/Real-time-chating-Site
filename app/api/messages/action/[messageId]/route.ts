import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import GroupMessage from "@/models/GroupMessage";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";

const EDIT_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { messageId } = await params;
    const { text } = await req.json();

    if (!text?.trim()) return new NextResponse("Text required", { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ clerkId: clerkUserId });
    
    let message = await Message.findById(messageId);
    if (!message) {
      message = await GroupMessage.findById(messageId);
    }

    if (!message) return new NextResponse("Message not found", { status: 404 });

    // Validate Sender
    if (message.senderId.toString() !== user?._id.toString()) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate Time Limit
    const now = new Date();
    const sentAt = new Date(message.createdAt);
    if (now.getTime() - sentAt.getTime() > EDIT_TIME_LIMIT) {
      return new NextResponse("Edit time limit exceeded", { status: 400 });
    }

    // Update
    message.text = text.trim();
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Use toObject to avoid Mongoose weirdness for the return
    const populated = await (message.constructor === Message 
      ? Message.findById(messageId).populate("senderId", "name avatar clerkId userId")
      : GroupMessage.findById(messageId).populate("senderId", "name avatar clerkId userId")
    );

    return NextResponse.json(populated);
  } catch (error) {
    console.error("[MESSAGE_EDIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { messageId } = await params;
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "everyone"; // "everyone" or "me"

    await connectToDatabase();
    const user = await User.findOne({ clerkId: clerkUserId });
    
    let message = await Message.findById(messageId);
    if (!message) {
      message = await GroupMessage.findById(messageId);
    }

    if (!message) return new NextResponse("Message not found", { status: 404 });

    if (mode === "everyone") {
      // Validate Sender for Delete for Everyone
      if (message.senderId.toString() !== user?._id.toString()) {
        return new NextResponse("Unauthorized to delete for everyone", { status: 401 });
      }
      message.isDeleted = true;
      message.text = "This message was deleted";
    } else {
      // Delete for ME (hide from current user)
      if (!message.deletedFor) message.deletedFor = [];
      if (!message.deletedFor.includes(user?._id)) {
        message.deletedFor.push(user?._id);
      }
    }

    await message.save();
    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
