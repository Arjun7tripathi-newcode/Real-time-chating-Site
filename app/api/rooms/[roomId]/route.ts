import connectToDatabase from "@/lib/mongodb";
import Room from "@/models/Room";
import Message from "@/models/Message";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// POST /api/rooms/[roomId] → Verify & get room info
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { password } = await req.json();
    const { roomId } = await params;

    await connectToDatabase();
    const room = await Room.findOne({ roomId }).populate("createdBy", "name avatar userId");
    if (!room) return new NextResponse("Room not found", { status: 404 });

    if (room.password) {
      if (!password) return new NextResponse("Password required", { status: 403 });
      const isMatch = await bcrypt.compare(password, room.password);
      if (!isMatch) return new NextResponse("Invalid password", { status: 403 });
    }

    const roomObj = room.toObject();
    delete roomObj.password;
    return NextResponse.json(roomObj);
  } catch (error) {
    console.error("[ROOM_JOIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET /api/rooms/[roomId] → Fetch messages for a room
export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { roomId } = await params;

    await connectToDatabase();
    const room = await Room.findOne({ roomId });
    if (!room) return new NextResponse("Room not found", { status: 404 });

    const messages = await Message.find({ roomId: room._id })
      .populate("senderId", "name avatar userId clerkId")
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[ROOM_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT /api/rooms/[roomId] → Save a message to a room
export async function PUT(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { text, expiresIn } = body;
    const { roomId } = await params;

    await connectToDatabase();

    const currentUser = await User.findOne({ clerkId: clerkUserId });
    if (!currentUser) return new NextResponse("User not found", { status: 404 });

    const room = await Room.findOne({ roomId });
    if (!room) return new NextResponse("Room not found", { status: 404 });

    let expiresAt: Date | undefined;
    if (expiresIn && typeof expiresIn === 'number') {
       expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    const newMessage = await Message.create({
      roomId: room._id,
      senderId: currentUser._id,
      text,
      type: "public",
      seenBy: [currentUser._id],
      expiresAt,
    });

    const populated = await Message.findById(newMessage._id).populate(
      "senderId",
      "name avatar userId clerkId"
    );

    return NextResponse.json(populated);
  } catch (error) {
    console.error("[ROOM_MESSAGE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
