// app/api/auth/twitter/route.ts
import { TwitterApi } from "twitter-api-v2";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Store states temporarily (in production, use Redis or similar)
const STATE_STORE = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    // Initialize OAuth 1.0a client
    const oauth1Client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
    });

    // Get OAuth 1.0a tokens
    const oauth1AuthLink = await oauth1Client.generateAuthLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/oauth1/callback`,
      { linkMode: "authorize" }
    );

    // Initialize OAuth 2.0 client
    const oauth2Client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    // Generate OAuth 2.0 auth link with PKCE
    const {
      url: oauth2Url,
      state,
      codeVerifier,
    } = oauth2Client.generateOAuth2AuthLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/oauth2/callback`,
      {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      }
    );

    // Store OAuth1 tokens and OAuth2 state
    STATE_STORE.set(state, {
      oauth1Token: oauth1AuthLink.oauth_token,
      oauth1Secret: oauth1AuthLink.oauth_token_secret,
      codeVerifier,
      state,
    });

    // Store state in session
    const session = await getSession(request);

    console.log("about setting twitter session auth state ", state);
    session.set(
      "twitter_auth_state",
      JSON.stringify({
        oauth1Token: oauth1AuthLink.oauth_token,
        oauth1Secret: oauth1AuthLink.oauth_token_secret,
        codeVerifier,
        state,
      })
    );

    // Return the auth URL instead of redirecting
    return NextResponse.json({
      url: oauth1AuthLink.url,
    });
  } catch (error) {
    console.error("Error initiating Twitter auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Twitter authentication" },
      { status: 500 }
    );
  }
}
