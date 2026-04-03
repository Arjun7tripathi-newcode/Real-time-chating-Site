import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/id";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    let dbUser = await User.findOne({ clerkId: clerkUserId });

    // Self-Repair: If user exists in Clerk but not in DB, sync it now
    if (!dbUser) {
      const user = await currentUser();
      if (!user) return new NextResponse("User not found in Clerk", { status: 404 });

      const email = user.emailAddresses[0]?.emailAddress;
      const userId = generateId("USER");

      // Use findOneAndUpdate with upsert to prevent double-insertion crashes
      dbUser = await User.findOneAndUpdate(
        { $or: [{ clerkId: user.id }, { email: email || "" }] },
        {
          clerkId: user.id,
          email: email || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "New User",
          avatar: user.imageUrl || `https://ui-avatars.com/api/?name=${user.firstName || "U"}&background=random`,
          isActive: true,
          $setOnInsert: { userId: userId } // Only set generateId if it is a new insertion
        },
        { upsert: true, new: true }
      );
    } else {
       // If they already exist but aren't active, activate them
       let updated = false;
       if (!dbUser.isActive) {
          dbUser.isActive = true;
          updated = true;
       }
       if (!dbUser.userId) {
          dbUser.userId = generateId("USER");
          updated = true;
       }
       if (updated) {
          await dbUser.save();
       }
    }

    // Ensure self-chat exists (Personal Notes)
    await Conversation.findOneAndUpdate(
      { conversationId: `self_${dbUser.userId}` },
      {
        conversationId: `self_${dbUser.userId}`,
        participants: [dbUser._id],
      },
      { upsert: true }
    );

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("[USER_ME_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
