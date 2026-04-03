import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) return NextResponse.json([]);

    await connectToDatabase();

    // MongoDB search:
    // 1. Exact match priority for userId
    // 2. Partial match for name (regex)
    // 3. Partial match for userId (regex)

    // Find users excluding the current user
    const users = await User.find({
      $and: [
        { clerkId: { $ne: clerkUserId } },
        {
          $or: [
            { userId: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).limit(20);

    // Exact match sorting (bring exact matches to top)
    const sortedUsers = users.sort((a: any, b: any) => {
      const q = query.toLowerCase();
      const aExact = (a.userId?.toLowerCase() === q) || (a.name?.toLowerCase() === q);
      const bExact = (b.userId?.toLowerCase() === q) || (b.name?.toLowerCase() === q);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json(sortedUsers);
  } catch (error) {
    console.error("[SEARCH_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
