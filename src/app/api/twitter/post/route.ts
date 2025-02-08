// /app/api/twitter/post/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTwitterClient } from "@/lib/twitter";
import { getSession } from "@/lib/session";

interface TweetData {
  content: string;
  media?: string[];
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
    const tweets: TweetData[] = Array.isArray(data) ? data : [data];

    // Initialize Twitter client
    const client = await getTwitterClient(tokens);

    let previousTweetId: string | undefined;
    const postedTweets = [];

    // Post tweets sequentially
    for (const tweet of tweets) {
      let mediaIds: string[] = [];

      // Upload media if present
      if (tweet.media && tweet.media.length > 0) {
        mediaIds = await Promise.all(
          tweet.media.map(async (mediaItem: string) => {
            // Remove data:image/jpeg;base64, prefix
            const base64Data = mediaItem.split(";base64,").pop() || "";
            const buffer = Buffer.from(base64Data, "base64");

            // Determine media type
            const mediaType = mediaItem.split(";")[0].split("/")[1];

            // Upload to Twitter
            const mediaResponse = await client.v1.uploadMedia(buffer, {
              mimeType: `image/${mediaType}`,
            });

            return mediaResponse;
          })
        );
      }

      // Helper function to convert array to correct tuple type
      const getMediaIdsTuple = (ids: string[]) => {
        const mediaCount = ids.length;
        if (mediaCount === 1) return { media_ids: [ids[0]] as [string] };
        if (mediaCount === 2)
          return { media_ids: [ids[0], ids[1]] as [string, string] };
        if (mediaCount === 3)
          return {
            media_ids: [ids[0], ids[1], ids[2]] as [string, string, string],
          };
        if (mediaCount === 4)
          return {
            media_ids: [ids[0], ids[1], ids[2], ids[3]] as [
              string,
              string,
              string,
              string
            ],
          };
        return undefined;
      };

      // Post tweet
      const postedTweet = await client.v2.tweet(tweet.content, {
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

    return NextResponse.json(postedTweets);
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    return NextResponse.json(
      { error: "Failed to post to Twitter" },
      { status: 500 }
    );
  }
}
