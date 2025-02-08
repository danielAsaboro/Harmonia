// /app/api/scheduler/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Get user tokens from cookie
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("twitter_session");

    if (!sessionData?.value) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { tokens, userData } = JSON.parse(sessionData.value);

    // First, ensure user tokens exist in database
    try {
      db.saveUserTokens({
        userId: userData.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(tokens.expiresAt).toISOString(),
        username: userData.username,
        name: userData.name,
        profileImageUrl: userData.profile_image_url,
      });
    } catch (error) {
      console.error("Error saving user tokens:", error);
      return NextResponse.json(
        { error: "Failed to save user authentication data" },
        { status: 500 }
      );
    }

    // After ensuring user tokens exist, proceed with content scheduling
    if (type === "thread") {
      const { thread, tweets } = body;

      // Add userId to thread and tweets
      const threadWithUser = {
        ...thread,
        userId: userData.id,
      };

      const tweetsWithUser = tweets.map((tweet: any) => ({
        ...tweet,
        userId: userData.id,
      }));

      try {
        // Save thread to SQLite
        db.saveScheduledThread(threadWithUser);

        // Save all tweets from thread
        for (const tweet of tweetsWithUser) {
          db.saveScheduledTweet(tweet);
        }
      } catch (error) {
        console.error("Error saving thread:", error);
        return NextResponse.json(
          { error: "Failed to save scheduled thread" },
          { status: 500 }
        );
      }
    } else {
      // Save single tweet with userId
      const { tweet } = body;
      const tweetWithUser = {
        ...tweet,
        userId: userData.id,
      };

      try {
        db.saveScheduledTweet(tweetWithUser);
      } catch (error) {
        console.error("Error saving tweet:", error);
        return NextResponse.json(
          { error: "Failed to save scheduled tweet" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error scheduling content:", error);
    return NextResponse.json(
      { error: "Failed to schedule content" },
      { status: 500 }
    );
  }
}
