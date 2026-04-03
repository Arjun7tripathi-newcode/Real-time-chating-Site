import connectToDatabase from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { meetingId } = await params;

    await connectToDatabase();
    const meeting = await Meeting.findOne({ meetingId, isActive: true });
    
    if (!meeting) return new NextResponse("Meeting not found", { status: 404 });

    return NextResponse.json(meeting);
  } catch (err) {
    console.error("[MEETING_ID_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
