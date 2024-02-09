// src/app/api/drafts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { fileStorage } from "@/lib/storage/fileStorage";

async function getUserData(request: NextRequest): Promise<{
  userId: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
  userData: {
    id: string;
    name: string;
    username: string;
  };
} | null> {
  const session = await getSession(request);
  const twitterSession = session.get("twitter_session");

  if (!twitterSession) return null;

  try {
    const sessionData = JSON.parse(twitterSession);
    if (!sessionData.userData?.id || !sessionData.tokens) return null;

    return {
      userId: sessionData.userData.id,
      tokens: sessionData.tokens,
      userData: sessionData.userData,
    };
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userData = await getUserData(req);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user tokens exist in the database
    db.saveUserTokens({
      userId: userData.userId,
      accessToken: userData.tokens.accessToken,
      refreshToken: userData.tokens.refreshToken,
      expiresAt: userData.tokens.expiresAt,
      username: userData.userData.username,
      name: userData.userData.name,
    });

    const body = await req.json();
    const { type, data } = body;
    const now = new Date().toISOString();

    if (type === "tweet") {
      const tweet = {
        ...data,
        userId: userData.userId,
        createdAt: data.createdAt || now,
        updatedAt: now,
      };

      db.saveDraftTweet(tweet);
      return NextResponse.json(tweet);
    }

    if (type === "thread") {
      const thread = {
        ...data,
        userId: userData.userId,
        createdAt: data.createdAt || now,
        updatedAt: now,
      };

      const tweets = data.tweets.map((tweet: any) => ({
        ...tweet,
        userId: userData.userId,
        createdAt: tweet.createdAt || now,
        updatedAt: now,
      }));

      db.saveDraftThread(thread, tweets);
      return NextResponse.json({ thread, tweets });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userData = await getUserData(req);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (type === "tweet" && id) {
      const tweet = db.getDraftTweet(id, userData.userId);
      return NextResponse.json(tweet);
    }

    if (type === "thread" && id) {
      const thread = db.getDraftThread(id, userData.userId);
      return NextResponse.json(thread);
    }

    // If no specific id, return all drafts
    const tweets = db.getUserDraftTweets(userData.userId);
    const threads = db.getUserDraftThreads(userData.userId);

    return NextResponse.json({ tweets, threads });
  } catch (error) {
    console.error("Error getting drafts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userData = await getUserData(req);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const cleanup = searchParams.get("cleanup") === "true";

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing type or id" },
        { status: 400 }
      );
    }

    if (type === "tweet") {
      if (cleanup) {
        // Get tweet's media IDs before deletion
        const tweet = db.getDraftTweet(id, userData.userId);

        if (tweet && tweet.mediaIds) {
          // Delete media files
          await Promise.allSettled(
            // JSON.parse(tweet.mediaIds)
            tweet.mediaIds.map((mediaId: string) =>
              fileStorage.deleteFile(userData.userId, mediaId)
            )
          );
        }
      }
      db.deleteDraftTweet(id, userData.userId);
    } else if (type === "thread") {
      if (cleanup) {
        // Get all tweets in thread and their media before deletion
        const threadData = db.getDraftThread(id, userData.userId);
        if (threadData) {
          const mediaIds = threadData.tweets
            .map((tweet) => JSON.stringify(tweet.mediaIds || "[]"))
            .flat();

          // Delete all media files
          await Promise.allSettled(
            mediaIds.map((mediaId) =>
              fileStorage.deleteFile(userData.userId, mediaId)
            )
          );
        }
      }
      db.deleteDraftThread(id, userData.userId);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
