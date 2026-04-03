import connectToDatabase from "@/lib/mongodb";
import Room from "@/models/Room";
import User from "@/models/User";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/id";
import Conversation from "@/models/Conversation";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "public";
    const roomId = searchParams.get("roomId");

    await connectToDatabase();

    if (roomId) {
      const room = await Room.findOne({ roomId }).populate("createdBy", "name avatar userId");
      if (!room) return new NextResponse("Room not found", { status: 404 });
      return NextResponse.json(room);
    }

    const rooms = await Room.find({ type }).populate("createdBy", "name avatar userId");
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("[ROOMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { name, type, password } = await req.json();

    await connectToDatabase();
    let creator = await User.findOne({ clerkId: clerkUserId });

    // Self-Repair: If user exists in Clerk but not in DB, sync now
    if (!creator) {
      const user = await currentUser();
      if (!user) return new NextResponse("User not found in Clerk", { status: 404 });

      const email = user.emailAddresses[0]?.emailAddress;
      const genId = generateId("USER");

      creator = await User.findOneAndUpdate(
        { $or: [{ clerkId: user.id }, { email: email || "" }] },
        {
          clerkId: user.id,
          email: email || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "New User",
          avatar: user.imageUrl || `https://ui-avatars.com/api/?name=${user.firstName || "U"}&background=random`,
          $setOnInsert: { userId: genId }
        },
        { upsert: true, new: true }
      );

      // Also ensure self-chat
      await Conversation.findOneAndUpdate(
        { conversationId: `self_${creator.userId}` },
        {
          conversationId: `self_${creator.userId}`,
          participants: [creator._id]
        },
        { upsert: true }
      );
    }

    const prefix = type === "meeting" ? "MEET" : "ROOM";
    const roomId = generateId(prefix);

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const room = await Room.create({
      roomId,
      name,
      type,
      createdBy: creator._id,
      password: hashedPassword,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("[ROOMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
