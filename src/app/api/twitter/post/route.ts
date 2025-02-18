// app/api/twitter/post/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getMediaIdsTuple,
  getTwitterClient,
  uploadTwitterMedia,
} from "@/lib/twitter";
import { getSession } from "@/lib/session";

interface TweetData {
  content: string;
  mediaContent?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Get auth tokens from session
    const session = await getSession(request);
    const tokens = session.get("twitter_session");
    if (!tokens) {
      return NextResponse.json(
        { error: "Not authenticated with Twitter" },
        { status: 401 }
      );
    }

    // Can be a single tweet or array of tweets for thread
    const data = await request.json();
    // console.dir(data, { depth: null });
    const tweets: TweetData[] = Array.isArray(data) ? data : [data];

    // Initialize Twitter clients
    const { v1Client, v2Client } = await getTwitterClient(tokens, request);

    let previousTweetId: string | undefined;
    const postedTweets = [];

    // Post tweets sequentially
    for (const tweet of tweets) {
      let mediaIds: string[] = [];

      // Upload media if present using v1 client
      if (tweet.mediaContent && tweet.mediaContent.length > 0) {
        mediaIds = await Promise.all(
          tweet.mediaContent.map((mediaItem: string) =>
            uploadTwitterMedia(v1Client, mediaItem)
          )
        );
      }

      // Post tweet using v2 client
      const postedTweet = await v2Client.v2.tweet(tweet.content, {
        media:
          mediaIds.length > 0
            ? getMediaIdsTuple(mediaIds.slice(0, 4))
            : undefined,
        reply: previousTweetId
          ? {
              in_reply_to_tweet_id: previousTweetId,
            }
          : undefined,
      });

      previousTweetId = postedTweet.data.id;
      postedTweets.push(postedTweet);
    }

    // TODO: update the status in the db;
    // and console and ensure uptodate data

    return NextResponse.json(postedTweets);
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    return NextResponse.json(
      { error: "Failed to post to Twitter" },
      { status: 500 }
    );
  }
}
