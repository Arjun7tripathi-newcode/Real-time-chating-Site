import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const channelName = searchParams.get("channelName");

    if (!channelName) {
      return new NextResponse("Channel name is required", { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "PLACEHOLDER_APP_ID";
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || "PLACEHOLDER_APP_CERTIFICATE";
    
    // User can join as publisher
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTimestamp = currentTimestamp + expirationTimeInSeconds;

    // Use string userId for uid (Agora supports integer or string, but string is safer for our system)
    // Actually Agora RTC SDK NG uses integer UID by default for the token builder. 
    // If we want string UID we should use the appropriate builder. 
    // For simplicity, let's use a random integer for the token for now.
    const uid = 0; // 0 allows any UID

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTimestamp
    );

    return NextResponse.json({ token, uid, appId });
  } catch (err) {
    console.error("[AGORA_TOKEN]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
