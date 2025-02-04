// /app/api/auth/twitter/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { getSession } from "@/lib/session";

const CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL!;

interface TwitterTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  const session = await getSession(request);
  const codeVerifier = session.get("codeVerifier");
  const sessionState = session.get("state");

  // Retrieve the return URL from cookies
  const returnUrl =
    request.cookies.get("returnUrl")?.value || "/content/compose/twitter";

  if (!codeVerifier || !state || !sessionState || !code) {
    return new NextResponse("Authentication failed: Missing parameters", {
      status: 400,
    });
  }

  if (state !== sessionState) {
    return new NextResponse("Authentication failed: Invalid state", {
      status: 400,
    });
  }

  try {
    const client = new TwitterApi({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    const { accessToken, refreshToken, expiresIn } =
      await client.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: CALLBACK_URL,
      });

    // Calculate absolute expiry time
    const expiresAt = Date.now() + expiresIn * 1000;

    // Store as JSON string since session only accepts strings
    const tokens: TwitterTokens = {
      accessToken,
      refreshToken,
      expiresAt,
    };

    session.set("twitter_tokens", JSON.stringify(tokens));

    // Redirect to the stored return URL or default
    return NextResponse.redirect(new URL(returnUrl, request.url));
  } catch (error) {
    console.error("Twitter auth error:", error);
    return new NextResponse("Authentication failed: Invalid credentials", {
      status: 403,
    });
  }
}
