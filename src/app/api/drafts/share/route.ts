// /app/api/drafts/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { SharedDraft } from "@/lib/db/schema";
import { addDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweetId, threadId, allowComments } = body;

    // Get user tokens from cookie
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("twitter_session");

    if (!sessionData?.value) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { userData } = JSON.parse(sessionData.value);
    const shareId = uuidv4();
    const expiresAt = addDays(new Date(), 7).toISOString();

    // Create share link using the site's URL
    const shareLink = `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${shareId}`;

    // Create shared draft object
    const sharedDraft: SharedDraft = {
      id: shareId,
      tweetId: tweetId || undefined,
      threadId: threadId || undefined,
      allowComments: allowComments,
      shareLink,
      createdAt: new Date().toISOString(),
      userId: userData.id,
      viewCount: 0,
      expiresAt,
    };

    // Save to database using new method
    db.saveSharedDraft(sharedDraft);

    return NextResponse.json({ shareLink });
  } catch (error) {
    console.error("Error sharing draft:", error);
    return NextResponse.json(
      { error: "Failed to share draft" },
      { status: 500 }
    );
  }
}
