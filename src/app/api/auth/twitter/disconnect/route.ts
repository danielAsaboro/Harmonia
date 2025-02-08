// /app/api/auth/twitter/disconnect/route.ts
import { NextRequest, NextResponse } from "next/server"; //
import { getSession } from "@/lib/session";
import { getTwitterClient } from "@/lib/twitter";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const tokens = session.get("twitter_session");

    if (!tokens) {
      return NextResponse.json(
        {
          error: "No active Twitter connection",
          details: "No tokens found in the current session",
        },
        { status: 400 }
      );
    }

    let revokeAttempted = false;
    let revokeSuccess = false;

    // Revoke the access token (optional but recommended)
    try {
      const client = await getTwitterClient(tokens);
      await client.revokeOAuth2Token(JSON.parse(tokens).accessToken);
      revokeAttempted = true;
      revokeSuccess = true;
    } catch (revokeError) {
      revokeAttempted = true;
      console.warn("Failed to revoke Twitter token:", revokeError);
    }

    // Clear Twitter tokens from session
    session.set("twitter_tokens", "");

    return NextResponse.json(
      {
        message: "Twitter account disconnected successfully",
        revokeAttempted,
        revokeSuccess,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Comprehensive error disconnecting Twitter:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : "No stack trace",
    });

    return NextResponse.json(
      {
        error: "Failed to disconnect Twitter account",
        details:
          error instanceof Error ? error.message : "Unexpected error occurred",
        errorType: error instanceof Error ? error.name : "Unknown error type",
      },
      { status: 500 }
    );
  }
}
