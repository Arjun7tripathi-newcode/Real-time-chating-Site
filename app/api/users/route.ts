import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET /api/users?userId=USER_ABC123 → search by short userId
// GET /api/users → list all users except current
export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    await connectToDatabase();

    if (userId) {
      const user = await User.findOne({ userId }).select(
        "name userId avatar isOnline lastSeen _id"
      );
      if (!user) return new NextResponse("User not found", { status: 404 });
      return NextResponse.json(user);
    }

    const users = await User.find({ clerkId: { $ne: clerkUserId } }).select(
      "name userId avatar isOnline lastSeen"
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
