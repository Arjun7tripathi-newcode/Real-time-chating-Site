import connectToDatabase from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/id";

// GET /api/meetings
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const meetings = await Meeting.find({
      $or: [{ createdBy: user._id }, { participants: user._id }],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(meetings);
  } catch (err) {
    console.error("[MEETINGS_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/meetings
export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { title } = body;

    await connectToDatabase();
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const meetingId = generateId("MEET");

    const meeting = await Meeting.create({
      meetingId,
      title: title || "Protocol Session",
      createdBy: user._id,
      participants: [user._id],
    });

    return NextResponse.json(meeting);
  } catch (err) {
    console.error("[MEETINGS_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
