// /app/api/drafts/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { DraftTweet, DraftThread } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, tweet, thread, tweets } = body;

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

    try {
      const isThread = type === "thread";

      if (isThread && thread) {
        // Format thread data
        const draftThread: DraftThread = {
          ...thread,
          status: "draft",
          userId: userData.id,
        };

        // Format tweets data
        const draftTweets: DraftTweet[] = tweets.map((tweet: any) => ({
          ...tweet,
          status: "draft",
          userId: userData.id,
        }));

        // Save draft thread and its tweets
        db.saveDraftThread(draftThread, draftTweets);
      } else {
        // Save single draft tweet
        const draftTweet: DraftTweet = {
          ...tweet,
          status: "draft",
          userId: userData.id,
        };

        db.saveDraftTweet(draftTweet);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error saving draft:", error);
      return NextResponse.json(
        { error: "Failed to save draft" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
