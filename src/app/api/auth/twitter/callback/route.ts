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
  console.log("🔍 Callback Route Hit");
  console.log("Full URL:", request.url);

  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  console.log("URL Parameters:", { state, code });

  const session = await getSession(request);

  console.log(
    "Session Methods Available:",
    !!session.get,
    !!session.set,
    !!session.update
  );

  const codeVerifier = session.get("codeVerifier");
  const sessionState = session.get("state");

  console.log("Session Data:", {
    codeVerifier: codeVerifier ? "PRESENT" : "MISSING",
    sessionState: sessionState ? "PRESENT" : "MISSING",
  });

  // Retrieve the return URL from cookies
  const returnUrl =
    request.cookies.get("returnUrl")?.value || "/content/compose/twitter";

  console.log("Return URL:", returnUrl);

  if (!codeVerifier || !state || !sessionState || !code) {
    console.error("❌ Authentication Failed: Missing Parameters", {
      codeVerifier: !!codeVerifier,
      state: !!state,
      sessionState: !!sessionState,
      code: !!code,
    });

    return new NextResponse("Authentication failed: Missing parameters", {
      status: 400,
    });
  }

  if (state !== sessionState) {
    console.error("❌ State Mismatch", {
      expectedState: sessionState,
      receivedState: state,
    });

    return new NextResponse("Authentication failed: Invalid state", {
      status: 400,
    });
  }

  try {
    console.log("🔐 Attempting OAuth Login");

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

    console.log("🎉 OAuth Login Successful");

    // Calculate absolute expiry time
    const expiresAt = Date.now() + expiresIn * 1000;

    // Store as JSON string since session only accepts strings
    const tokens: TwitterTokens = {
      accessToken,
      refreshToken,
      expiresAt,
    };

    await session.update("twitter_tokens", JSON.stringify(tokens));

    console.log("🔐 Tokens Updated in Session");

    // Redirect to the stored return URL or default
    const redirectUrl = new URL(returnUrl, request.url);
    console.log("🚀 Redirecting to:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    return new NextResponse("Authentication failed: Invalid credentials", {
      status: 403,
    });
  }
}
