// /lib/twitter.ts
import { TwitterApi } from "twitter-api-v2";
import { getSession } from "./session";
import { type NextRequest } from "next/server";

interface TwitterTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export async function getTwitterClient(
  tokens: string,
  req?: NextRequest
): Promise<TwitterApi> {
  try {
    const parsedTokens: TwitterTokens = JSON.parse(tokens);

    // Check if token needs refresh
    if (Date.now() >= parsedTokens.expiresAt && parsedTokens.refreshToken) {
      const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      });

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = await client.refreshOAuth2Token(parsedTokens.refreshToken);

      // Update tokens
      parsedTokens.accessToken = newAccessToken;
      parsedTokens.refreshToken = newRefreshToken;
      parsedTokens.expiresAt = Date.now() + expiresIn * 1000;

      // Update session if request is provided
      if (req) {
        const session = await getSession(req);
        await session.update("twitter_tokens", JSON.stringify(parsedTokens));
      }
    }

    return new TwitterApi(parsedTokens.accessToken);
  } catch (error) {
    console.error("Error getting Twitter client:", error);
    throw new Error("Failed to initialize Twitter client");
  }
}
