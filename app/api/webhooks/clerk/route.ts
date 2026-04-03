import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import { generateId } from "@/lib/id";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  await connectToDatabase();

  if (eventType === "user.created") {
    const { id, first_name, last_name, image_url, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        clerkId: id,
        name,
        email,
        avatar: image_url,
        $setOnInsert: { 
          userId: generateId("USER"),
          isActive: false 
        },
      },
      { upsert: true, new: true }
    );

    // Auto-create self chat (personal notes)
    await Conversation.findOneAndUpdate(
      { conversationId: `self_${user.userId}` },
      {
        conversationId: `self_${user.userId}`,
        participants: [user._id],
      },
      { upsert: true, new: true }
    );
  }

  if (eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    await User.findOneAndUpdate(
      { clerkId: id },
      {
        name,
        email,
        avatar: image_url,
      },
      { new: true }
    );
  }

  if (eventType === "user.deleted") {
    await User.findOneAndDelete({ clerkId: id });
  }

  return new Response("", { status: 200 });
}
