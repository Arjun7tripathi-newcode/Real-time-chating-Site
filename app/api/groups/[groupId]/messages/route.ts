import connectToDatabase from "@/lib/mongodb";
import PrivateGroup from "@/models/PrivateGroup";
import GroupMessage from "@/models/GroupMessage";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET /api/groups/[groupId]/messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });
    const { groupId } = await params;

    await connectToDatabase();
    const me = await User.findOne({ clerkId: clerkUserId });
    if (!me) return new NextResponse("User not found", { status: 404 });

    const group = await PrivateGroup.findOne({ privateChatId: groupId });
    if (!group) return new NextResponse("Group not found", { status: 404 });

    const isMember = group.participants.some(
      (p: any) => p.toString() === me._id.toString()
    );
    if (!isMember) return new NextResponse("Not a member", { status: 403 });

    // Mark group messages as seen
    await GroupMessage.updateMany(
      { privateChatId: groupId, senderId: { $ne: me._id }, seenBy: { $ne: me._id } },
      { $addToSet: { seenBy: me._id } }
    );

    const messages = await GroupMessage.find({ 
      privateChatId: groupId,
      deletedFor: { $ne: me?._id }
    })
      .populate("senderId", "name avatar userId clerkId")
      .populate("seenBy", "name userId")
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[GROUP_MESSAGES_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/groups/[groupId]/messages
export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });
    const { groupId } = await params;
    const { text, expiresIn } = await req.json();

    if (!text?.trim()) return new NextResponse("Message required", { status: 400 });

    await connectToDatabase();
    const me = await User.findOne({ clerkId: clerkUserId });
    if (!me) return new NextResponse("User not found", { status: 404 });

    const group = await PrivateGroup.findOne({ privateChatId: groupId });
    if (!group) return new NextResponse("Group not found", { status: 404 });

    const isMember = group.participants.some(
      (p: any) => p.toString() === me._id.toString()
    );
    if (!isMember) return new NextResponse("Not a member", { status: 403 });

    let expiresAt: Date | undefined;
    if (expiresIn && typeof expiresIn === 'number') {
       expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    const message = await GroupMessage.create({
      senderId: me._id,
      privateChatId: groupId,
      text: text.trim(),
      seenBy: [me._id],
      expiresAt,
    });

    // Update lastMessage on group
    await PrivateGroup.findByIdAndUpdate(group._id, {
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    const populated = await GroupMessage.findById(message._id)
      .populate("senderId", "name avatar userId clerkId")
      .populate("seenBy", "name userId");

    return NextResponse.json(populated);
  } catch (err) {
    console.error("[GROUP_MESSAGES_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
