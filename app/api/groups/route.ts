import connectToDatabase from "@/lib/mongodb";
import PrivateGroup from "@/models/PrivateGroup";
import User from "@/models/User";
import GroupMessage from "@/models/GroupMessage";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/id";

// POST /api/groups — Create a private group
export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { name, userIds } = await req.json(); // userIds = short userId strings

    if (!Array.isArray(userIds) || userIds.length < 1) {
      return new NextResponse("Provide at least 1 other user ID", { status: 400 });
    }

    await connectToDatabase();

    const creator = await User.findOne({ clerkId: clerkUserId });
    if (!creator) return new NextResponse("User not found", { status: 404 });

    // Deduplicate and exclude creator
    const uniqueIds = [...new Set(userIds)].filter((id) => id !== creator.userId);

    if (uniqueIds.length < 1) {
      return new NextResponse("You need at least 1 other participant", { status: 400 });
    }
    if (uniqueIds.length > 9) {
      return new NextResponse("Maximum 9 additional users (10 total)", { status: 400 });
    }

    // Resolve all user documents
    const resolvedUsers = await User.find({ userId: { $in: uniqueIds } });
    if (resolvedUsers.length !== uniqueIds.length) {
      const notFound = uniqueIds.filter(
        (id) => !resolvedUsers.some((u) => u.userId === id)
      );
      return new NextResponse(
        `Users not found: ${notFound.join(", ")}`,
        { status: 404 }
      );
    }

    const participantIds = [creator._id, ...resolvedUsers.map((u) => u._id)];
    const privateChatId = generateId("PVT");

    const group = await PrivateGroup.create({
      privateChatId,
      name: name?.trim() || `Group · ${creator.name}`,
      participants: participantIds,
      createdBy: creator._id,
    });

    const populated = await PrivateGroup.findById(group._id).populate(
      "participants",
      "name avatar userId clerkId isOnline"
    );

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET /api/groups — List my private groups
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const me = await User.findOne({ clerkId: clerkUserId });
    if (!me) return NextResponse.json([]);

    const groups = await PrivateGroup.find({ participants: me._id })
      .populate("participants", "name avatar userId clerkId isOnline")
      .populate({ path: "lastMessage", select: "text createdAt" })
      .sort({ updatedAt: -1 });

    const groupsWithUnread = await Promise.all(groups.map(async (group: any) => {
      const unreadCount = await GroupMessage.countDocuments({
        privateChatId: group.privateChatId,
        senderId: { $ne: me._id },
        seenBy: { $ne: me._id }
      });
      return {
        ...group.toObject(),
        unreadCount
      };
    }));

    return NextResponse.json(groupsWithUnread);
  } catch (error) {
    console.error("[GROUPS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
