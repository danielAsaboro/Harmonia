// // /app/api/auth/twitter/authorize/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { TwitterApi } from "twitter-api-v2";
// import { getSession } from "@/lib/session";
// import env from "@/config/env";

// export async function POST(request: NextRequest) {
//   try {
//     const client = new TwitterApi({
//       clientId: env.env.TWITTER_CLIENT_ID,
//       clientSecret: env.env.TWITTER_CLIENT_SECRET,
//     });

//     const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
//       env.env.TWITTER_CALLBACK_URL,
//       {
//         scope: [
//           "tweet.read",
//           "tweet.write",
//           "tweet.moderate.write",
//           "users.read",
//           "follows.read",
//           "follows.write",
//           "offline.access",
//           "like.read",
//           "like.write",
//         ],
//       }
//     );

//     // Store verifier and state in session
//     const session = await getSession(request);
//     session.set("codeVerifier", codeVerifier);
//     session.set("state", state);

//     return NextResponse.json({ url });
//   } catch (error) {
//     console.error("Twitter auth error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to initialize Twitter auth",
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }

// /app/api/auth/twitter/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { getSession } from "@/lib/session";
import env from "@/config/env";

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    if (!env.env.TWITTER_CLIENT_ID || !env.env.TWITTER_CLIENT_SECRET) {
      throw new Error("Missing Twitter OAuth configuration");
    }

    const client = new TwitterApi({
      clientId: env.env.TWITTER_CLIENT_ID,
      clientSecret: env.env.TWITTER_CLIENT_SECRET,
    });

    // Generate OAuth2 authentication link with comprehensive scopes
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      env.env.TWITTER_CALLBACK_URL,
      {
        scope: [
          "tweet.read",
          "tweet.write",
          "tweet.moderate.write",
          "users.read",
          "follows.read",
          "follows.write",
          "offline.access",
          "like.read",
          "like.write",
        ],
      }
    );

    // Store verifier and state in session with enhanced validation
    const session = await getSession(request);
    if (!codeVerifier || !state) {
      throw new Error("Failed to generate authentication parameters");
    }

    session.set("codeVerifier", codeVerifier);
    session.set("state", state);

    // Return the authentication URL
    return NextResponse.json({
      url,
      message: "Twitter authentication link generated successfully",
    });
  } catch (error) {
    console.error("Twitter auth initialization error:", error);

    // Provide detailed error response
    return NextResponse.json(
      {
        error: "Failed to initialize Twitter authentication",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
