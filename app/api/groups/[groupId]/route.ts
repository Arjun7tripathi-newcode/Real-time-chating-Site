import connectToDatabase from "@/lib/mongodb";
import PrivateGroup from "@/models/PrivateGroup";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Helper: verify caller is a participant
async function getGroupAndVerify(privateChatId: string, clerkUserId: string) {
  const me = await User.findOne({ clerkId: clerkUserId });
  if (!me) return { error: "User not found", status: 404 };

  const group = await PrivateGroup.findOne({ privateChatId }).populate(
    "participants",
    "name avatar userId clerkId isOnline"
  );
  if (!group) return { error: "Group not found", status: 404 };

  const isMember = group.participants.some(
    (p: any) => p.clerkId === clerkUserId
  );
  if (!isMember) return { error: "Not a member", status: 403 };

  return { me, group };
}

// GET /api/groups/[groupId] — Group info
export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });
    const { groupId } = await params;

    await connectToDatabase();
    const result = await getGroupAndVerify(groupId, clerkUserId);
    if ("error" in result) return new NextResponse(result.error, { status: result.status });

    return NextResponse.json(result.group);
  } catch (err) {
    console.error("[GROUP_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/groups/[groupId] — Rename / add member / remove member
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });
    const { groupId } = await params;
    const body = await req.json();

    await connectToDatabase();
    const result = await getGroupAndVerify(groupId, clerkUserId);
    if ("error" in result) return new NextResponse(result.error, { status: result.status });

    const { me, group } = result;
    const isCreator = group.createdBy.toString() === me._id.toString();

    // ── Rename ──────────────────────────────────────────────────
    if (body.name !== undefined) {
      group.name = body.name.trim();
      await group.save();
      return NextResponse.json(group);
    }

    // ── Add member (creator only) ────────────────────────────────
    if (body.addUserId) {
      if (!isCreator) return new NextResponse("Only creator can add members", { status: 403 });
      if (group.participants.length >= 10) {
        return new NextResponse("Maximum 10 members reached", { status: 400 });
      }
      const newUser = await User.findOne({ userId: body.addUserId });
      if (!newUser) return new NextResponse("User not found", { status: 404 });

      const alreadyIn = group.participants.some((p: any) => p._id.toString() === newUser._id.toString());
      if (alreadyIn) return new NextResponse("Already a member", { status: 400 });

      group.participants.push(newUser._id);
      await group.save();
      const updated = await PrivateGroup.findById(group._id).populate("participants", "name avatar userId clerkId isOnline");
      return NextResponse.json(updated);
    }

    // ── Remove member (creator only) ─────────────────────────────
    if (body.removeUserId) {
      if (!isCreator) return new NextResponse("Only creator can remove members", { status: 403 });
      const target = await User.findOne({ userId: body.removeUserId });
      if (!target) return new NextResponse("User not found", { status: 404 });

      group.participants = group.participants.filter(
        (p: any) => p._id.toString() !== target._id.toString()
      );
      if (group.participants.length < 2) {
        return new NextResponse("Group must have at least 2 members", { status: 400 });
      }
      await group.save();
      const updated = await PrivateGroup.findById(group._id).populate("participants", "name avatar userId clerkId isOnline");
      return NextResponse.json(updated);
    }

    return new NextResponse("No valid action", { status: 400 });
  } catch (err) {
    console.error("[GROUP_PATCH]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/groups/[groupId] — Leave group
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });
    const { groupId } = await params;

    await connectToDatabase();
    const result = await getGroupAndVerify(groupId, clerkUserId);
    if ("error" in result) return new NextResponse(result.error, { status: result.status });

    const { me, group } = result;

    group.participants = group.participants.filter(
      (p: any) => p._id.toString() !== me._id.toString()
    );

    if (group.participants.length < 1) {
      await PrivateGroup.findByIdAndDelete(group._id);
      return NextResponse.json({ message: "Group deleted (last member left)" });
    }

    await group.save();
    return NextResponse.json({ message: "Left group" });
  } catch (err) {
    console.error("[GROUP_DELETE]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
